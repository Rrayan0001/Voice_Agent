"""
Customer Service Order & Delivery Management Service.
Mock database with 20 realistic, multi-category order scenarios (Orders #1 through #20)
covering diverse delivery statuses, tracking, address changes, cancellations, and returns.
"""
from typing import Dict, Any, List, Optional
import datetime
import re

# Comprehensive 20-order database
ORDERS_DATABASE: Dict[str, Dict[str, Any]] = {
    "1": {
        "order_id": "1",
        "customer": "John Smith",
        "item": "Wireless Noise-Cancelling Headphones",
        "category": "Electronics",
        "status": "Out for Delivery",
        "details": "Courier is 4 stops away. Expected arrival today by 3:00 PM.",
        "shipping_address": "123 Elm Street, Springfield",
        "carrier": "QuickExpress",
        "tracking_number": "TRK-1001",
        "total": "$79.99",
        "can_cancel": False,
        "can_return": False,
        "scenario_type": "Live Courier Tracking"
    },
    "2": {
        "order_id": "2",
        "customer": "Sarah Connor",
        "item": "Running Shoes (Size 9)",
        "category": "Apparel & Footwear",
        "status": "Shipped",
        "details": "In transit via FedEx. Estimated delivery tomorrow afternoon.",
        "shipping_address": "456 Oak Avenue, Austin",
        "carrier": "FedEx",
        "tracking_number": "FX-2002",
        "total": "$120.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "In-Transit Status & ETA"
    },
    "3": {
        "order_id": "3",
        "customer": "Arthur Dent",
        "item": "Espresso Coffee Machine",
        "category": "Kitchen & Home",
        "status": "Processing in Warehouse",
        "details": "Item packaged and awaiting carrier pickup in 2 hours. Eligible for cancellation.",
        "shipping_address": "789 Pine Road, Seattle",
        "carrier": "UPS Ground",
        "tracking_number": "UPS-3003",
        "total": "$189.50",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Order Cancellation & Refund"
    },
    "4": {
        "order_id": "4",
        "customer": "Emily Watson",
        "item": "Mechanical Gaming Keyboard",
        "category": "Gaming & PC",
        "status": "Delivered",
        "details": "Delivered yesterday at front porch. Within 30-day return policy.",
        "shipping_address": "101 Maple Drive, Boston",
        "carrier": "DHL",
        "tracking_number": "DHL-4004",
        "total": "$95.00",
        "can_cancel": False,
        "can_return": True,
        "scenario_type": "Return & Prepaid Label"
    },
    "5": {
        "order_id": "5",
        "customer": "Michael Scott",
        "item": "Ergonomic Desk Chair",
        "category": "Office Furniture",
        "status": "Delayed",
        "details": "Delayed due to severe regional winter storm advisory at hub. Revised delivery in 2 days.",
        "shipping_address": "1725 Slough Avenue, Scranton",
        "carrier": "FreightDirect",
        "tracking_number": "FRT-5005",
        "total": "$249.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Weather Delay Advisory"
    },
    "6": {
        "order_id": "6",
        "customer": "Bruce Wayne",
        "item": "Smart Home 4-Camera Security Kit",
        "category": "Smart Home",
        "status": "Shipped",
        "details": "Dispatched via UPS 2-Day Air. On schedule for Wednesday delivery by 5:00 PM.",
        "shipping_address": "1007 Mountain Drive, Gotham",
        "carrier": "UPS Air",
        "tracking_number": "UPS-6006",
        "total": "$320.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Expedited Air Shipping"
    },
    "7": {
        "order_id": "7",
        "customer": "Diana Prince",
        "item": "Leather Weekend Travel Duffel",
        "category": "Luggage & Travel",
        "status": "Processing in Warehouse",
        "details": "Order confirmed and awaiting allocation. Can be cancelled or rerouted prior to packing.",
        "shipping_address": "24 Gateway Boulevard, Washington",
        "carrier": "FedEx Ground",
        "tracking_number": "FX-7007",
        "total": "$145.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Address Change / Cancellation"
    },
    "8": {
        "order_id": "8",
        "customer": "Peter Parker",
        "item": "High-Speed Countertop Blender",
        "category": "Kitchen",
        "status": "Returned & Refunded",
        "details": "Return inspect passed at fulfillment center. Full refund of $89.99 credited to Visa.",
        "shipping_address": "20 Ingram Street, Queens",
        "carrier": "USPS",
        "tracking_number": "USPS-8008",
        "total": "$89.99",
        "can_cancel": False,
        "can_return": False,
        "scenario_type": "Refund Status Verification"
    },
    "9": {
        "order_id": "9",
        "customer": "Tony Stark",
        "item": "Ultra-HD 4K GPS Video Drone",
        "category": "Electronics",
        "status": "Out for Delivery (Signature Required)",
        "details": "Courier is in your area. Recipient adult signature required upon handoff.",
        "shipping_address": "10880 Malibu Point, Malibu",
        "carrier": "DHL Express",
        "tracking_number": "DHL-9009",
        "total": "$799.00",
        "can_cancel": False,
        "can_return": False,
        "scenario_type": "High-Value Signature Delivery"
    },
    "10": {
        "order_id": "10",
        "customer": "Natasha Romanoff",
        "item": "Waterproof Trail Hiking Boots",
        "category": "Outdoor & Footwear",
        "status": "Delivered",
        "details": "Delivered 2 days ago into apartment parcel locker #4B. Eligible for exchange or return.",
        "shipping_address": "55 Hudson Street, New York",
        "carrier": "OnTrac",
        "tracking_number": "ONT-1010",
        "total": "$165.00",
        "can_cancel": False,
        "can_return": True,
        "scenario_type": "Size Exchange / Return"
    },
    "11": {
        "order_id": "11",
        "customer": "Clark Kent",
        "item": "Aluminum Laptop Stand & USB-C Dock",
        "category": "Office Accessories",
        "status": "Out for Delivery",
        "details": "Driver estimated arrival within 45 minutes at front desk.",
        "shipping_address": "344 Clinton Street, Metropolis",
        "carrier": "Apex Direct",
        "tracking_number": "APX-1111",
        "total": "$45.00",
        "can_cancel": False,
        "can_return": False,
        "scenario_type": "Same-Day Delivery Status"
    },
    "12": {
        "order_id": "12",
        "customer": "Barry Allen",
        "item": "GPS Runner Smartwatch",
        "category": "Wearables",
        "status": "Address Verification Needed",
        "details": "Courier reported missing apartment/suite number. Delivery paused until address confirmed.",
        "shipping_address": "200 Central Avenue, Central City",
        "carrier": "FedEx",
        "tracking_number": "FX-1212",
        "total": "$210.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Address Correction Request"
    },
    "13": {
        "order_id": "13",
        "customer": "Wanda Maximoff",
        "item": "Cast Iron Enamel Dutch Oven (6-Qt)",
        "category": "Cookware",
        "status": "Delayed in Transit",
        "details": "Freight rail congestion at regional sorting facility. Updated delivery Friday by 7 PM.",
        "shipping_address": "2800 Sherwood Drive, Westview",
        "carrier": "BNSF Freight",
        "tracking_number": "BNSF-1313",
        "total": "$115.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Delayed Transit Inquiry"
    },
    "14": {
        "order_id": "14",
        "customer": "Steve Rogers",
        "item": "Heavy-Duty Workshop Tool Chest",
        "category": "Tools & Hardware",
        "status": "Preparing for Dispatch",
        "details": "Packaging complete at regional fulfillment center. Ready for freight carrier pickup.",
        "shipping_address": "569 Leaman Place, Brooklyn",
        "carrier": "FreightDirect",
        "tracking_number": "FRT-1414",
        "total": "$450.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Pre-Shipment Modification"
    },
    "15": {
        "order_id": "15",
        "customer": "James Bond",
        "item": "Noise-Cancelling Wireless Earbuds",
        "category": "Audio",
        "status": "Ready for Locker Pickup",
        "details": "Deposited into Apex Smart Locker #12 (Main St Branch). Secure pickup PIN sent via SMS.",
        "shipping_address": "85 Albert Street, London",
        "carrier": "Apex Locker Direct",
        "tracking_number": "LCK-1515",
        "total": "$135.00",
        "can_cancel": False,
        "can_return": True,
        "scenario_type": "Locker Collection Status"
    },
    "16": {
        "order_id": "16",
        "customer": "Luke Skywalker",
        "item": "Motorized Stargazing Telescope",
        "category": "Optics & Hobbies",
        "status": "Processing in Warehouse",
        "details": "Order confirmed and queued for calibration check. Cancellation permitted before dispatch.",
        "shipping_address": "1 Dune Sea Way, Anchorage",
        "carrier": "UPS Ground",
        "tracking_number": "UPS-1616",
        "total": "$340.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Cancellation Request"
    },
    "17": {
        "order_id": "17",
        "customer": "Leia Organa",
        "item": "Organic Egyptian Cotton Bedding Set",
        "category": "Bed & Bath",
        "status": "Shipped",
        "details": "Departed Atlanta distribution center. In transit with estimated arrival Thursday.",
        "shipping_address": "400 Republic Way, Denver",
        "carrier": "FedEx Ground",
        "tracking_number": "FX-1717",
        "total": "$160.00",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Standard Shipping Tracking"
    },
    "18": {
        "order_id": "18",
        "customer": "Han Solo",
        "item": "Automotive Jump Starter & Air Pump",
        "category": "Automotive",
        "status": "Delivered",
        "details": "Delivered yesterday morning and placed by side garage door. Full return eligibility.",
        "shipping_address": "77 Falcon Boulevard, Las Vegas",
        "carrier": "USPS Priority",
        "tracking_number": "USPS-1818",
        "total": "$85.00",
        "can_cancel": False,
        "can_return": True,
        "scenario_type": "Delivered Package Verification"
    },
    "19": {
        "order_id": "19",
        "customer": "Harry Potter",
        "item": "Handcrafted Leather Journal & Quill Set",
        "category": "Stationery & Gifts",
        "status": "Delivered",
        "details": "Delivered inside mailbox 3 days ago. Customer eligible for replacement or return.",
        "shipping_address": "4 Privet Drive, Little Whinging",
        "carrier": "Royal Mail",
        "tracking_number": "RM-1919",
        "total": "$55.00",
        "can_cancel": False,
        "can_return": True,
        "scenario_type": "Return / Gift Exchange"
    },
    "20": {
        "order_id": "20",
        "customer": "Hermione Granger",
        "item": "Dual-Screen Portable Monitor (15.6\")",
        "category": "Computer Accessories",
        "status": "Awaiting Carrier Pickup",
        "details": "Item boxed, labeled, and staged at loading dock for evening carrier departure.",
        "shipping_address": "12 Grimmauld Place, London",
        "carrier": "DHL Express",
        "tracking_number": "DHL-2020",
        "total": "$199.99",
        "can_cancel": True,
        "can_return": False,
        "scenario_type": "Late Cancellation / Address Reroute"
    }
}

