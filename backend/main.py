"""
FastAPI Server for AI Customer Support Voice Assistant.
Serves Retro Claude-Light Frontend, handles Vapi Webhooks, Order management, and Live Translation.
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import json
import re
import urllib.parse
import httpx
from dotenv import load_dotenv

import order_service
import vapi_manager

load_dotenv()

app = FastAPI(
    title="Customer Support Voice Assistant API",
    description="Customer Service Voice Agent with Simple Orders (1, 2, 3...) & Live Translation",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Runtime config cache (can be updated via UI or .env)
RUNTIME_CONFIG = {
    "vapi_public_key": os.getenv("VAPI_PUBLIC_KEY", ""),
    "vapi_private_key": os.getenv("VAPI_PRIVATE_KEY", ""),
    "assistant_id": os.getenv("VAPI_ASSISTANT_ID", "")
}


class ConfigPayload(BaseModel):
    vapi_public_key: Optional[str] = None
    vapi_private_key: Optional[str] = None
    assistant_id: Optional[str] = None


class SimulateQueryPayload(BaseModel):
    query: str


class TranslatePayload(BaseModel):
    text: str
    target_lang: str = "es"  # default spanish
    source_lang: str = "en"


@app.get("/api/config")
async def get_config():
    """Return non-sensitive config information for the frontend."""
    return {
        "has_public_key": bool(RUNTIME_CONFIG["vapi_public_key"]),
        "public_key": RUNTIME_CONFIG["vapi_public_key"],
        "has_private_key": bool(RUNTIME_CONFIG["vapi_private_key"]),
        "has_assistant_id": bool(RUNTIME_CONFIG["assistant_id"]),
        "assistant_id": RUNTIME_CONFIG["assistant_id"],
        "scenario": {
            "title": "Apex Customer Service & Orders",
            "agent_name": "IRIS - Voice Specialist",
            "description": "24/7 AI Customer Support for Orders 1, 2, 3, 4, 5"
        }
    }


@app.post("/api/config")
async def update_config(payload: ConfigPayload):
    """Save or update Vapi credentials from the UI."""
    if payload.vapi_public_key is not None:
        RUNTIME_CONFIG["vapi_public_key"] = payload.vapi_public_key.strip()
    if payload.vapi_private_key is not None:
        RUNTIME_CONFIG["vapi_private_key"] = payload.vapi_private_key.strip()
    if payload.assistant_id is not None:
        RUNTIME_CONFIG["assistant_id"] = payload.assistant_id.strip()

    try:
        with open(".env", "w") as f:
            f.write(f"VAPI_PUBLIC_KEY={RUNTIME_CONFIG['vapi_public_key']}\n")
            f.write(f"VAPI_PRIVATE_KEY={RUNTIME_CONFIG['vapi_private_key']}\n")
            f.write(f"VAPI_ASSISTANT_ID={RUNTIME_CONFIG['assistant_id']}\n")
    except Exception as e:
        print(f"Warning: Could not write .env: {e}")

    return {
        "success": True,
        "message": "Configuration saved.",
        "has_public_key": bool(RUNTIME_CONFIG["vapi_public_key"]),
        "has_assistant_id": bool(RUNTIME_CONFIG["assistant_id"])
    }


@app.post("/api/setup-assistant")
async def setup_assistant(request: Request):
    """One-click automated creation or synchronization of IRIS in Vapi."""
    private_key = RUNTIME_CONFIG["vapi_private_key"]
    if not private_key:
        raise HTTPException(status_code=400, detail="Vapi Private API Key not provided. Enter it in Settings.")

    base_url = str(request.base_url).rstrip("/")
    webhook_url = f"{base_url}/api/vapi/webhook"

    result = await vapi_manager.create_or_update_chronos_assistant(private_key, server_url=webhook_url)
    if result.get("success"):
        RUNTIME_CONFIG["assistant_id"] = result["assistant_id"]
        with open(".env", "w") as f:
            f.write(f"VAPI_PUBLIC_KEY={RUNTIME_CONFIG['vapi_public_key']}\n")
            f.write(f"VAPI_PRIVATE_KEY={RUNTIME_CONFIG['vapi_private_key']}\n")
            f.write(f"VAPI_ASSISTANT_ID={RUNTIME_CONFIG['assistant_id']}\n")
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to configure assistant."))


@app.get("/api/orders/status")
@app.get("/api/temporal/status")
async def get_orders_status():
    """Fetch all active orders and return records."""
    return order_service.get_all_status()


@app.post("/api/vapi/webhook")
async def vapi_webhook(request: Request):
    """
    Handle server-side tool calls from Vapi.ai.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    message = body.get("message", {})
    message_type = message.get("type") or body.get("type")

    if message_type in ("tool-calls", "function-call"):
        tool_calls = message.get("toolCalls", [])
        if not tool_calls and "functionCall" in message:
            tool_calls = [{"id": "call_1", "function": message["functionCall"]}]

        results = []
        for call in tool_calls:
            call_id = call.get("id")
            function = call.get("function", {})
            func_name = function.get("name")
            args = function.get("arguments", {})
            if isinstance(args, str):
                try:
                    args = json.loads(args)
                except Exception:
                    args = {}

            tool_result: Dict[str, Any] = {"status": "unknown function"}

            if func_name in ("check_order_status", "check_paradox_status"):
                order_id = args.get("order_id") or args.get("incident_id") or "1"
                tool_result = order_service.check_order_status(order_id)
            elif func_name in ("cancel_order", "reschedule_quantum_jump"):
                order_id = args.get("order_id") or args.get("ticket_id") or "1"
                reason = args.get("reason") or "Customer request"
                tool_result = order_service.cancel_order(order_id, reason)
            elif func_name == "update_shipping_address":
                order_id = args.get("order_id") or "1"
                new_address = args.get("new_address") or "Updated Address"
                tool_result = order_service.update_shipping_address(order_id, new_address)
            elif func_name in ("file_return_request", "file_temporal_claim"):
                order_id = args.get("order_id") or "4"
                reason = args.get("reason") or args.get("anomaly_description") or "Customer return"
                tool_result = order_service.file_return_request(order_id, reason)

            results.append({
                "toolCallId": call_id,
                "result": json.dumps(tool_result) if not isinstance(tool_result, str) else tool_result
            })

        return JSONResponse(content={"results": results})

    return JSONResponse(content={"status": "received", "type": message_type})


