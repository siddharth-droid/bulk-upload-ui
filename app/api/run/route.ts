import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  console.log("📝 Received payload for LLMC API:", JSON.stringify(body, null, 2));

  // Hardcoded LLMC API key
  const LLMC_API_KEY = "sk-VxgzufVboRmdOuJe0OC7OkT6g5sDSdzPZYt__shz7Lw";

  try {
    const res = await fetch("https://dev-beta-api.llmcontrols.ai/api/v1/run/0ec40db5-7b3f-4dce-aabe-d3b48b60a70a?stream=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LLMC_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ 
        error: "AI processing failed", 
        details: errorText 
      }, { status: res.status });
    }

    const data = await res.json();
    console.log("✅ LLMC API Response:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ 
      error: "AI processing failed", 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}