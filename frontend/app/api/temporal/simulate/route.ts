import { NextResponse } from "next/server";
import { ALL_20_ORDERS } from "@/components/ScenarioPanel";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const queryLower = (query || "").toLowerCase();

    // Check backend first
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (backendUrl) {
      try {
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/temporal/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
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
        const res = await fetch("http://127.0.0.1:8000/api/temporal/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
          signal: AbortSignal.timeout(1000),
        });
        if (res.ok) {
          return NextResponse.json(await res.json());
        }
      } catch {
        // fallback
      }
    }

    // Direct simulation fallback
    const match = queryLower.match(/\b(?:order\s*#?|#)?([1-9]|1[0-9]|20)\b/);
    const orderId = match ? match[1] : null;
    const found = ALL_20_ORDERS.find((o) => o.id === orderId);

    if (found) {
      return NextResponse.json({
        action: "get_order_status",
        tool_data: { order_id: found.id, status: found.status, eta: found.eta },
        agent_response: `Order #${found.id} for ${found.customer} (${found.item}) is currently ${found.status}. ETA: ${found.eta}. Total was ${found.price}.`,
      });
    }

    return NextResponse.json({
      action: "general_inquiry",
      tool_data: null,
      agent_response: `I am IRIS, your customer support specialist. I can assist you with tracking, cancellations, address changes, or returns for Orders 1 through 20. How can I help you today?`,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
