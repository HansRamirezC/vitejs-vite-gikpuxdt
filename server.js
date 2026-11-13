/*import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Apagar los filtros de seguridad de Google para evitar falsos positivos
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    // 2. Inyectar la configuración de seguridad al modelo
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      safetySettings: safetySettings 
    });
    
    let responseText = "";
    let success = false;
    let attempts = 0;

    while (!success && attempts < 3) {
      try {
        attempts++;
        const result = await model.generateContent(prompt);
        
        // 3. Proteger el servidor si la respuesta viene bloqueada o vacía
        if (!result.response || !result.response.candidates || result.response.candidates.length === 0) {
            throw new Error("Respuesta bloqueada o vacía de Gemini");
        }
        
        responseText = result.response.text();
        
        if (!responseText.trim()) {
            throw new Error("Gemini devolvió un texto en blanco");
        }
        
        success = true;
      } catch (apiError) {
        console.warn(`Intento ${attempts} fallido: ${apiError.message}. Reintentando...`);
        if (attempts >= 3) throw apiError;
        
        // Aumentar el tiempo de espera a 2 segundos para evitar saturar el límite de peticiones
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    res.json({ text: responseText });
  } catch (error) {
    console.error("Error final en el servidor:", error);
    res.status(500).json({ error: "Error de conexión con la IA" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🟢 Servidor backend corriendo seguro en http://localhost:${PORT}`);
});
*/