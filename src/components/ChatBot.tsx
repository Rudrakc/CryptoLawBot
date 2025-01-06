import React, { useState, useEffect } from "react";
import { uploadAndCachePDF, queryGeminiWithCache } from "../services/googleAI";

const pdfPath = "../assets/law.pdf"; // Path to PDF file

const Chatbot: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [cache, setCache] = useState<any | null>(null);

  // Initialize and Cache PDF on Component Load
  useEffect(() => {
    const initializeCache = async () => {
      try {
        const cacheResult = await uploadAndCachePDF(
          pdfPath,
          "Founders Guide to UK Crypto Law",
          600
        );
        setCache(cacheResult);
      } catch {
        setResponse("Error initializing cache. Please refresh.");
      }
    };

    initializeCache();
  }, []);

  // Handle User Input and Send Queries
  const handleSend = async () => {
    if (!userInput) return;
    if (!cache) {
      setResponse("Cache not initialized. Please wait.");
      return;
    }

    try {
      const botResponse = await queryGeminiWithCache(cache, userInput);
      setResponse(botResponse);
      setUserInput("");
    } catch (error) {
      setResponse("Error fetching response. Please try again.");
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Crypto Law Chatbot</h1>
        <div className="mb-4">
          <textarea
            className="w-full p-4 border rounded-md"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about The Founder’s Guide to UK Crypto Law..."
          />
        </div>
        <button
          onClick={handleSend}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Ask
        </button>
        <div className="mt-6 p-4 border rounded-md bg-gray-50">
          <strong>Response:</strong>
          <p>{response}</p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
