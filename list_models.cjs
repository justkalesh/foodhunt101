
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
    } catch (e) {
        // ignore
    }
}

if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
        }
    } catch (e) {
        // ignore
    }
}

if (!apiKey) {
    console.error("Could not find GEMINI_API_KEY in .env or .env.local");
    process.exit(1);
}

async function listModels() {
    try {
        console.log("Using API Key: " + apiKey.substring(0, 5) + "...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

listModels();
