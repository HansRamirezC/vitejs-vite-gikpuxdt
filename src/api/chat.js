import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Vercel Serverless solo debe aceptar peticiones POST para el chat
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    
    // Filtros apagados para evitar falsos positivos en la exposición
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite", 
      safetySettings 
    });
    
    let responseText = "";
    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
      try {
        attempts++;
        const result = await model.generateContent(prompt);
        
        if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
            throw new Error("Respuesta bloqueada");
        }
        
        responseText = result.response.text();
        
        if (!responseText.trim()) throw new Error("Texto en blanco");
        
        success = true;
      } catch (apiError) {
        if (attempts >= 3) throw apiError;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    res.status(200).json({ text: responseText });
  } catch (error) {
    console.error("Error en Vercel Backend:", error);
    res.status(500).json({ error: "Error de conexión con la IA" });
  }
}