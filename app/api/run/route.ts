import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

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

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}