RETURNS_DATABASE: List[Dict[str, Any]] = []


def _normalize_id(order_input: str) -> str:
    """Extract order ID (1-20) from strings like 'Order 14', 'order #7', 'ID 20', 'twenty'."""
    text = str(order_input).lower().strip()
    
    # Word to digit mapping for speech recognition
    WORD_MAP = {
        "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
        "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
        "eleven": "11", "twelve": "12", "thirteen": "13", "fourteen": "14",
        "fifteen": "15", "sixteen": "16", "seventeen": "17", "eighteen": "18",
        "nineteen": "19", "twenty": "20"
    }
    for word, digit in WORD_MAP.items():
        if re.search(rf"\b{word}\b", text):
            return digit

    # Match numbers 1 through 20
    matches = re.findall(r"\b(?:order\s*#?|id\s*#?|#)?([1-9]|1[0-9]|20)\b", text)
    if matches:
        return matches[0]

    # Fallback: any digits in 1-20 range
    digits = "".join(ch for ch in text if ch.isdigit())
    if digits in ORDERS_DATABASE:
        return digits

    return text


def check_order_status(order_id: str) -> Dict[str, Any]:
    """Look up order details and live shipping status by order ID (1 through 20)."""
    clean_id = _normalize_id(order_id)
    if clean_id in ORDERS_DATABASE:
        order = ORDERS_DATABASE[clean_id]
        return {
            "success": True,
            "order": order,
            "formatted_message": (
                f"Order {order['order_id']} for {order['customer']} ({order['item']}) "
                f"is currently {order['status']}. {order['details']}"
            )
        }
    return {
        "success": False,
        "message": f"Order #{order_id} was not found. Please choose an order between 1 and 20."
    }


