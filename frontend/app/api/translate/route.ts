import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, target_lang } = await req.json();
    if (!text || !target_lang || target_lang === "en") {
      return NextResponse.json({ translated_text: text || "", target_lang: target_lang || "en" });
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, target_lang }),
          signal: AbortSignal.timeout(2500),
        });
        if (res.ok) {
          return NextResponse.json(await res.json());
        }
      } catch {
        // fallback
      }
    }

    if (process.env.NODE_ENV !== "production") {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, target_lang }),
          signal: AbortSignal.timeout(1000),
        });
        if (res.ok) {
          return NextResponse.json(await res.json());
        }
      } catch {
        // fallback
      }
    }

    // Direct translation using MyMemory
    try {
      const langPair = `en|${target_lang}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const translated = data?.responseData?.translatedText;
        if (translated) {
          return NextResponse.json({ translated_text: translated, target_lang });
        }
      }
    } catch {
      // fallback
    }

    return NextResponse.json({ translated_text: text, target_lang });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
