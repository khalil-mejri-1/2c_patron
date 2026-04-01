const { GoogleGenAI } = require("@google/genai");

async function findModel() {
    const GEMINI_API_KEY = 'AIzaSyArl1ccayKbvHH5PfovQKKCzfHePhzcaqM';
    const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    try {
        const response = await genAI.models.list();
        console.log("List Response Type:", typeof response);
        // It might be a generator or object
        for await (const m of response) {
            console.log(m.name);
        }
    } catch (e) {
        console.error("List Error:", e.name, e.message);
    }
}

findModel();