def cancel_order(order_id: str, reason: str = "Customer requested cancellation") -> Dict[str, Any]:
    """Cancel an active order before delivery."""
    clean_id = _normalize_id(order_id)
    if clean_id not in ORDERS_DATABASE:
        return {
            "success": False,
            "message": f"Cannot cancel: Order #{order_id} not found in system (Available orders: 1 to 20)."
        }

    order = ORDERS_DATABASE[clean_id]
    if order["status"] == "Delivered":
        return {
            "success": False,
            "message": f"Order #{clean_id} has already been delivered. Would you like to request a return instead?"
        }
    if order["status"] == "Cancelled":
        return {
            "success": False,
            "message": f"Order #{clean_id} is already cancelled."
        }

    order["status"] = "Cancelled"
    order["details"] = f"Cancelled per customer request ({reason}). Refund of {order['total']} initiated."
    order["can_cancel"] = False

    return {
        "success": True,
        "order_id": clean_id,
        "order": order,
        "message": f"Order #{clean_id} ({order['item']}) has been successfully cancelled. A full refund of {order['total']} has been processed."
    }


def update_shipping_address(order_id: str, new_address: str) -> Dict[str, Any]:
    """Update delivery address for an active order."""
    clean_id = _normalize_id(order_id)
    if clean_id not in ORDERS_DATABASE:
        return {
            "success": False,
            "message": f"Order #{order_id} not found (Available orders: 1 to 20)."
        }

    order = ORDERS_DATABASE[clean_id]
    if order["status"] in ["Delivered", "Cancelled"]:
        return {
            "success": False,
            "message": f"Cannot update address: Order #{clean_id} is already {order['status']}."
        }

    old_addr = order["shipping_address"]
    order["shipping_address"] = new_address.strip()
    order["details"] += f" [Address updated to: {new_address.strip()}]"

    return {
        "success": True,
        "order_id": clean_id,
        "previous_address": old_addr,
        "new_address": order["shipping_address"],
        "message": f"Shipping address for Order #{clean_id} has been updated to: {order['shipping_address']}."
    }


