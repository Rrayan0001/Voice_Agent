"""
Chronos Temporal Logistics & Paradox Management Service.
Simulated database and business logic for handling temporal customer inquiries.
"""
from typing import Dict, Any, List, Optional
import datetime
import uuid

# In-memory mock database for temporal records
PARADOX_RECORDS: Dict[str, Dict[str, Any]] = {
    "PRX-101": {
        "incident_id": "PRX-101",
        "customer": "Lord Byron",
        "epoch": "1816 AD (Year Without a Summer)",
        "anomaly": "Accidental introduction of battery-powered synthesizer into Lake Geneva Villa.",
        "turbulence_level": "LEVEL-3 (Moderate Timeline Ripple)",
        "status": "Containment drone en route. Timeline divergence at 4.2%.",
        "remediation": "Do not introduce Lord Byron to synth-pop. Drone will retrieve equipment at 23:00."
    },
    "PRX-774": {
        "incident_id": "PRX-774",
        "customer": "Dr. Sarah Connor",
        "epoch": "65 Million BC (Late Cretaceous)",
        "anomaly": "Apatosaurus pet adopted without Mesozoic biological export license.",
        "turbulence_level": "LEVEL-5 (CRITICAL BIO-HAZARD)",
        "status": "Quarantine temporal bubble deployed around 1987 suburban garage.",
        "remediation": "Bio-agent dispatch scheduled. Customer advised to keep creature calm with ferns."
    },
    "PRX-902": {
        "incident_id": "PRX-902",
        "customer": "Arthur Dent",
        "epoch": "1929 AD (Wall Street Crash)",
        "anomaly": "Short-sold stock exchange using 2024 algorithmic quantum trading terminal.",
        "turbulence_level": "LEVEL-2 (Localized Economic Anomaly)",
        "status": "Monetary timeline self-corrected. Wealth reverted to chronal vouchers.",
        "remediation": "Resolved. Customer issued a warning on paradox interference clause 12-B."
    }
}

QUANTUM_TICKETS: Dict[str, Dict[str, Any]] = {
    "TCK-882": {
        "ticket_id": "TCK-882",
        "passenger": "Max Chronos",
        "departure_portal": "Terminal 4 - Zurich Chrono-Port",
        "origin_epoch": "2026 AD",
        "destination_epoch": "1969 AD (Woodstock Music Festival)",
        "class": "Quantum First Class",
        "status": "CONFIRMED"
    },
    "TCK-404": {
        "ticket_id": "TCK-404",
        "passenger": "Elena Rostova",
        "departure_portal": "Orbital Ring Paradox Gate",
        "origin_epoch": "2026 AD",
        "destination_epoch": "3042 AD (Neo-Tokyo Floating Cities)",
        "class": "Standard Chrono-Shuttle",
        "status": "DELAYED (Solar Flare Anomaly)"
    }
}

HISTORICAL_ADVISORIES: Dict[str, str] = {
    "1348": "CRITICAL ADVISORY: The Black Plague is active across European sectors. Hazardous bio-zone. Anti-bacterial temporal shielding required.",
    "1912": "MARITIME ADVISORY: North Atlantic iceberg hazard active. Avoid booking passages on steamships named Titanic.",
    "65000000_BC": "EXTINCTION-LEVEL EVENT WARNING: Chixculub asteroid impact imminent. Evacuation shuttles leave precisely at -66,038,000 BCE.",
    "1985": "POP CULTURE NOTICE: Excellent year for neon aesthetics, synth music, and skateboards. Temporal safety rating: 99.8% (EXCELLENT).",
    "2026": "PRESENT DAY: Chronos Support Headquarters fully operational. Minimal spontaneous reality warping detected."
}

CLAIMS_DATABASE: List[Dict[str, Any]] = []


def check_paradox_status(incident_id: str) -> Dict[str, Any]:
    """Look up an existing temporal paradox incident record."""
    clean_id = incident_id.strip().upper()
    if clean_id in PARADOX_RECORDS:
        return {
            "success": True,
            "incident": PARADOX_RECORDS[clean_id]
        }
    # Check partial match
    for k, v in PARADOX_RECORDS.items():
        if clean_id in k or k in clean_id:
            return {"success": True, "incident": v}

    return {
        "success": False,
        "message": f"Incident ID '{incident_id}' not found in Chronos Multiverse Registry. Please check format (e.g. PRX-101, PRX-774, PRX-902)."
    }


def file_temporal_claim(
    customer_name: str,
    stranded_epoch: str,
    anomaly_description: str,
    severity: str = "Medium"
) -> Dict[str, Any]:
    """File a new temporal displacement or paradox liability insurance claim."""
    claim_id = f"CLM-{uuid.uuid4().hex[:6].upper()}"
    timestamp = datetime.datetime.now().isoformat()

    new_claim = {
        "claim_id": claim_id,
        "customer_name": customer_name,
        "stranded_epoch": stranded_epoch,
        "anomaly_description": anomaly_description,
        "severity": severity.upper(),
        "status": "QUEUED_FOR_TEMPORAL_EXTRACTION",
        "estimated_retrieval_window": "12 to 24 Chrono-Minutes",
        "registered_at": timestamp
    }
    CLAIMS_DATABASE.append(new_claim)

    return {
        "success": True,
        "claim_id": claim_id,
        "details": new_claim,
        "message": f"Temporal claim {claim_id} registered successfully. Extraction crew notified for epoch: {stranded_epoch}."
    }


def reschedule_quantum_jump(ticket_id: str, new_target_year: str) -> Dict[str, Any]:
    """Reschedule a customer's time jump portal ticket to a new year/era."""
    clean_id = ticket_id.strip().upper()
    if clean_id not in QUANTUM_TICKETS:
        # Check partial
        match = None
        for k in QUANTUM_TICKETS:
            if clean_id in k:
                match = k
                break
        if not match:
            return {
                "success": False,
                "message": f"Ticket {ticket_id} not recognized. Available sample tickets: TCK-882, TCK-404."
            }
        clean_id = match

    ticket = QUANTUM_TICKETS[clean_id]
    old_epoch = ticket["destination_epoch"]
    ticket["destination_epoch"] = f"{new_target_year} (Updated Jump Coordinates)"
    ticket["status"] = "RESCHEDULED"

    return {
        "success": True,
        "ticket_id": clean_id,
        "passenger": ticket["passenger"],
        "previous_epoch": old_epoch,
        "new_epoch": ticket["destination_epoch"],
        "message": f"Quantum departure {clean_id} re-routed to {new_target_year}. Flux coordinates recalculated."
    }


def query_epoch_advisory(target_year: str) -> Dict[str, Any]:
    """Query chronological and temporal hazard warnings for a given epoch/year."""
    clean_year = target_year.strip().replace("AD", "").replace("BC", "").strip()
    
    for key, advisory in HISTORICAL_ADVISORIES.items():
        if clean_year in key or key in clean_year:
            return {
                "success": True,
                "epoch": key,
                "advisory": advisory
            }
    
    # Generic temporal advisory
    return {
        "success": True,
        "epoch": target_year,
        "advisory": f"Standard Chrono-Hazards apply for {target_year}. Caution: Do not step on any prehistoric insects or converse with your own ancestors."
    }


def get_all_status() -> Dict[str, Any]:
    """Return overview of system status, active paradoxes, and claims."""
    return {
        "active_paradoxes": list(PARADOX_RECORDS.values()),
        "tickets": list(QUANTUM_TICKETS.values()),
        "recent_claims": CLAIMS_DATABASE[-5:],
        "multiverse_stability_index": "98.4%",
        "temporal_flux": "NOMINAL"
    }
