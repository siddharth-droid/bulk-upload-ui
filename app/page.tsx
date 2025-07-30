"use client";

import React, { useState, useRef } from "react";
import { upload } from '@vercel/blob/client';

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles || newFiles.length === 0) return;

    const newFilesArray = Array.from(newFiles);
    
    if (files.length > 0) {
      // Filter out duplicates
      const uniqueNewFiles = newFilesArray.filter(newFile => 
        !files.some(existingFile => 
          existingFile.name === newFile.name && 
          existingFile.size === newFile.size &&
          existingFile.lastModified === newFile.lastModified
        )
      );
      
      // Combine existing and new unique files
      setFiles([...files, ...uniqueNewFiles]);
    } else {
      // No existing files, just set the new ones
      setFiles(newFilesArray);
    }
    
    // Clear the input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!files?.length) return;

    setProcessing(true);
    setAiResponse(null);

    try {
      // Step 1: Upload files directly to Vercel Blob (bypasses 4.5MB limit)
      const uploadPromises = files.map(async (file) => {
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload-handler',
        });
        console.log("📄 Blob response for", file.name, ":", blob);
        return blob.url;
      });

      const blobUrls = await Promise.all(uploadPromises);
      
      console.log("🔗 Vercel Blob URLs generated:", blobUrls);

      // Step 2: Send blob URLs to our backend for download + LLMC upload + AI processing
      const processRes = await fetch("/api/process-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blobUrls }),
      });

      if (!processRes.ok) {
        const errorData = await processRes.json();
        throw new Error(errorData.details || `Processing failed with status: ${processRes.status}`);
      }

      const apiData = await processRes.json();
      setAiResponse(JSON.stringify(apiData, null, 2));
      
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setAiResponse(`Processing failed: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.6);
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }
        
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.6) rgba(51, 65, 85, 0.3);
        }
      `}</style>

      {/* Header */}
      <div className="container mx-auto px-4 py-8 custom-scrollbar">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            LLM Controls Hub
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          AI-Powered File Analysis Made Simple
          </p>
        </div>

        {/* Single AI Processing Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-8 hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">AI File Processing</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Files for AI Processing</label>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                
                {/* Custom file picker button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="w-full py-4 px-6 bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white rounded-xl border border-slate-600/50 hover:border-slate-500 transition-all duration-200 flex items-center justify-center space-x-3 group"
                >
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-medium">Choose Files to Process</span>
                </button>
                
                {/* Custom File Count Display */}
                {files && files.length > 0 && (
                  <div className="mt-3 flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-purple-300">
                          {files.length} {files.length === 1 ? 'file' : 'files'} ready for processing
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFiles([]);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={processing || !files || files.length === 0}
                type="button"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing with AI...
                  </span>
                ) : "Process Files with AI"}
              </button>
            </div>
          </div>
        </div>

        {/* AI Response Section */}
        {aiResponse && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">AI Processing Results</h3>
              </div>
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-600/30">
                <pre className="text-slate-300 text-sm overflow-x-auto whitespace-pre-wrap max-h-96 custom-scrollbar">
                  {aiResponse}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}