def file_return_request(order_id: str, reason: str = "Unwanted item / return") -> Dict[str, Any]:
    """File a return or refund request for an eligible order."""
    clean_id = _normalize_id(order_id)
    if clean_id not in ORDERS_DATABASE:
        return {
            "success": False,
            "message": f"Order #{order_id} not found."
        }

    order = ORDERS_DATABASE[clean_id]
    return_record = {
        "return_id": f"RET-{clean_id}-{int(datetime.datetime.now().timestamp())}",
        "order_id": clean_id,
        "customer": order["customer"],
        "item": order["item"],
        "reason": reason,
        "status": "APPROVED",
        "return_label_sent": True,
        "created_at": datetime.datetime.now().isoformat()
    }
    RETURNS_DATABASE.append(return_record)

    return {
        "success": True,
        "return_id": return_record["return_id"],
        "order_id": clean_id,
        "message": f"Return for Order #{clean_id} ({order['item']}) has been approved! A prepaid return label has been emailed to {order['customer']}."
    }


def get_all_status() -> Dict[str, Any]:
    """Return overview of all 20 orders and returns."""
    return {
        "orders": list(ORDERS_DATABASE.values()),
        "returns": RETURNS_DATABASE,
        "total_active_orders": sum(1 for o in ORDERS_DATABASE.values() if o["status"] not in ["Delivered", "Cancelled"]),
        "service_status": "ONLINE"
    }
