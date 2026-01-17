import { GoogleGenAI, Type } from "@google/genai";

/**
 * Parses raw syllabus text using the Gemini-3 AI model to extract academic events.
 * 
 * @param {string} text - The raw text extracted from a syllabus.
 * @param {string} courseName - The name of the course for context.
 * @returns {Promise<Array>} A list of formatted AgendaItem objects.
 */
export const parseSyllabus = async (text, courseName) => {
  // Initialize AI client using the provided environment variable
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract all assignments, exams, and key dates from the following syllabus for the course "${courseName}". 
      The output must be a JSON array of objects with fields: title, type (one of: assignment, exam, reading, milestone), date (YYYY-MM-DD), and description.
      
      Syllabus Text:
      ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short title of the event" },
              type: { type: Type.STRING, description: "Category of the event" },
              date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
              description: { type: Type.STRING, description: "Brief details about the task" }
            },
            required: ["title", "type", "date"]
          }
        }
      }
    });

    // Access the text property directly as per the latest SDK guidelines
    const textOutput = response.text || "[]";
    let rawData = [];
    
    try {
      rawData = JSON.parse(textOutput);
    } catch (parseError) {
      console.error("Critical error: AI response was not valid JSON.", parseError);
      return [];
    }

    // Map the raw AI data to our application-specific AgendaItem format
    return rawData.map((item) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      course: courseName,
      completed: false,
      priority: item.type === 'exam' ? 'high' : 'medium'
    }));
  } catch (error) {
    console.error("Gemini API Request failed:", error);
    throw error;
  }
};
