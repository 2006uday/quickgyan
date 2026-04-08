/**
 * Controllers for interacting with the Google Gemini AI model.
 * Handles user requests, maintains chat history, and provides conversation context.
 */
import { GoogleGenAI } from "@google/genai";
import ChatMessage from './aiChat.models.js';

export const askAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user?.id;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // 1. Save user message to database
        const userMsg = new ChatMessage({
            userId,
            role: "user",
            content: message
        });
        await userMsg.save();

        // 2. Get AI response
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Fetch last 10 messages for context
        const history = await ChatMessage.find({ userId })
            .sort({ createdAt: -1 })
            .limit(11); // Last 10 + current user message


        const contents = history.reverse().map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        }));

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents,
            config: {
                systemInstruction: 'You are a dedicated Academic Tutor and Learning Assistant. Your sole purpose is to help the user with study-related questions, educational concepts, and clearing academic doubts. STRICT ADHERENCE RULES: 1. ONLY answer questions related to science, math, history, coding, languages, or general learning. 2. If the user asks a personal question (e.g., "How are you?", "What is your name?", "Where do you live?"), or tries to engage in casual small talk, politely redirect them. 3. RESPONSE FOR OFF-TOPIC QUESTIONS: "I am here specifically to help you with your studies and doubts. Please ask a question related to your subjects or learning goals." 4. Maintain a helpful, encouraging, and professional tone suitable for a student-teacher interaction. 5. Do not provide opinions on politics, personal life, or entertainment unless it is directly part of an academic curriculum.',
            }
        });

        const aiResponse = response.text || "No response generated";

        console.log(" AI chats : ", aiResponse);
        
        // 3. Save assistant message to database
        const assistantMsg = new ChatMessage({
            userId,
            role: "assistant",
            content: aiResponse
        });
        await assistantMsg.save();

        res.json({ response: aiResponse });
    }
    catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ error: error.message || "Failed to get AI response" });
    }
};

export const getHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) { return res.status(401).json({ error: "Unauthorized" }); }

        const messages = await ChatMessage.find({ userId })
            .sort({ createdAt: 1 })
            .limit(50); // Limit to last 50 messages for performance

        res.json({ messages });
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const clearHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) { return res.status(401).json({ error: "Unauthorized" }); }

        await ChatMessage.deleteMany({ userId });
        res.json({ message: "Chat history cleared" });
    } catch (error) {
        console.error("Clear History Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default { askAI, getHistory, clearHistory };