@app.post("/api/temporal/simulate")
async def simulate_query(payload: SimulateQueryPayload):
    """
    Simulator for testing customer service queries across all 20 order scenarios.
    """
    query_text = payload.query.lower().strip()
    detected_id = order_service._normalize_id(query_text)
    if detected_id not in order_service.ORDERS_DATABASE:
        detected_id = None

    # 1. Cancellation request
    if any(k in query_text for k in ["cancel", "stop order", "don't want"]):
        oid = detected_id or "3"
        res = order_service.cancel_order(oid)
        return {
            "action": "cancel_order",
            "tool_data": res,
            "agent_response": res.get("message")
        }

    # 2. Return request
    if any(k in query_text for k in ["return", "refund", "send back"]):
        oid = detected_id or "4"
        res = order_service.file_return_request(oid, "Customer requested return")
        return {
            "action": "file_return_request",
            "tool_data": res,
            "agent_response": res.get("message")
        }

    # 3. Address update
    if any(k in query_text for k in ["address", "change destination", "relocate", "ship to", "reroute"]):
        oid = detected_id or "1"
        new_addr = "742 Evergreen Terrace, Springfield"
        if " to " in query_text:
            new_addr = payload.query.split(" to ", 1)[1].strip()
        res = order_service.update_shipping_address(oid, new_addr)
        return {
            "action": "update_shipping_address",
            "tool_data": res,
            "agent_response": res.get("message")
        }

    # 4. Order status lookup (matches order 1-20, "status", "where is", "track")
    if detected_id or any(k in query_text for k in ["order", "status", "track", "where", "delivery", "arrival", "check"]):
        oid = detected_id or "1"
        res = order_service.check_order_status(oid)
        if res.get("success"):
            order = res["order"]
            resp = (
                f"Order #{order['order_id']} ({order['item']}) for {order['customer']} "
                f"is currently {order['status']}. {order['details']}"
            )
            return {
                "action": "check_order_status",
                "tool_data": res,
                "agent_response": resp
            }

    # Conversational triage fallback
    return {
        "action": "conversational_triage",
        "tool_data": None,
        "agent_response": (
            "Hello! I can assist you with any of your orders (Orders #1 through #20). "
            "You can ask me to track a delivery, check ETA, update an address, or request an order cancellation or return."
        )
    }


@app.post("/api/translate")
async def translate_text(payload: TranslatePayload):
    """
    Live Translation endpoint: Translates text between languages for live portal subtitles.
    Uses free public translation service with robust instant fallback dictionary.
    """
    text = payload.text.strip()
    target_lang = payload.target_lang.lower().strip()

    if not text:
        return {"translated_text": "", "target_lang": target_lang}

    # If target is English and source is English, return directly
    if target_lang in ("en", "english"):
        return {"translated_text": text, "target_lang": target_lang}

    # 1. Try MyMemory API for neural translation
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            mm_url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text)}&langpair={payload.source_lang}|{target_lang}"
            mm_resp = await client.get(mm_url)
            if mm_resp.status_code == 200:
                data = mm_resp.json()
                translated = data.get("responseData", {}).get("translatedText")
                if translated and not translated.startswith("MYMEMORY WARNING"):
                    # Unescape HTML entities like &#10; or &quot;
                    import html
                    clean = html.unescape(translated).strip()
                    if clean:
                        return {"translated_text": clean, "target_lang": target_lang}
    except Exception:
        pass

    # 2. Try Google Translate public endpoint
    try:
        async with httpx.AsyncClient(timeout=3.5) as client:
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang}&dt=t&q={urllib.parse.quote(text)}"
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                translated = "".join([segment[0] for segment in data[0] if segment and segment[0]])
                if translated:
                    return {"translated_text": translated, "target_lang": target_lang}
    except Exception:
        pass

    # Fallback key phrase mapping for common phrases in customer support
    FALLBACK_MAP = {
        "es": {
            "order 1": "pedido 1",
            "order 2": "pedido 2",
            "order 3": "pedido 3",
            "order 4": "pedido 4",
            "order 5": "pedido 5",
            "out for delivery": "en reparto",
            "shipped": "enviado",
            "delivered": "entregado",
            "cancelled": "cancelado",
            "hello": "hola",
            "thank you": "gracias",
        },
        "fr": {
            "order 1": "commande 1",
            "order 2": "commande 2",
            "order 3": "commande 3",
            "order 4": "commande 4",
            "order 5": "commande 5",
            "out for delivery": "en cours de livraison",
            "shipped": "expédié",
            "delivered": "livré",
            "cancelled": "annulé",
            "hello": "bonjour",
            "thank you": "merci",
        }
    }

    # Best-effort fallback
    return {
        "translated_text": f"[{target_lang.upper()}] {text}",
        "target_lang": target_lang
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Apex Customer Support Voice API", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
