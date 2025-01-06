import {
  FileState,
  GoogleAICacheManager,
  GoogleAIFileManager,
} from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key from Environment
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Upload PDF and Cache
export const uploadAndCachePDF = async (
  pdfPath: string,
  displayName: string,
  ttlSeconds = 600
) => {
  const fileManager = new GoogleAIFileManager(API_KEY);
  const cacheManager = new GoogleAICacheManager(API_KEY);

  try {
    // Upload the PDF file
    const fileResult = await fileManager.uploadFile(pdfPath, {
      displayName,
      mimeType: 'application/pdf',
    });

    const { name } = fileResult.file;

    // Wait for the file to finish processing
    let file = await fileManager.getFile(name);
    while (file.state === FileState.PROCESSING) {
      console.log('Waiting for PDF to be processed.');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(name);
    }

    console.log(`PDF processing complete: ${file.uri}`);

    // Create a cache with the uploaded PDF file
    const cachedResult = await cacheManager.create({
      model: 'models/gemini-1.5-flash-001',
      displayName,
      systemInstruction:
        'You are an expert in UK Crypto Law. Answer ONLY from the cached PDF. If the user asks unrelated questions, politely decline.',
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType: file.mimeType,
                fileUri: file.uri,
              },
            },
          ],
        },
      ],
      ttlSeconds,
    });

    console.log('Cache initialized with PDF:', cachedResult);
    return cachedResult;
  } catch (error) {
    console.error('Error uploading/caching PDF:', error);
    throw error;
  }
};

// Query Gemini AI with Cached PDF
export const queryGeminiWithCache = async (cache: any, userInput: string) => {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const genModel = genAI.getGenerativeModelFromCachedContent(cache);

  try {
    const result = await genModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: userInput }],
        },
      ],
    });

    return result.response.text() || 'No relevant answer found.';
  } catch (error) {
    console.error('Error querying model:', error);
    throw error;
  }
};
