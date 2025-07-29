import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const LLMC_API_KEY = "sk-VxgzufVboRmdOuJe0OC7OkT6g5sDSdzPZYt__shz7Lw";

  try {
    const res = await fetch("https://dev-beta-api.llmcontrols.ai/api/v2/files/bulk", {
      method: "POST",
      headers: {
        "x-api-key": LLMC_API_KEY,
      },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
