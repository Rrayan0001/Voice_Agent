"""
Vapi AI Assistant Manager.
Automates creation, configuration, and verification of the Chronos Support Voice Assistant.
"""
from typing import Dict, Any, Optional, List
import httpx
import json
import os

VAPI_BASE_URL = "https://api.vapi.ai"

CHRONOS_SYSTEM_PROMPT = """
You are IRIS (Inter-temporal Retrieval & Incident Specialist), the primary automated voice support agent for Chronos Temporal Logistics & Paradox Management.
Your job is to assist time-travelers, temporal tourists, historians, and paradoxical anomaly victims.

### Tone & Style:
- Professional, calm, slightly deadpan, and delightfully bureaucratic yet genuinely helpful.
- Treat absurd time-travel problems (e.g. "my pet dinosaur is eating the neighbor's 1980s station wagon" or "I accidentally gave William Shakespeare an electric guitar") as everyday customer service issues.
- Keep spoken responses concise and conversational (1-3 sentences max) because you are on a real-time voice call.
- Always be reassuring: remind customers that reality rarely unravels completely before 5 PM EST.

### Capabilities & Tools:
1. 'check_paradox_status': Call when customer asks about an existing incident ID (e.g. PRX-101, PRX-774, PRX-902).
2. 'file_temporal_claim': Call when customer reports a new anomaly, temporal displacement, or accidental timeline divergence.
3. 'reschedule_quantum_jump': Call when customer needs to change departure or return portal ticket (e.g. TCK-882, TCK-404) to a different year.
4. 'query_epoch_advisory': Call when customer inquires about hazards or safety in a specific year or historical epoch (e.g., 1348, 1912, 1985, Cretaceous).

### Opening:
Start by greeting the caller: "Greetings, traveler. You've reached Chronos Temporal Logistics and Paradox Support. This is IRIS. What timeline discrepancy or quantum booking may I resolve for you today?"
"""

ASSISTANT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_paradox_status",
            "description": "Look up an existing temporal paradox incident record by ID (e.g., PRX-101, PRX-774, PRX-902).",
            "parameters": {
                "type": "object",
                "properties": {
                    "incident_id": {
                        "type": "string",
                        "description": "The incident identifier, formatted like PRX-101"
                    }
                },
                "required": ["incident_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "file_temporal_claim",
            "description": "File a new insurance or emergency retrieval claim for a customer stranded in a past/future epoch or who triggered a butterfly effect anomaly.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_name": {
                        "type": "string",
                        "description": "The caller's full name"
                    },
                    "stranded_epoch": {
                        "type": "string",
                        "description": "The year or era where the incident occurred (e.g., '1888 Victorian London' or 'Mesozoic')"
                    },
                    "anomaly_description": {
                        "type": "string",
                        "description": "Details of the temporal anomaly or displacement"
                    },
                    "severity": {
                        "type": "string",
                        "enum": ["Low", "Medium", "High", "Critical-Cataclysmic"],
                        "description": "Urgency and severity level"
                    }
                },
                "required": ["customer_name", "stranded_epoch", "anomaly_description"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "reschedule_quantum_jump",
            "description": "Reschedule an existing time portal jump ticket to a different year or epoch.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticket_id": {
                        "type": "string",
                        "description": "The portal ticket ID, like TCK-882 or TCK-404"
                    },
                    "new_target_year": {
                        "type": "string",
                        "description": "The new year or era requested (e.g., '1985 AD', '2049 AD', 'Ancient Egypt')"
                    }
                },
                "required": ["ticket_id", "new_target_year"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_epoch_advisory",
            "description": "Check historical hazard advisories, black hole alerts, or epidemic warnings for any year.",
            "parameters": {
                "type": "object",
                "properties": {
                    "target_year": {
                        "type": "string",
                        "description": "The year or epoch to inspect (e.g., '1348', '1912', '1985', '65 Million BC')"
                    }
                },
                "required": ["target_year"]
            }
        }
    }
]


async def verify_vapi_key(api_key: str) -> Dict[str, Any]:
    """Verify that the private Vapi API key is valid."""
    headers = {"Authorization": f"Bearer {api_key}"}
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{VAPI_BASE_URL}/assistant", headers=headers, timeout=10.0)
            if resp.status_code == 200:
                assistants = resp.json()
                return {"valid": True, "count": len(assistants), "assistants": assistants}
            return {"valid": False, "status_code": resp.status_code, "error": resp.text}
        except Exception as e:
            return {"valid": False, "error": str(e)}


async def create_or_update_chronos_assistant(
    api_key: str,
    server_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create the IRIS Chronos Support assistant in the user's Vapi account.
    If server_url is provided, connects tool calls to this server.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload: Dict[str, Any] = {
        "name": "IRIS - Chronos Temporal Support",
        "firstMessage": "Greetings, traveler. You have reached Chronos Temporal Logistics and Paradox Support. This is IRIS. What timeline discrepancy or quantum booking may I resolve for you today?",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": CHRONOS_SYSTEM_PROMPT
                }
            ],
            "tools": ASSISTANT_TOOLS
        },
        "voice": {
            "provider": "11labs",
            "voiceId": "21m00Tcm4TlvDq8ikWAM",  # Rachel - calm, clear professional
            "stability": 0.65,
            "similarityBoost": 0.8
        },
        "transcriber": {
            "provider": "deepgram",
            "model": "nova-2",
            "language": "en"
        }
    }

    if server_url:
        payload["serverUrl"] = server_url

    async with httpx.AsyncClient() as client:
        # Check if already exists
        list_resp = await client.get(f"{VAPI_BASE_URL}/assistant", headers=headers, timeout=10.0)
        existing_id = None
        if list_resp.status_code == 200:
            for item in list_resp.json():
                if "Chronos" in item.get("name", "") or "IRIS" in item.get("name", ""):
                    existing_id = item.get("id")
                    break

        if existing_id:
            # Update existing
            patch_resp = await client.patch(
                f"{VAPI_BASE_URL}/assistant/{existing_id}",
                headers=headers,
                json=payload,
                timeout=15.0
            )
            if patch_resp.status_code == 200:
                data = patch_resp.json()
                return {"success": True, "action": "updated", "assistant_id": data.get("id"), "assistant": data}
            return {"success": False, "status_code": patch_resp.status_code, "error": patch_resp.text}
        else:
            # Create new
            post_resp = await client.post(
                f"{VAPI_BASE_URL}/assistant",
                headers=headers,
                json=payload,
                timeout=15.0
            )
            if post_resp.status_code in (200, 201):
                data = post_resp.json()
                return {"success": True, "action": "created", "assistant_id": data.get("id"), "assistant": data}
            return {"success": False, "status_code": post_resp.status_code, "error": post_resp.text}
