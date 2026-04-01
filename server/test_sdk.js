// node test_sdk.js
const { GoogleGenAI } = require("@google/genai");

async function testSDK() {
    const GEMINI_API_KEY = 'AIzaSyArl1ccayKbvHH5PfovQKKCzfHePhzcaqM';
    console.log("Testing with SDK - Key:", GEMINI_API_KEY);
    
    try {
        const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: "Explain AI",
        });

        console.log("Response:", response.text);
    } catch (e) {
        console.error("SDK Error:", e.name, e.message);
    }
}

testSDK();
