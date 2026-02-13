const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testApiKey() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Re-testing with gemini-flash-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Hi");
        console.log("Response:", (await result.response).text());
    } catch (error) {
        console.error("Flash latest failed:", error.message);
    }
}

testApiKey();
