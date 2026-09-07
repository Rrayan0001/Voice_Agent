import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/config`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {
      // Backend unreachable, fallback below
    }
  }

  // If local development without explicit backendUrl, also attempt http://127.0.0.1:8000
  if (process.env.NODE_ENV !== "production") {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/config", {
        cache: "no-store",
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok) {
        return NextResponse.json(await res.json());
      }
    } catch {
      // fallback
    }
  }

  const pubKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || process.env.VAPI_PUBLIC_KEY || "";
  const privKey = process.env.VAPI_PRIVATE_KEY || "";
  const asstId = process.env.VAPI_ASSISTANT_ID || "";

  return NextResponse.json({
    has_public_key: Boolean(pubKey),
    public_key: pubKey,
    has_private_key: Boolean(privKey),
    has_assistant_id: Boolean(asstId),
    assistant_id: asstId,
    scenario: {
      title: "Apex Customer Service & Orders",
      agent_name: "IRIS - Voice Specialist",
      description: "24/7 AI Customer Support for Orders 1 to 20",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(2000),
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
        const res = await fetch("http://127.0.0.1:8000/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(1000),
        });
        if (res.ok) {
          return NextResponse.json(await res.json());
        }
      } catch {
        // fallback
      }
    }

    return NextResponse.json({
      success: true,
      message: "Configuration saved in browser session.",
      has_public_key: Boolean(body.vapi_public_key),
      has_assistant_id: Boolean(body.assistant_id),
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
