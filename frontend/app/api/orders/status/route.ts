import { NextResponse } from "next/server";
import { ALL_20_ORDERS } from "@/components/ScenarioPanel";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  if (backendUrl) {
    try {
      const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/orders/status`, {
        cache: "no-store",
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
      const res = await fetch("http://127.0.0.1:8000/api/orders/status", {
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

  const orders = ALL_20_ORDERS.map((o) => ({
    order_id: o.id,
    customer: o.customer,
    item: o.item,
    status: o.status,
    details: `${o.scenarioType}. Expected: ${o.eta}`,
    shipping_address: "Verified on file",
    carrier: "Express Delivery",
    tracking_number: `TRK-${1000 + Number(o.id)}`,
    total: o.price,
    can_cancel: o.status.toLowerCase().includes("processing") || o.status.toLowerCase().includes("shipped"),
    can_return: o.status.toLowerCase().includes("delivered"),
  }));

  return NextResponse.json({
    orders,
    returns: [],
    total_active_orders: orders.length,
    service_status: "Operational",
  });
}
