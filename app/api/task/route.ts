import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { task_url } = await req.json();

  // Hardcoded LLMC API key
  const LLMC_API_KEY = "sk-VxgzufVboRmdOuJe0OC7OkT6g5sDSdzPZYt__shz7Lw";

  try {
    const res = await fetch(task_url, {
      method: "GET",
      headers: {
        "x-api-key": LLMC_API_KEY,
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Task polling failed" }, { status: 500 });
  }
}