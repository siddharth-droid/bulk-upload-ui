import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const { task_url } = await req.json();

  try {
    const res = await fetch(task_url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey || "",
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Task polling failed" }, { status: 500 });
  }
}