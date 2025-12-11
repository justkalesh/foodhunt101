export const generateBotResponse = async (userMessage: string, contextData: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userMessage, contextData }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return data.response || "Sorry, I couldn't think of an answer.";
  } catch (error) {
    console.warn("Gemini API Error (Using Mock Fallback):", error);
    // FALLBACK FOR DEMO/LOCAL DEV when backend isn't running
    return "I'm having trouble forcing a connection to the AI brain right now (Backend API unreachable). \n\nHowever, I can still tell you that **Burger King** has great deals, and **Northen Delight** is perfect for spicy food lovers! Try visiting them.";
  }
};