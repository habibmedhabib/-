
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Strictly follow initialization guidelines (named parameter, no non-null assertion)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function breakdownTask(taskTitle: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `قم بتقسيم هذه المهمة إلى خطوات أصغر قابلة للتنفيذ (بحد أقصى 5 خطوات) باللغة العربية: "${taskTitle}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["steps"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.steps;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function generateDailyReview(tasks: any[], stats: any) {
  const prompt = `
    بناءً على تنفيذ اليوم:
    المهام: ${JSON.stringify(tasks)}
    الإحصائيات: ${JSON.stringify(stats)}
    
    قدم مراجعة أداء احترافية ومختصرة ومحفزة باللغة العربية.
    سلط الضوء على نقطة قوة واحدة ومنطقة واحدة للتحسين غداً.
    أرجع النتيجة كنص نظيف فقط.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text;
}
