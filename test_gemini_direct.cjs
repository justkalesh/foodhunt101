const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

let apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
        }
    } catch (e) { }
}
if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
        }
    } catch (e) { }
}

if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}`);
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`Success! Response: ${response.text()}`);
    } catch (error) {
        console.error(`Failed with ${modelName}:`, error.message);
    }
}

(async () => {
    await testModel("gemini-1.5-flash");
    await testModel("gemini-1.5-flash-001");
    await testModel("gemini-1.5-flash-latest");
})();
