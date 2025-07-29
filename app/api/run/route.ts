import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const body = await req.json();

  try {
    const res = await fetch("https://dev-beta-api.llmcontrols.ai/api/v1/run/3d445455-229b-437c-bb7a-78ee4f898733?sync=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}