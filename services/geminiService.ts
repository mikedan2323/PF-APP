import { GoogleGenAI } from "@google/genai";
import { ReportData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const geminiService = {
  generateMonthlyReport: async (month: string, data: ReportData): Promise<string> => {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an AI assistant for a Pathfinders club leader. Your task is to generate a concise, well-structured monthly report summary in Markdown format.
      
      **Report Month:** ${month}
      
      **Key Metrics:**
      - Total Club Meetings: ${data.meetingCount}
      - Average Attendance: ${data.avgAttendance}%
      - Uniform Compliance During Meetings: ${data.uniformCompliance}%
      
      **Instructions:**
      1.  Start with a title: "Monthly Summary Report: [Month Name and Year]".
      2.  Write a brief opening paragraph summarizing the month's activities and overall performance. Be positive and encouraging.
      3.  Create a "Key Performance Indicators" section using a bulleted list to present the metrics provided above.
      4.  Create a "Highlights & Observations" section. Based on the data, infer some likely highlights. For example, if attendance is high, mention the good engagement. If uniform compliance is high, praise the members' discipline.
      5.  Create a "Suggestions for Next Month" section. Provide 2-3 actionable suggestions. For example, if uniform compliance is slightly low, suggest a "best uniform" award. If attendance is high, suggest a fun activity to maintain momentum.
      6.  Keep the entire report concise and professional, suitable for sharing with club leadership.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        
        return response.text;

    } catch (error) {
      console.error("Error generating report with Gemini:", error);
      return "## Report Generation Failed\n\nThere was an error connecting to the AI service. Please try again later.";
    }
  },
};