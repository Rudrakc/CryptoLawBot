'use client';

import React, { useState, useEffect } from 'react';

// const displayName = 'Crypto Law Guide';
// const pdfUrl =
//   'https://www.nasa.gov/wp-content/uploads/static/history/alsj/a17/A17_FlightPlan.pdf';

export default function Chatbot() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload and cache PDF automatically on load
  useEffect(() => {
    const uploadPDF = async () => {
      try {
        const res = await fetch('/api/upload-pdf');
        const data = await res.json();

        if (data.success) {
          setResponse(`PDF uploaded and cached: ${data.fileUri}`);
        } else {
          setResponse('Failed to upload PDF.');
        }
      } catch (error) {
        console.error('Error:', error);
        setResponse('Error uploading PDF.');
      }
      setLoading(false);
    };

    uploadPDF();
  }, []);

  const handleChat = () => {
    setResponse('You can now start chatting with the bot!');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Crypto Law Chatbot</h1>

        {loading ? (
          <p className="text-blue-500">Uploading and caching PDF...</p>
        ) : (
          <>
            <button
              onClick={handleChat}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Start Chat
            </button>
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <strong>Response:</strong>
              <p>{response}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
