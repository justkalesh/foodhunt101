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
    console.error("Gemini API Error:", error);
    return "Oops! I'm having trouble connecting to the food network right now.";
  }
};