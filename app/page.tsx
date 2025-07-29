"use client";

import React, { useState, useRef } from "react";

export default function FileUpload() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);

  const [textInput, setTextInput] = useState("");
  const [filePathInput, setFilePathInput] = useState("");

  // New state for polling
  const [taskUrl, setTaskUrl] = useState("");
  const [taskResponse, setTaskResponse] = useState<string | null>(null);
  const [pollingLoading, setPollingLoading] = useState(false);

  // Hardcoded LLMC API key
  const LLMC_API_KEY = "sk-VxgzufVboRmdOuJe0OC7OkT6g5sDSdzPZYt__shz7Lw";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = e.target.files;
    if (!newFiles) return;

    if (files && files.length > 0) {
      // Append new files to existing ones
      const dt = new DataTransfer();
      
      // Add existing files
      Array.from(files).forEach(file => {
        dt.items.add(file);
      });
      
      // Add new files (avoiding duplicates)
      Array.from(newFiles).forEach(newFile => {
        const isDuplicate = Array.from(files).some(existingFile => 
          existingFile.name === newFile.name && 
          existingFile.size === newFile.size &&
          existingFile.lastModified === newFile.lastModified
        );
        
        if (!isDuplicate) {
          dt.items.add(newFile);
        }
      });
      
      setFiles(dt.files.length > 0 ? dt.files : null);
    } else {
      // No existing files, just set the new ones
      setFiles(newFiles);
    }
    
    // Clear the input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!files?.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploadLoading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setResponse("Upload failed. Please check the server.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleApiAccess = async () => {
    if (!textInput || !filePathInput) return;

    const payload = {
      "TextInput-Zbf8t": {
        value: textInput,
        output_type: "text",
        input_type: "text",
      },
      "File-xMtVx": {
        file_paths: [filePathInput],
        input_type: "file",
        output_type: "file",
      },
    };

    setApiLoading(true);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": LLMC_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse("API request failed. Please check the fields or token.");
    } finally {
      setApiLoading(false);
    }
  };

  const handleTaskPolling = async () => {
    if (!taskUrl) return;

    setPollingLoading(true);
    try {
      const res = await fetch("/api/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": LLMC_API_KEY,
        },
        body: JSON.stringify({ task_url: taskUrl }),
      });

      const data = await res.json();
      setTaskResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setTaskResponse("Task polling failed. Please check the URL or token.");
    } finally {
      setPollingLoading(false);
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
            Manage your files, run AI workflows, and track task results all in one place
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          
          {/* Bulk File Upload */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-8 hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">File Upload</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Files</label>
                
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
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-medium">Choose Files</span>
                </button>
                
                {/* Custom File Count Display */}
                {files && files.length > 0 && (
                  <div className="mt-3 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-300">
                          {files.length} {files.length === 1 ? 'file' : 'files'} selected
                        </p>
                        <p className="text-xs text-slate-400">Ready to upload • Click "Choose Files" to add more</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFiles(null);
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
                disabled={uploadLoading || !files}
                type="button"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
              >
                {uploadLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : "Upload Files"}
              </button>
            </div>
          </div>

          {/* API Access Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-8 hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">API Access</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Text Input</label>
                <input
                  type="text"
                  placeholder="Enter Text Input"
                  className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">File Path</label>
                <input
                  type="text"
                  placeholder="Enter File Path"
                  className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  value={filePathInput}
                  onChange={(e) => setFilePathInput(e.target.value)}
                />
              </div>

              <button
                onClick={handleApiAccess}
                disabled={apiLoading || !textInput || !filePathInput}
                type="button"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
              >
                {apiLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : "SEND"}
              </button>
            </div>
          </div>

          {/* Check Results Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-8 hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Check Results</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Task URL</label>
                <input
                  type="text"
                  placeholder="Enter Task URL"
                  className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={taskUrl}
                  onChange={(e) => setTaskUrl(e.target.value)}
                />
              </div>

              <button
                onClick={handleTaskPolling}
                disabled={pollingLoading || !taskUrl}
                type="button"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25"
              >
                {pollingLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </span>
                ) : "Check Task Status"}
              </button>
            </div>
          </div>
        </div>

        {/* Response Sections */}
        <div className="max-w-7xl mx-auto space-y-8">
          {response && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">API Response</h3>
              </div>
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-600/30">
                <pre className="text-slate-300 text-sm overflow-x-auto whitespace-pre-wrap max-h-96 custom-scrollbar">
                  {response}
                </pre>
              </div>
            </div>
          )}

          {taskResponse && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Task Results</h3>
              </div>
              <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-600/30">
                <pre className="text-slate-300 text-sm overflow-x-auto whitespace-pre-wrap max-h-96 custom-scrollbar">
                  {taskResponse}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
