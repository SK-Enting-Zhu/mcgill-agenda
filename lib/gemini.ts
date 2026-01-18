export async function geminiExtractEventsFromText(text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY in env");

  // Minimal JSON-only prompt (we can tune later)
  const prompt = `
You are extracting calendar events from a university syllabus.
Return ONLY valid JSON with this exact shape:

{
  "events": [
    {
      "title": "string",
      "startAt": "ISO-8601 datetime or date",
      "endAt": "ISO-8601 datetime or null",
      "allDay": true/false,
      "notes": "string or null"
    }
  ]
}

Rules:
- If time is not specified, use allDay=true and startAt as date-only.
- Prefer Montreal time context if needed.
- Do NOT include any extra keys.
- Do NOT wrap JSON in markdown.

SYLLABUS TEXT:
${text}
`.trim();

  // NOTE: This is a placeholder call shape.
  // You already have geminiService.js — if you want, paste it and I'll align this exactly.
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
      encodeURIComponent(apiKey),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const textOut =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";

  let parsed: any;
  try {
    parsed = JSON.parse(textOut);
  } catch {
    throw new Error("Gemini returned non-JSON output");
  }

  const events = Array.isArray(parsed?.events) ? parsed.events : [];
  return events;
}