import { generateObject } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

const moduleSchema = z.object({
  moduleName: z.string(),
  estimatedWeightage: z.number(),
  aiDifficultyScore: z.number().min(1).max(5),
  topics: z.array(
    z.object({
      topicName: z.string(),
      requiredStudyTimeHrs: z.number(),
    })
  ),
})

const roadmapOutputSchema = z.object({
  modules: z.array(moduleSchema),
})

export async function POST(req: Request) {
  try {
    const { syllabusText, examDate, dailyHours, name, apiKey } = await req.json()
    console.log("Generating roadmap for:", { name, examDate, hasSyllabus: !!syllabusText, hasApiKey: !!apiKey })

    let apiKeyToUse = apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    // Fallback: try to read .env file manually if env var is missing (sometimes happens in dev mode hmr)
    if (!apiKeyToUse) {
      console.log("Attempting to read .env file manually")
      try {
        const fs = require('fs')
        const path = require('path')
        const envPath = path.join(process.cwd(), '.env')
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf-8')
          const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/)
          if (match && match[1]) {
            apiKeyToUse = match[1].trim()
            console.log("Read API Key from .env file directly")
          }
        }
      } catch (err) {
        console.error("Failed to read .env file:", err)
      }
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKeyToUse,
    })

    // Check if API key is available
    if (!apiKeyToUse) {
      console.error("No API Key provided")
      return Response.json(
        { error: "Gemini API key is required. Setup GOOGLE_GENERATIVE_AI_API_KEY in .env or pass apiKey in request." },
        { status: 400 }
      )
    }

    const daysUntilExam = Math.max(
      1,
      Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    )

    const prompt = `You are an expert academic study planner. Analyze the following syllabus and create a structured study plan.

SYLLABUS:
${syllabusText}

CONSTRAINTS:
- Exam name: ${name}
- Exam date: ${examDate} (${daysUntilExam} days from now)
- Daily available study hours: ${dailyHours}
- Total available study hours: ${daysUntilExam * dailyHours}

INSTRUCTIONS:
1. Break the syllabus into logical modules (major sections/subjects)
2. Break each module into specific topics
3. Assign estimated weightage (percentage importance, all modules should sum to ~100)
4. Assign AI difficulty scores (1-5, where 5 is hardest)
5. Assign required study time for each topic in hours (be realistic, harder topics need more time)
6. Ensure total required time fits within the available hours
7. Create between 3-8 modules and 2-6 topics per module

Return a well-structured study plan with modules and topics.`

    try {
      console.log("Attempting generation with gemini-1.5-pro")
      const { object } = await generateObject({
        model: google("gemini-1.5-pro"),
        schema: roadmapOutputSchema,
        messages: [{ role: "user", content: prompt }],
      })
      console.log("Roadmap generated successfully with gemini-1.5-pro")
      return Response.json({ roadmap: object })
    } catch (primaryError) {
      console.warn("Primary model failed, attempting fallback to gemini-pro-latest", primaryError)
      try {
        const { object } = await generateObject({
          model: google("gemini-pro-latest"),
          schema: roadmapOutputSchema,
          messages: [{ role: "user", content: prompt }],
        })
        console.log("Roadmap generated successfully with gemini-pro-latest")
        return Response.json({ roadmap: object })
      } catch (fallbackError) {
        throw fallbackError // Rethrow to be caught by outer catch
      }
    }
  } catch (error) {
    console.error("Error generating roadmap:", error)
    return Response.json({ error: "Failed to generate roadmap", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
