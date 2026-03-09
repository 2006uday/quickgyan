import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.

async function main(req: Request, res: Response) {
    try {
        const ai = new GoogleGenAI({ apiKey: "AIzaSyBsSsog1KZP0SLpI2ktPCgqQeMbsOEO8tg" });
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: req.body.message,
        });
        res.json({ response: response.text });
    }
    catch (error) {
        console.log(error);
    }
}

export default main