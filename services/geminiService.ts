import { GoogleGenAI } from "@google/genai";
import { School, Event } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateExecutiveSummary = async (
  schools: School[], 
  events: Event[], 
  category: string
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key not configured. Please set process.env.API_KEY to use AI features.";

  const topSchools = schools.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
  const bottomSchools = schools.sort((a, b) => a.totalScore - b.totalScore).slice(0, 5);
  
  const prompt = `
    You are an AI analyst for an educational organization.
    Analyze the following participation data for ${category} schools.
    
    Context:
    - We track school participation in events (Socializations, Data Requests).
    - High scores indicate active, compliant schools.
    
    Data:
    - Total Events Held: ${events.length}
    - Top 5 Active Schools: ${topSchools.map(s => `${s.name} (${s.totalScore} pts)`).join(', ')}
    - Bottom 5 Inactive Schools: ${bottomSchools.map(s => `${s.name} (${s.totalScore} pts)`).join(', ')}
    
    Task:
    Provide a professional executive summary (max 150 words) in Indonesian (Bahasa Indonesia).
    Highlight the gap between top and bottom performers and suggest 1 actionable strategy to improve the participation of the bottom schools.
    Do not use markdown formatting like bolding, just plain text paragraphs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI analysis. Please check your connection.";
  }
};