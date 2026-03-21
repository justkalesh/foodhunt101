import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        'Content-Type': 'application/json',
    };

    try {
        const { userMessage, contextData } = await context.request.json();

        const apiKey = context.env.GEMINI_API_KEY ? context.env.GEMINI_API_KEY.trim() : "";

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error: GEMINI_API_KEY missing.' }), { status: 500, headers: corsHeaders });
        }

        if (!userMessage) {
            return new Response(JSON.stringify({ error: 'userMessage is required' }), { status: 400, headers: corsHeaders });
        }

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

      Rules:
      1. Be friendly and casual (student vibe).
      2. **Menu Queries**: If asked "What is at [Vendor]?", list their menu items.
      3. **Reviews**: Use the reviews to give an honest opinion if asked.
      4. **Splits**: If user asks about joining a group or splitting food, check 'active_splits' and suggest specific ones if available.
      5. Keep answers concise (under 100 words).
    `;

        const result = await model.generateContent([
            systemPrompt,
            "\n\nUser Question: " + userMessage
        ]);
        const response = await result.response;
        const text = response.text();

        return new Response(JSON.stringify({ response: text }), { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Gemini API Error:", error);
        return new Response(JSON.stringify({
            error: 'Failed to generate response.',
            details: error.message
        }), { status: 500, headers: corsHeaders });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
            'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        },
    });
}
