
async function listModels() {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    let apiKey;
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
        }
    } catch (e) { }

    if (!apiKey) {
        console.error("No API Key found in .env");
        return;
    }

    // Mask key for safety
    console.log(`Using API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);

    // Direct REST API check
    try {
        console.log("Checking via REST API for available models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            console.error(`REST API Failed: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
        } else {
            const data = await response.json();
            console.log("Available Models:");
            if (data.models) {
                data.models.forEach(m => {
                    // if (m.name.includes("gemini")) {
                    console.log(` - ${m.name} [${m.supportedGenerationMethods.join(', ')}]`);
                    // }
                });
            } else {
                console.log("No models returned in list.");
            }
        }
    } catch (error) {
        console.error("REST API Error:", error);
    }
}

listModels();
