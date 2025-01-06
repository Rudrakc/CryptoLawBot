import {  NextResponse } from 'next/server';
import fs from 'fs';
import fetch from 'node-fetch';
import {
  FileState,
  GoogleAIFileManager,
  GoogleAICacheManager,
} from '@google/generative-ai/server';

// API Key from Environment Variables
const API_KEY = process.env.GEMINI_API_KEY || '';
const pdfUrl = process.env.PDF_URL || '';

// Download, Upload and Cache PDF
async function uploadAndCachePDF(pdfUrl: string, displayName: string) {
  const pdfPath = `./public/${displayName}.pdf`;
  const fileManager = new GoogleAIFileManager(API_KEY);
  const cacheManager = new GoogleAICacheManager(API_KEY);

  try {
    // Download the PDF from URL
    const pdfBuffer = await fetch(pdfUrl).then((response) =>
      response.arrayBuffer()
    );
    const binaryPdf = Buffer.from(pdfBuffer);
    console.log('PDF downloaded:', binaryPdf.length, 'bytes');
    fs.writeFileSync(pdfPath, binaryPdf, 'binary');
    console.log(`PDF saved at: ${pdfPath}`);

    // Upload the PDF to Gemini
    const fileResult = await fileManager.uploadFile(pdfPath, {
      displayName,
      mimeType: 'application/pdf',
    });

    const { name } = fileResult.file;

    // Wait for PDF processing
    let file = await fileManager.getFile(name);
    while (file.state === FileState.PROCESSING) {
      console.log('Processing PDF...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(name);
    }

    console.log(`PDF processing complete: ${file.uri} ${file.mimeType}`);


    // Cache the PDF in Gemini
    const cachedResult = await cacheManager.create({
      model: 'models/gemini-1.5-flash-001',
      displayName,
      systemInstruction:
        'You are an expert in UK Crypto Law. Answer ONLY from the cached PDF.',
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
      ttlSeconds: 600,
    });

    console.log('Cache initialized with PDF:', cachedResult);
    return {
      success: true,
      cacheId: cachedResult,
      fileUri: file.uri,
    };
  } catch (error) {
    console.error('Error during PDF upload:', error);
    return {
      success: false,
      error: error,
    };
  }
}

// Automatically cache PDF when page loads
export async function GET() {
  const displayName = "The Founder's Guide to UK";
  const result = await uploadAndCachePDF(pdfUrl, displayName);
  return NextResponse.json(result);
}
