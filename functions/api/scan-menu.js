import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
        'Content-Type': 'application/json',
    };

    try {
        const { imageBase64, mimeType } = await context.request.json();

        const apiKey = context.env.GEMINI_API_KEY ? context.env.GEMINI_API_KEY.trim() : "";

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server configuration error: GEMINI_API_KEY missing.' }), { status: 500, headers: corsHeaders });
        }

        if (!imageBase64) {
            return new Response(JSON.stringify({ error: 'imageBase64 is required' }), { status: 400, headers: corsHeaders });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const systemPrompt = `Analyze this restaurant menu image. Extract all food items. Return ONLY a JSON array with objects.

For each item include:
- 'name': item name
- 'category': Use the SECTION HEADING visible on the menu (e.g., "CHAI", "SNACKS", "PIZZA", "BURGER", "COLD COFFEE"). Look for big/bold text that groups items together. If no heading visible above items, infer a logical category.
- 'price': default price (number only, no currency symbols)
- 'small_price': price for small size (only if menu shows S/M/L or Small/Regular/Large columns)
- 'medium_price': price for medium/regular size (only if menu shows size columns)
- 'large_price': price for large size (only if menu shows size columns)

IMPORTANT for categories:
- Look for SECTION HEADINGS like "CHAI", "SNACKS", "COLD COFFEE", "HOT COFFEE", "PASTA", "PIZZA", "BURGER", "FRENCH FRIES", "SANDWICH", "LASSI", "MAGGI", "MIX VEG ROLLS", "PANEER ROLLS", "CHINESE CUISINE", etc.
- These headings are usually in BIGGER/BOLDER font above a group of items
- Use the EXACT heading text as the category name
- Only infer a category if no visible heading exists for that section

Example output:
[{"name": "Adrak Chai", "category": "CHAI", "price": 0, "small_price": 20, "large_price": 50}]
[{"name": "Corn Chat", "category": "SNACKS", "price": 55}]
[{"name": "Black Cold Coffee", "category": "COLD COFFEE", "price": 50}]

Rules:
- Extract EVERY item visible
- Prices must be numbers only (strip ₹, Rs, $, /-)
- For size columns (S/M/L or Small/Regular/Large), map to small_price, medium_price, large_price
- If item has only one price, use 'price' field
- If no size variants, omit small_price, medium_price, large_price fields
- Return ONLY the JSON array, no markdown`;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType || "image/jpeg"
            }
        };

        const result = await model.generateContent([systemPrompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        // Clean up the response - remove markdown code blocks if present
        text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        // Parse the JSON response
        let menuItems;
        try {
            menuItems = JSON.parse(text);
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", text);
            return new Response(JSON.stringify({
                error: 'Failed to parse menu items from image.',
                rawResponse: text
            }), { status: 500, headers: corsHeaders });
        }

        // Validate and clean the response
        if (!Array.isArray(menuItems)) {
            return new Response(JSON.stringify({ error: 'Invalid response format from AI.' }), { status: 500, headers: corsHeaders });
        }

        // Clean up each item - strip currency symbols and ensure proper types
        const cleanPrice = (val) => {
            if (val === undefined || val === null) return undefined;
            const parsed = parseFloat(String(val).replace(/[₹$Rs,.]/g, ''));
            return isNaN(parsed) ? undefined : parsed;
        };

        const cleanedItems = menuItems.map(item => {
            const cleaned = {
                name: String(item.name || '').trim(),
                category: String(item.category || 'Uncategorized').trim(),
                price: cleanPrice(item.price) || 0
            };
            // Only add size prices if they exist
            if (item.small_price !== undefined) cleaned.small_price = cleanPrice(item.small_price);
            if (item.medium_price !== undefined) cleaned.medium_price = cleanPrice(item.medium_price);
            if (item.large_price !== undefined) cleaned.large_price = cleanPrice(item.large_price);
            return cleaned;
        }).filter(item => item.name); // Remove items without names

        return new Response(JSON.stringify({
            success: true,
            items: cleanedItems,
            count: cleanedItems.length
        }), { status: 200, headers: corsHeaders });

    } catch (error) {
        console.error("Gemini Vision API Error:", error);
        return new Response(JSON.stringify({
            error: 'Failed to analyze menu image.',
            details: error.message,
            errorType: error.constructor.name
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
