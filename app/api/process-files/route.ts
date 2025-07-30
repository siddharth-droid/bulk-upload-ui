import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { blobUrls } = await req.json();

  console.log("📥 Received blob URLs for processing:", blobUrls);

  // Hardcoded LLMC API key
  const LLMC_API_KEY = "sk-VxgzufVboRmdOuJe0OC7OkT6g5sDSdzPZYt__shz7Lw";

  try {
    // Step 1: Download files from Vercel Blob and prepare FormData
    const formData = new FormData();
    
    for (const blobUrl of blobUrls) {
      console.log("⬇️ Downloading file from Vercel Blob:", blobUrl);
      
      // Download file from Vercel Blob
      const fileResponse = await fetch(blobUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download file from ${blobUrl}`);
      }
      
      // Get the file blob
      const fileBlob = await fileResponse.blob();
      
      // Extract filename from URL (everything after the last slash, before query params)
      const urlPath = new URL(blobUrl).pathname;
      const encodedFilename = urlPath.substring(urlPath.lastIndexOf('/') + 1);
      const filename = decodeURIComponent(encodedFilename);
      
      console.log("📁 Downloaded file:", filename, "Size:", fileBlob.size, "bytes");
      
      // Add to FormData
      formData.append("files", fileBlob, filename);
    }

    // Step 2: Upload to LLMC bulk endpoint
    console.log("📤 Uploading files to LLMC bulk endpoint...");
    
    const uploadRes = await fetch("https://dev-beta-api.llmcontrols.ai/api/v2/files/bulk", {
      method: "POST",
      headers: {
        "x-api-key": LLMC_API_KEY,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("❌ LLMC upload failed:", errorText);
      throw new Error(`LLMC upload failed: ${errorText}`);
    }

    const uploadData = await uploadRes.json();
    console.log("✅ LLMC upload successful:", uploadData);

    // Step 3: Extract file paths for AI processing
    let filePaths = [];
    
    if (uploadData && uploadData.file_paths) {
      filePaths = uploadData.file_paths;
    } else if (uploadData && uploadData.files) {
      filePaths = uploadData.files.map((file: any) => file.path || file.file_path || file.url || file.filepath).filter(Boolean);
    } else if (uploadData && Array.isArray(uploadData)) {
      filePaths = uploadData.map((item: any) => item.path || item.file_path || item.url || item.filepath).filter(Boolean);
    }

    if (!filePaths || filePaths.length === 0) {
      throw new Error(`No valid file paths received from LLMC upload`);
    }

    console.log("🎯 Extracted LLMC file paths:", filePaths);

    // Step 4: Run AI processing with LLMC file paths
    const apiPayload = {
      "File-xMtVx": {
        file_paths: filePaths,
        input_type: "file",
        output_type: "file",
      },
    };

    console.log("🤖 Sending to LLMC AI API:", JSON.stringify(apiPayload, null, 2));

    const apiRes = await fetch("https://dev-beta-api.llmcontrols.ai/api/v1/run/0ec40db5-7b3f-4dce-aabe-d3b48b60a70a?stream=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LLMC_API_KEY,
      },
      body: JSON.stringify(apiPayload),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error("❌ LLMC AI API failed:", errorText);
      throw new Error(`AI processing failed: ${errorText}`);
    }

    const aiData = await apiRes.json();
    console.log("✅ LLMC AI Response:", JSON.stringify(aiData, null, 2));
    
    return NextResponse.json(aiData);

  } catch (err) {
    console.error("💥 Processing error:", err);
    return NextResponse.json({ 
      error: "File processing failed", 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}