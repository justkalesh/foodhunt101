import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // CORS Helper
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : "";

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: GEMINI_API_KEY missing.' });
    }

    const { userMessage, contextData } = req.body;

    if (!userMessage) {
        return res.status(400).json({ error: 'userMessage is required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const systemPrompt = `
      You are 'FoodieBot', the AI assistant for FOOD-HUNT, a campus food discovery app.
      Your goal is to help students find food, suggest meal splits, and answer questions about vendors.
      
      Here is the current LIVE data from the database (JSON format):
      ${contextData || 'No specific data provided.'}

      The data includes:
      - **Vendors**: Locations, cuisines, pricing.
      - **Menu Items**: Specific dishes available at each vendor.
      - **Reviews**: Recent student feedback.
      - **Active Splits**: Open meal split groups users can join.
      - **FAQs**: Frequently Asked Questions.
      - **About**: Information about Food-Hunt and the developer.

      **ABOUT FOOD-HUNT & THE DEVELOPER:**
      - Food-Hunt is built by Kalash Mani Tripathi (goes by "Kalash"), a student at LPU.
      - It's a solo project — just Kalash, his laptop, and AI tools like Gemini and Claude.
      - The app is exclusively for LPU campus right now.
      - Instagram: @foodhunt.app | Email: foodhunt101lpu@gmail.com
      - Food-Hunt does NOT take orders. It connects students to discover food and split meals.

      **FREQUENTLY ASKED QUESTIONS (use these for accurate answers):**
      - "Does splitting mean two plates?" → No, the app connects you to share a meal, but you need to ask the vendor directly for extra plates.
      - "Are prices exact?" → Prices may slightly vary in person. Report outdated prices to @foodhunt101lpu from our chatbot.
      - "Dispute with vendor/user?" → Report with valid proof and the team will look into it.
      - "Do you take orders?" → Not yet! Focus is on connecting people. Pre-order/order integration is planned for later.
      - "Who built this?" → Kalash Mani Tripathi, solo developer, using AI tools.
      - "How does Meal-Split work?" → Post what you want to eat & where, or browse requests. Match with someone, split the bill & the meal.
      - "Only for LPU?" → Yes, exclusively for LPU students right now.
      - "I'm a vendor, how to get listed?" → DM @foodhunt101lpu on Instagram with stall details.

      STRICT Rules:
      1. Be friendly and casual (student vibe). Use emojis sparingly.
      2. **KEEP IT SHORT**: Maximum 2-3 sentences or a short bullet list. NEVER exceed 60 words. No long paragraphs.
      3. **Menu Queries**: If asked "What is at [Vendor]?", list top 5-6 items with prices as a compact bullet list.
      4. **Reviews**: Give a quick one-line honest opinion based on reviews.
      5. **Splits**: If asked about splits, mention 1-2 specific active ones if available.
      6. Do NOT repeat the question back. Do NOT over-explain. Be direct.
      7. **About/FAQ queries**: Answer using the FAQ and About info above. Keep it natural, don't copy-paste.
    `;

        const result = await model.generateContent([
            systemPrompt,
            "\n\nUser Question: " + userMessage
        ]);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ response: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({
            error: 'Failed to generate response.',
            details: error.message
        });
    }
}
