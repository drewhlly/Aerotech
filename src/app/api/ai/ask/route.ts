import { NextResponse } from "next/server";
import { currentEmployer } from "@/lib/employer-session";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const employerId = await currentEmployer();
  if (!employerId) return NextResponse.json({ error: "Please sign in as an employer." }, { status: 401 });
  let question: unknown;
  try { ({ question } = await request.json()); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (typeof question !== "string" || question.trim().length < 2 || question.length > 2000)
    return NextResponse.json({ error: "Enter a question under 2,000 characters." }, { status: 400 });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Aerotech AI is not configured yet. Please contact the administrator." }, { status: 503 });
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        store: false,
        max_output_tokens: 650,
        instructions: "You are Aerotech's HR and workforce assistant. Help employers with recruitment, payroll concepts, compliance, training, and workforce policy. You do NOT have access to this employer's company records, employee details, live payroll, or attendance, so never invent figures or claim to have checked them. For tax or legal topics, explain rules may vary by jurisdiction and require professional verification. Never claim to have paid staff or approved a payroll. Be concise and practical.",
        input: question.trim(),
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return NextResponse.json({ error: "The AI service is unavailable right now." }, { status: 502 });
    const data: { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> } = await response.json();
    const answer = data.output?.flatMap(item => item.content ?? []).filter(item => item.type === "output_text").map(item => item.text ?? "").join("\n").trim();
    if (!answer) return NextResponse.json({ error: "The model returned no answer." }, { status: 502 });
    return NextResponse.json({ answer });
  } catch { return NextResponse.json({ error: "The AI request timed out or failed." }, { status: 502 }); }
}
