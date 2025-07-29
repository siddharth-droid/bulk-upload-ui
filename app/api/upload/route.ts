import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  const formData = await req.formData();

  try {
    const res = await fetch("https://dev-beta-api.llmcontrols.ai/api/v2/files/bulk", {
      method: "POST",
      headers: {
        Authorization: token || "",
      },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
