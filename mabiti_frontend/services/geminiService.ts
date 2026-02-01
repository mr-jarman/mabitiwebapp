
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsightsData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateAIInsights(propertyDescription: string, location: string): Promise<AIInsightsData> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate the following property listing and provide investment, neighborhood, and safety insights.
      
      Property: ${propertyDescription}
      Location: ${location}
      
      Return as JSON with:
      - investment: score (0-100), rating (Excellent/Good/Average), prediction (text like "+12% growth over 5 years")
      - neighborhood: tags (array of 3 short words e.g. ["Trendy", "Walkable"]), description (1 short sentence)
      - safety: score (0-10), description (1 short sentence)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            investment: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                rating: { type: Type.STRING },
                prediction: { type: Type.STRING },
              },
              required: ['score', 'rating', 'prediction']
            },
            neighborhood: {
              type: Type.OBJECT,
              properties: {
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: { type: Type.STRING },
              },
              required: ['tags', 'description']
            },
            safety: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                description: { type: Type.STRING },
              },
              required: ['score', 'description']
            }
          },
          required: ['investment', 'neighborhood', 'safety']
        }
      }
    });

    return JSON.parse(response.text || '{}') as AIInsightsData;
  } catch (error) {
    console.error("Error generating insights:", error);
    // Fallback static data if API fails or no key
    return {
      investment: { score: 94, rating: "Excellent", prediction: "+12% growth over 5 years based on area development plans." },
      neighborhood: { tags: ["Trendy", "Walkable", "Nightlife"], description: "A vibrant hub for young professionals with high density of cafes and art galleries." },
      safety: { score: 9.2, description: "Significantly safer than city average." }
    };
  }
}
