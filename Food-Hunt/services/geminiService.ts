import { GoogleGenAI } from "@google/genai";

// WARNING: In a real production app, never expose API keys in frontend code.
// Since this is a demo environment without a backend proxy, we rely on env or prompt user.
// For this output, we assume process.env.API_KEY is available or we handle the error gracefully.

const apiKey = process.env.API_KEY || ''; 

export const generateBotResponse = async (userMessage: string, contextData: string): Promise<string> => {
  if (!apiKey) {
    return "I am currently offline (API Key missing). Please check the codebase.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash";
    
    const systemPrompt = `
      You are 'FoodieBot', the AI assistant for FOOD-HUNT, a campus food discovery app.
      Your goal is to help students find food, suggest meal splits, and answer questions about vendors.
      
      Here is the current data about vendors on campus:
      ${contextData}

      Rules:
      1. Be friendly and casual (student vibe).
      2. If asked for recommendations, use the vendor data provided.
      3. If asked about "splitting meals", explain that they can join open splits in the "Meal Split" tab.
      4. Keep answers concise (under 100 words).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + "\n\nUser Question: " + userMessage }] }
      ]
    });

    return response.text || "Sorry, I couldn't think of an answer.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Oops! I'm having trouble connecting to the food network right now.";
  }
};