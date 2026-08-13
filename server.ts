import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Extract Notice Endpoint
  app.post('/api/extract-notice', async (req, res) => {
    try {
      const { fileBase64, mimeType } = req.body;

      if (!fileBase64 || !mimeType) {
        return res.status(400).json({ error: 'Missing fileBase64 or mimeType' });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is missing on the server.',
        });
      }

      const promptText = `
Analyze the uploaded police notice image or PDF.
Extract ONLY two fields:
1. ackNo: The Acknowledgement Number / NCR Number / Complaint No (e.g. "31108260188320").
2. bankName: The name of the target bank or payments bank mentioned (e.g. "Airtel Payments Bank", "State Bank of India", "ICICI Bank").
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: fileBase64,
                mimeType: mimeType,
              },
            },
            { text: promptText },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ackNo: { type: Type.STRING },
              bankName: { type: Type.STRING },
            },
            required: ['ackNo', 'bankName'],
          },
        },
      });

      const extractedData = JSON.parse(response.text || '{}');
      res.json({ success: true, data: extractedData });
    } catch (err: any) {
      console.error('Error in /api/extract-notice:', err);
      res.status(500).json({
        error: 'Failed to process document with Gemini AI',
        details: err?.message || String(err),
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
