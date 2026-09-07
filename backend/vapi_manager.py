"""
Vapi AI Assistant Manager.
Automates creation, configuration, and verification of the Customer Support Voice Assistant
with simple context and simple Order IDs (Order 1, Order 2, Order 3, etc.).
"""
from typing import Dict, Any, Optional, List
import httpx
import json
import os

VAPI_BASE_URL = "https://api.vapi.ai"

CUSTOMER_SERVICE_SYSTEM_PROMPT = """
You are IRIS, a warm, polite, and efficient AI customer service voice specialist for Apex Customer Support.
You assist customers with their orders, tracking, address changes, cancellations, and returns across Orders #1 through #20.

### Orders in the System (Orders #1 - #20):
- Order 1: John Smith | Wireless Headphones | Out for Delivery today by 3 PM | Address: 123 Elm St
- Order 2: Sarah Connor | Running Shoes (Size 9) | Shipped via FedEx, arriving tomorrow | Address: 456 Oak Ave
- Order 3: Arthur Dent | Espresso Coffee Machine | In Warehouse, ships in 2h | Eligible for cancellation
- Order 4: Emily Watson | Mechanical Keyboard | Delivered yesterday | Eligible for return
- Order 5: Michael Scott | Ergonomic Desk Chair | Delayed due to weather, arrives in 2 days
- Order 6: Bruce Wayne | 4-Camera Security Kit | Dispatched via UPS 2-Day Air, arrives Wednesday
- Order 7: Diana Prince | Leather Travel Duffel | In Warehouse | Can be cancelled or rerouted
- Order 8: Peter Parker | Countertop Blender | Returned & Refunded of $89.99 credited
- Order 9: Tony Stark | 4K GPS Drone | Out for Delivery (Adult Signature Required)
- Order 10: Natasha Romanoff | Trail Hiking Boots | Delivered to Parcel Locker #4B | Eligible for return
- Order 11: Clark Kent | Aluminum Laptop Stand | Out for Delivery, ETA within 45 mins
- Order 12: Barry Allen | GPS Smartwatch | Address incomplete: missing suite number
- Order 13: Wanda Maximoff | Cast Iron Dutch Oven | Delayed in rail freight, ETA Friday
- Order 14: Steve Rogers | Garage Tool Chest | Preparing for freight carrier dispatch
- Order 15: James Bond | Wireless Earbuds | Ready at Apex Smart Locker #12 (Main St Branch)
- Order 16: Luke Skywalker | Motorized Telescope | Confirmed in warehouse; cancellation permitted
- Order 17: Leia Organa | Organic Bedding Set | Shipped via FedEx Ground, ETA Thursday
- Order 18: Han Solo | Jump Starter & Tire Inflator | Delivered at side door | Return eligible
- Order 19: Harry Potter | Leather Journal Set | Delivered in mailbox | Eligible for return
- Order 20: Hermione Granger | Portable Monitor 15.6" | Awaiting evening carrier pickup

### Voice Tone & Rules:
- Warm, polite, professional, and reassuring.
- Spoken replies MUST be concise (1 to 2 sentences max) because this is a real-time voice phone call.
- Whenever a caller mentions an order number (e.g., "Order 1", "7", "Order 15", "Order #20"), immediately trigger the corresponding tool.
- Always confirm key details (order item, status, or confirmation of action).

### Tools:
1. 'check_order_status': Look up tracking, delivery ETA, and details (orders 1-20).
2. 'cancel_order': Cancel an active order before delivery and initiate refund.
3. 'update_shipping_address': Reroute or change shipping address.
4. 'file_return_request': Initiate a return and issue a prepaid shipping label.

### Opening:
"Hello! Thank you for calling Apex Customer Support. My name is IRIS. How can I help you with your order today?"
"""

ASSISTANT_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "check_order_status",
            "description": "Check delivery status, ETA, and details of an order by number (e.g. 1 through 20).",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order number, between '1' and '20'."
                    }
                },
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_order",
            "description": "Cancel an active customer order before delivery by simple order number (1, 2, 3, etc.).",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order number to cancel (e.g. '2', '3', '5')."
                    },
                    "reason": {
                        "type": "string",
                        "description": "Reason for cancellation (optional)"
                    }
                },
                "required": ["order_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_shipping_address",
            "description": "Update delivery address for an order.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order number (e.g. '1', '2', '3')."
                    },
                    "new_address": {
                        "type": "string",
                        "description": "The new delivery address provided by the customer."
                    }
                },
                "required": ["order_id", "new_address"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "file_return_request",
            "description": "Initiate a return and prepaid return label for a delivered order.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "string",
                        "description": "The order number to return (e.g. '4')."
                    },
                    "reason": {
                        "type": "string",
                        "description": "Reason for return (e.g. wrong size, defective, no longer needed)."
                    }
                },
                "required": ["order_id"]
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
    Create or update the IRIS Customer Support Assistant in the user's Vapi account.
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload: Dict[str, Any] = {
        "name": "IRIS - Apex Customer Support",
        "firstMessage": "Hello! Thank you for calling Apex Customer Support. My name is IRIS. How can I help you with your order today?",
        "model": {
            "provider": "openai",
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "system",
                    "content": CUSTOMER_SERVICE_SYSTEM_PROMPT
                }
            ],
            "tools": ASSISTANT_TOOLS
        },
        "voice": {
            "provider": "11labs",
            "voiceId": "21m00Tcm4TlvDq8ikWAM",  # Rachel - warm, clear
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
        list_resp = await client.get(f"{VAPI_BASE_URL}/assistant", headers=headers, timeout=10.0)
        existing_id = None
        if list_resp.status_code == 200:
            for item in list_resp.json():
                if "Apex" in item.get("name", "") or "IRIS" in item.get("name", ""):
                    existing_id = item.get("id")
                    break

        if existing_id:
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
