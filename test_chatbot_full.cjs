
async function testChatbot() {
    console.log("Testing Chatbot Endpoint -> http://localhost:3000/api/chat");
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userMessage: "Hello! Are you working?",
                contextData: "Vendor: Pizza Place, Price: $5"
            })
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response:", data);
        if (data.response) {
            console.log("✅ Chatbot is working!");
        } else {
            console.log("❌ Chatbot returned no 'response' field.");
        }
    } catch (error) {
        console.error("❌ Test Failed:", error.message);
        console.log("Ensure 'npm run dev' is running on port 3000.");
    }
}

testChatbot();
