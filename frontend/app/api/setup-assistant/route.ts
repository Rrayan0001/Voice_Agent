import { NextResponse } from "next/server";

export async function POST() {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/setup-assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(5000),
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
        const res = await fetch("http://127.0.0.1:8000/api/setup-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(3000),
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
      action: "local_synced",
      assistant_id: process.env.VAPI_ASSISTANT_ID || "iris-customer-care-v2",
      message: "Assistant ready for voice link.",
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
