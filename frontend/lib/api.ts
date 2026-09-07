export interface AppConfig {
  has_public_key: boolean;
  public_key: string;
  has_private_key: boolean;
  has_assistant_id: boolean;
  assistant_id: string;
  scenario: {
    title: string;
    agent_name: string;
    description: string;
  };
}

export interface Order {
  order_id: string;
  customer: string;
  item: string;
  status: string;
  details: string;
  shipping_address: string;
  carrier: string;
  tracking_number: string;
  total: string;
  can_cancel: boolean;
  can_return: boolean;
}

export interface ReturnRecord {
  return_id: string;
  order_id: string;
  customer: string;
  item: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface OrdersStatusResponse {
  orders: Order[];
  returns: ReturnRecord[];
  total_active_orders: number;
  service_status: string;
}

export interface SimulateResult {
  action: string;
  tool_data: Record<string, unknown> | null;
  agent_response: string;
}

export interface ConfigPayload {
  vapi_public_key?: string;
  vapi_private_key?: string;
  assistant_id?: string;
}

export interface TranslateResult {
  translated_text: string;
  target_lang: string;
}

const BASE = "";

async function fetchJSON<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getConfig: () => fetchJSON<AppConfig>(`${BASE}/api/config`),

  saveConfig: (payload: ConfigPayload) =>
    fetchJSON<{ success: boolean; message: string }>(`${BASE}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  setupAssistant: () =>
    fetchJSON<{ success: boolean; action: string; assistant_id: string }>(
      `${BASE}/api/setup-assistant`,
      { method: "POST" }
    ),

  getOrdersStatus: () => fetchJSON<OrdersStatusResponse>(`${BASE}/api/orders/status`),

  simulate: (query: string) =>
    fetchJSON<SimulateResult>(`${BASE}/api/temporal/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),

  translate: (text: string, target_lang: string) =>
    fetchJSON<TranslateResult>(`${BASE}/api/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_lang }),
    }),
};
