"""
FastAPI Server for Chronos Temporal Voice Assistant.
Serves Retro CRT Frontend, handles Vapi Webhooks, and manages Assistant API calls.
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import json
from dotenv import load_dotenv

import temporal_service
import vapi_manager

load_dotenv()

app = FastAPI(
    title="Chronos Temporal Voice Assistant",
    description="Customer Service Voice Agent powered by Vapi.ai and Python",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
            "title": "Chronos Temporal Logistics & Paradox Management",
            "agent_name": "IRIS (Unit 70-B)",
            "description": "24/7 Quantum Displacement & Butterfly Effect Claims Hotline"
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

    # Save to local .env for persistence
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
    # Build webhook URL if public or ngrok
    webhook_url = f"{base_url}/api/vapi/webhook"

    result = await vapi_manager.create_or_update_chronos_assistant(private_key, server_url=webhook_url)
    if result.get("success"):
        RUNTIME_CONFIG["assistant_id"] = result["assistant_id"]
        # Update .env
        with open(".env", "w") as f:
            f.write(f"VAPI_PUBLIC_KEY={RUNTIME_CONFIG['vapi_public_key']}\n")
            f.write(f"VAPI_PRIVATE_KEY={RUNTIME_CONFIG['vapi_private_key']}\n")
            f.write(f"VAPI_ASSISTANT_ID={RUNTIME_CONFIG['assistant_id']}\n")
        return result
    else:
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to configure assistant."))


@app.get("/api/temporal/status")
async def get_temporal_status():
    """Fetch current paradoxes, tickets, and active claims."""
    return temporal_service.get_all_status()


@app.post("/api/vapi/webhook")
async def vapi_webhook(request: Request):
    """
    Handle server-side tool calls and events from Vapi.ai.
    When IRIS calls a tool, Vapi sends a POST request here.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    message = body.get("message", {})
    message_type = message.get("type") or body.get("type")

    # Handle Tool Calls / Function Calls
    if message_type in ("tool-calls", "function-call"):
        tool_calls = message.get("toolCalls", [])
        if not tool_calls and "functionCall" in message:
            # Older single function-call schema fallback
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

            # Route to business logic
            tool_result = {"status": "unknown function"}
            if func_name == "check_paradox_status":
                tool_result = temporal_service.check_paradox_status(
                    incident_id=args.get("incident_id", "")
                )
            elif func_name == "file_temporal_claim":
                tool_result = temporal_service.file_temporal_claim(
                    customer_name=args.get("customer_name", "Anonymous Traveler"),
                    stranded_epoch=args.get("stranded_epoch", "Unknown Era"),
                    anomaly_description=args.get("anomaly_description", "Unspecified temporal anomaly"),
                    severity=args.get("severity", "Medium")
                )
            elif func_name == "reschedule_quantum_jump":
                tool_result = temporal_service.reschedule_quantum_jump(
                    ticket_id=args.get("ticket_id", ""),
                    new_target_year=args.get("new_target_year", "")
                )
            elif func_name == "query_epoch_advisory":
                tool_result = temporal_service.query_epoch_advisory(
                    target_year=args.get("target_year", "")
                )

            results.append({
                "toolCallId": call_id,
                "result": json.dumps(tool_result) if not isinstance(tool_result, str) else tool_result
            })

        return JSONResponse(content={"results": results})

    # Default ack for status callbacks / end-of-call-report
    return JSONResponse(content={"status": "received", "type": message_type})


@app.post("/api/temporal/simulate")
async def simulate_query(payload: SimulateQueryPayload):
    """
    Demonstration simulator: processes sample customer queries locally
    to showcase tool-dispatching logic and intelligent customer support responses.
    """
    query_text = payload.query.lower().strip()
    
    # 1. Incident check
    for incident_id in ["prx-101", "prx-774", "prx-902"]:
        if incident_id in query_text or incident_id.replace("-", "") in query_text:
            res = temporal_service.check_paradox_status(incident_id.upper())
            inc = res.get("incident", {})
            return {
                "action": "check_paradox_status",
                "tool_data": res,
                "agent_response": (
                    f"Checking incident {inc.get('incident_id')} for {inc.get('customer')}. "
                    f"Status: {inc.get('status')} Remediation advisory: {inc.get('remediation')}"
                )
            }

    # 2. Reschedule ticket
    for tck in ["tck-882", "tck-404"]:
        if tck in query_text or tck.replace("-", "") in query_text or "ticket" in query_text or "reschedule" in query_text:
            ticket_to_use = "TCK-882" if "882" in query_text else "TCK-404"
            target_year = "2049 AD" if "future" in query_text or "2049" in query_text else "1985 AD"
            res = temporal_service.reschedule_quantum_jump(ticket_to_use, target_year)
            return {
                "action": "reschedule_quantum_jump",
                "tool_data": res,
                "agent_response": (
                    f"Quantum departure {ticket_to_use} successfully rescheduled to {target_year}. "
                    f"Your departure portal coordinates have been transmitted to your chrono-pager."
                )
            }

    # 3. Epoch advisory
    for yr in ["1348", "1912", "1985", "cretaceous", "dinosaur"]:
        if yr in query_text:
            target = "65000000_BC" if ("cretaceous" in query_text or "dinosaur" in query_text) else yr
            res = temporal_service.query_epoch_advisory(target)
            return {
                "action": "query_epoch_advisory",
                "tool_data": res,
                "agent_response": f"Chrono-Advisory for epoch {yr}: {res.get('advisory')}"
            }

    # 4. File claim
    if any(k in query_text for k in ["stuck", "claim", "accident", "trapped", "help", "lost", "broke", "dinosaur"]):
        res = temporal_service.file_temporal_claim(
            customer_name="Caller on Line",
            stranded_epoch="Circa 19th Century",
            anomaly_description=payload.query,
            severity="High"
        )
        return {
            "action": "file_temporal_claim",
            "tool_data": res,
            "agent_response": (
                f"Emergency claim {res.get('claim_id')} logged in our temporal matrix. "
                f"A containment unit has been flagged for dispatch within 12 chrono-minutes. Please stay clear of reflective surfaces."
            )
        }

    # Default conversational fallback
    return {
        "action": "conversational_triage",
        "tool_data": None,
        "agent_response": (
            "Understood, traveler. IRIS has logged your inquiry. "
            "Please provide your Incident ID (e.g., PRX-774), Portal Ticket number (e.g., TCK-882), "
            "or specify your stranded epoch so I can dispatch appropriate temporal remediation."
        )
    }


# Static files mount
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.api_route("/favicon.ico", methods=["GET", "HEAD"])
async def favicon():
    svg_icon = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#16120a" stroke="#ffb400" stroke-width="4"/><text x="50%" y="65%" font-size="50" text-anchor="middle" fill="#ffb400">⚡</text></svg>"""
    from fastapi.responses import Response
    return Response(content=svg_icon, media_type="image/svg+xml")


@app.api_route("/", methods=["GET", "HEAD"])
async def index():
    return FileResponse("static/index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
