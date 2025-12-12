
import handler from './api/chat.js';
import fs from 'fs';
import path from 'path';

// Manual Env Loading
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/GEMINI_API_KEY=(.*)/);
            if (match) apiKey = match[1].trim();
        }
    } catch (e) { }
}
process.env.GEMINI_API_KEY = apiKey;

const req = {
    method: 'POST',
    body: {
        userMessage: "Hello",
        contextData: "test context"
    }
};

const res = {
    setHeader: (k, v) => console.log(`[Header] ${k}: ${v}`),
    status: (code) => {
        console.log(`[Status] ${code}`);
        return res;
    },
    json: (data) => {
        console.log(`[JSON]`, data);
        return res;
    },
    end: () => console.log('[End]')
};

console.log("Running Handler Test...");
handler(req, res).catch(err => {
    console.error("Handler Crashed:", err);
});
