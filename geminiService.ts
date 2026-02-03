
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMarketingAdvice = async (studentName: string, instrument: string, lastNote: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera un mensaje breve y empático para reconectar con un alumno inactivo llamado ${studentName} que estudiaba ${instrument}. Nota previa: "${lastNote}". El mensaje debe ser para WhatsApp y ofrecer una clase de prueba o descuento para retomar. Responde solo con el texto del mensaje.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "¡Hola! Te extrañamos en la escuela. ¿Te gustaría volver a tus clases de música? Tenemos promociones especiales este mes.";
  }
};

export const analyzeAttendance = async (studentData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza la situación del alumno ${studentData.firstName} que tiene ${studentData.consecutiveAbsences} faltas consecutivas. Sugiere una acción administrativa o pedagógica.`,
    });
    return response.text;
  } catch (error) {
    return "Se recomienda contactar al alumno para verificar el motivo del ausentismo.";
  }
};
