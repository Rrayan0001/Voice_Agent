"use client";

import { useState, useMemo } from "react";

interface Props {
  onSendQuery: (query: string) => void;
  onClose: () => void;
}

export interface OrderScenario {
  id: string;
  customer: string;
  item: string;
  category: string;
  status: string;
  eta: string;
  price: string;
  actionPrompt: string;
  badge: string;
  badgeColor: { bg: string; border: string; text: string };
  scenarioType: string;
}

export const ALL_20_ORDERS: OrderScenario[] = [
  {
    id: "1",
    customer: "John Smith",
    item: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    status: "Out for Delivery",
    eta: "Today by 3:00 PM",
    price: "$79.99",
    actionPrompt: "Where is my Order 1?",
    badge: "DELIVERY TODAY",
    badgeColor: { bg: "rgba(217,119,87,0.12)", border: "rgba(217,119,87,0.3)", text: "#D97757" },
    scenarioType: "Live Courier Tracking (4 stops away)",
  },
  {
    id: "2",
    customer: "Sarah Connor",
    item: "Running Shoes (Size 9)",
    category: "Apparel",
    status: "In Transit (FedEx)",
    eta: "Arriving Tomorrow",
    price: "$120.00",
    actionPrompt: "Check the status of Order 2",
    badge: "SHIPPED",
    badgeColor: { bg: "rgba(74,111,165,0.12)", border: "rgba(74,111,165,0.3)", text: "#4A6FA5" },
    scenarioType: "Standard In-Transit Tracking",
  },
  {
    id: "3",
    customer: "Arthur Dent",
    item: "Espresso Coffee Machine",
    category: "Kitchen",
    status: "Processing in Warehouse",
    eta: "Ships in 2 hours",
    price: "$189.50",
    actionPrompt: "I want to cancel Order 3 and get a refund",
    badge: "PROCESSING",
    badgeColor: { bg: "rgba(184,134,11,0.12)", border: "rgba(184,134,11,0.3)", text: "#B8860B" },
    scenarioType: "Order Cancellation & Instant Refund",
  },
  {
    id: "4",
    customer: "Emily Watson",
    item: "Mechanical Gaming Keyboard",
    category: "Gaming",
    status: "Delivered",
    eta: "Delivered Yesterday",
    price: "$95.00",
    actionPrompt: "I want to return Order 4 for a refund",
    badge: "DELIVERED",
    badgeColor: { bg: "rgba(77,124,95,0.12)", border: "rgba(77,124,95,0.3)", text: "#4D7C5F" },
    scenarioType: "30-Day Return & Prepaid Label",
  },
  {
    id: "5",
    customer: "Michael Scott",
    item: "Ergonomic Desk Chair",
    category: "Furniture",
    status: "Delayed (Weather)",
    eta: "Revised: in 2 days",
    price: "$249.00",
    actionPrompt: "Why is Order 5 delayed?",
    badge: "DELAYED",
    badgeColor: { bg: "rgba(184,64,64,0.10)", border: "rgba(184,64,64,0.25)", text: "#B84040" },
    scenarioType: "Severe Weather Delay Inquiry",
  },
  {
    id: "6",
    customer: "Bruce Wayne",
    item: "Smart Home 4-Camera Security Kit",
    category: "Smart Home",
    status: "Shipped (UPS 2-Day Air)",
    eta: "Wednesday by 5:00 PM",
    price: "$320.00",
    actionPrompt: "Track Order 6",
    badge: "EXPEDITED AIR",
    badgeColor: { bg: "rgba(74,111,165,0.12)", border: "rgba(74,111,165,0.3)", text: "#4A6FA5" },
    scenarioType: "Expedited Air Freight Tracking",
  },
  {
    id: "7",
    customer: "Diana Prince",
    item: "Leather Weekend Travel Duffel",
    category: "Travel",
    status: "Processing in Warehouse",
    eta: "Awaiting Allocation",
    price: "$145.00",
    actionPrompt: "Change delivery address for Order 7 to 500 Park Ave, New York",
    badge: "PRE-SHIPMENT",
    badgeColor: { bg: "rgba(184,134,11,0.12)", border: "rgba(184,134,11,0.3)", text: "#B8860B" },
    scenarioType: "Reroute / Address Modification",
  },
  {
    id: "8",
    customer: "Peter Parker",
    item: "High-Speed Countertop Blender",
    category: "Kitchen",
    status: "Returned & Refunded",
    eta: "Refund credited to Visa",
    price: "$89.99",
    actionPrompt: "Did my refund for Order 8 go through?",
    badge: "REFUNDED",
    badgeColor: { bg: "rgba(77,124,95,0.12)", border: "rgba(77,124,95,0.3)", text: "#4D7C5F" },
    scenarioType: "Refund Confirmation Verification",
  },
  {
    id: "9",
    customer: "Tony Stark",
    item: "Ultra-HD 4K GPS Video Drone",
    category: "Electronics",
    status: "Out for Delivery (Signature Required)",
    eta: "Today by 4:30 PM",
    price: "$799.00",
    actionPrompt: "Where is Order 9 and do I need to sign for it?",
    badge: "SIGNATURE REQ.",
    badgeColor: { bg: "rgba(217,119,87,0.12)", border: "rgba(217,119,87,0.3)", text: "#D97757" },
    scenarioType: "High-Value Signature Hand-off",
  },
  {
    id: "10",
    customer: "Natasha Romanoff",
    item: "Waterproof Trail Hiking Boots",
    category: "Footwear",
    status: "Delivered (Locker #4B)",
    eta: "Delivered 2 days ago",
    price: "$165.00",
    actionPrompt: "I need to return or exchange Order 10",
    badge: "DELIVERED",
    badgeColor: { bg: "rgba(77,124,95,0.12)", border: "rgba(77,124,95,0.3)", text: "#4D7C5F" },
    scenarioType: "Apparel Size Exchange / Return",
  },
  {
    id: "11",
    customer: "Clark Kent",
    item: "Aluminum Laptop Stand & USB-C Dock",
    category: "Office",
    status: "Out for Delivery",
    eta: "Arriving in 45 mins",
    price: "$45.00",
    actionPrompt: "What is the courier arrival time for Order 11?",
    badge: "SAME-DAY",
    badgeColor: { bg: "rgba(217,119,87,0.12)", border: "rgba(217,119,87,0.3)", text: "#D97757" },
    scenarioType: "Same-Day Courier ETA",
  },
  {
    id: "12",
    customer: "Barry Allen",
    item: "GPS Runner Smartwatch",
    category: "Wearables",
    status: "Address Incomplete",
    eta: "Paused at local depot",
    price: "$210.00",
    actionPrompt: "Update my apartment number for Order 12 to Apt 4B",
    badge: "ACTION NEEDED",
    badgeColor: { bg: "rgba(184,64,64,0.10)", border: "rgba(184,64,64,0.25)", text: "#B84040" },
    scenarioType: "Address Verification Correction",
  },
  {
    id: "13",
    customer: "Wanda Maximoff",
    item: "Cast Iron Enamel Dutch Oven",
    category: "Cookware",
    status: "Delayed in Rail Transit",
    eta: "Updated: Friday 7 PM",
    price: "$115.00",
    actionPrompt: "When will Order 13 arrive?",
    badge: "TRANSIT DELAY",
    badgeColor: { bg: "rgba(184,64,64,0.10)", border: "rgba(184,64,64,0.25)", text: "#B84040" },
    scenarioType: "Freight Rail Congestion Check",
  },
  {
    id: "14",
    customer: "Steve Rogers",
    item: "Heavy-Duty Workshop Tool Chest",
    category: "Hardware",
    status: "Preparing for Dispatch",
    eta: "Packaging complete",
    price: "$450.00",
    actionPrompt: "Change the shipping address for Order 14 to 100 Main Street",
    badge: "PRE-SHIPMENT",
    badgeColor: { bg: "rgba(184,134,11,0.12)", border: "rgba(184,134,11,0.3)", text: "#B8860B" },
    scenarioType: "Freight Address Update",
  },
  {
    id: "15",
    customer: "James Bond",
    item: "Noise-Cancelling Wireless Earbuds",
    category: "Audio",
    status: "Ready for Locker Pickup",
    eta: "At Smart Locker #12",
    price: "$135.00",
    actionPrompt: "Where do I pick up Order 15?",
    badge: "LOCKER READY",
    badgeColor: { bg: "rgba(77,124,95,0.12)", border: "rgba(77,124,95,0.3)", text: "#4D7C5F" },
    scenarioType: "Parcel Locker Collection",
  },
  {
    id: "16",
    customer: "Luke Skywalker",
    item: "Motorized Stargazing Telescope",
    category: "Optics",
    status: "Processing in Warehouse",
    eta: "Awaiting Calibration",
    price: "$340.00",
    actionPrompt: "Cancel Order 16 before it ships",
    badge: "PROCESSING",
    badgeColor: { bg: "rgba(184,134,11,0.12)", border: "rgba(184,134,11,0.3)", text: "#B8860B" },
    scenarioType: "Pre-Dispatch Cancellation",
  },
  {
    id: "17",
    customer: "Leia Organa",
    item: "Organic Egyptian Cotton Bedding Set",
    category: "Home",
    status: "In Transit (FedEx Ground)",
    eta: "Arrival Thursday",
    price: "$160.00",
    actionPrompt: "Where is Order 17 right now?",
    badge: "SHIPPED",
    badgeColor: { bg: "rgba(74,111,165,0.12)", border: "rgba(74,111,165,0.3)", text: "#4A6FA5" },
    scenarioType: "Hub Transit Tracking",
  },
  {
    id: "18",
    customer: "Han Solo",
    item: "Automotive Jump Starter & Air Pump",
    category: "Automotive",
    status: "Delivered",
    eta: "Left at side garage door",
    price: "$85.00",
    actionPrompt: "Where was Order 18 delivered?",
    badge: "DELIVERED",
    badgeColor: { bg: "rgba(77,124,95,0.12)", border: "rgba(77,124,95,0.3)", text: "#4D7C5F" },
    scenarioType: "Delivery Location Confirmation",
  },
  {
    id: "19",
    customer: "Harry Potter",
    item: "Handcrafted Leather Journal & Quill Set",
    category: "Stationery",
    status: "Delivered",
    eta: "Delivered into mailbox",
    price: "$55.00",
    actionPrompt: "I would like to return Order 19",
    badge: "DELIVERED",
    badgeColor: { bg: "rgba(77,124,95,0.12)", border: "rgba(77,124,95,0.3)", text: "#4D7C5F" },
    scenarioType: "Gift Return & Refund",
  },
  {
    id: "20",
    customer: "Hermione Granger",
    item: "Dual-Screen Portable Monitor 15.6\"",
    category: "Computing",
    status: "Awaiting Carrier Pickup",
    eta: "Staged at loading dock",
    price: "$199.99",
    actionPrompt: "Can I still cancel Order 20?",
    badge: "PROCESSING",
    badgeColor: { bg: "rgba(184,134,11,0.12)", border: "rgba(184,134,11,0.3)", text: "#B8860B" },
    scenarioType: "Late Cancellation Cutoff",
  },
];

export default function ScenarioPanel({ onSendQuery, onClose }: Props) {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectOrder = (query: string) => {
    onSendQuery(query);
    onClose();
  };

  const filteredOrders = useMemo(() => {
    return ALL_20_ORDERS.filter((ord) => {
      const matchFilter =
        filter === "ALL" ||
        (filter === "DELIVERY" && ord.status.includes("Delivery")) ||
        (filter === "TRANSIT" && ord.status.includes("Shipped") || ord.status.includes("Transit")) ||
        (filter === "WAREHOUSE" && ord.status.includes("Warehouse") || ord.status.includes("Processing") || ord.status.includes("Carrier")) ||
        (filter === "DELIVERED" && ord.status.includes("Delivered") || ord.status.includes("Returned")) ||
        (filter === "EXCEPTIONS" && ord.status.includes("Delayed") || ord.status.includes("Incomplete"));

      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        ord.id.includes(q) ||
        ord.item.toLowerCase().includes(q) ||
        ord.customer.toLowerCase().includes(q) ||
        ord.status.toLowerCase().includes(q) ||
        ord.scenarioType.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [filter, search]);

  const copyAllPrompts = () => {
    const text = ALL_20_ORDERS.map(
      (o) => `• Order #${o.id} (${o.item} - ${o.status}): "${o.actionPrompt}"`
    ).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 sm:p-4 space-y-3">
      {/* Header Info & Teammate Share Box */}
      <div
        className="grid-bg"
        style={{
          border: "2px solid var(--color-warm-border)",
          boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.6), 2px 2px 0 var(--color-tan)",
          padding: "12px 14px",
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <div
            className="text-[9px] tracking-[0.15em] uppercase font-bold"
            style={{ fontFamily: "var(--font-mono)", color: "var(--color-warm-mid)" }}
          >
            TEST SUITE &bull; 20 ORDERS (1–20)
          </div>
          <button
            onClick={copyAllPrompts}
            className="text-[9px] font-mono font-bold px-2 py-0.5 transition-all cursor-pointer"
            style={{
              background: copied ? "var(--color-success)" : "var(--color-terra)",
              color: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.15)",
            }}
          >
            {copied ? "✓ COPIED TO CLIPBOARD" : "📋 COPY ALL 20 PROMPTS"}
          </button>
        </div>
        <h3
          className="font-bold tracking-wider uppercase mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)", fontSize: 13 }}
        >
          Customer Service Test Scenarios
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-warm-text)" }}>
          20 realistic scenarios covering delivery tracking, ETA lookup, address changes, cancellations, and returns. Tap any order below or speak to IRIS.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2">
        {/* Search input */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID (1-20), item name, or scenario..."
          className="retro-input w-full text-xs px-3 py-1.5"
        />

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1 text-[9px] font-mono">
          {[
            { id: "ALL", label: `ALL (20)` },
            { id: "DELIVERY", label: "OUT FOR DELIVERY" },
            { id: "TRANSIT", label: "SHIPPED" },
            { id: "WAREHOUSE", label: "PROCESSING" },
            { id: "DELIVERED", label: "DELIVERED" },
            { id: "EXCEPTIONS", label: "DELAYS / ISSUES" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="px-2 py-1 transition-all cursor-pointer font-bold"
              style={{
                background: filter === tab.id ? "var(--color-terra)" : "var(--color-parchment)",
                color: filter === tab.id ? "#FFFFFF" : "var(--color-warm-text)",
                border: "1px solid var(--color-warm-border)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 20 Orders List */}
      <div className="space-y-2">
        <div
          className="text-[9px] tracking-[0.12em] uppercase font-bold text-warm-mid font-mono flex items-center justify-between"
        >
          <span>SHOWING {filteredOrders.length} OF 20 SCENARIOS</span>
          <span>TAP CARD TO ASK IRIS</span>
        </div>

        {filteredOrders.map((ord) => (
          <button
            key={ord.id}
            onClick={() => handleSelectOrder(ord.actionPrompt)}
            className="w-full text-left transition-all cursor-pointer"
            style={{
              background: "var(--color-cream)",
              border: "2px solid var(--color-warm-border)",
              boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.6), 2px 2px 0 var(--color-tan)",
              padding: "10px 12px",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--color-terra)";
              el.style.background = "var(--color-parchment)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--color-warm-border)";
              el.style.background = "var(--color-cream)";
            }}
          >
            {/* Top row: Order ID + Scenario Tag + Status Badge */}
            <div className="flex items-center justify-between mb-1 gap-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background: "var(--color-terra)",
                    color: "#FFFFFF",
                  }}
                >
                  #{ord.id}
                </span>
                <span className="text-[9px] font-mono text-warm-mid font-semibold uppercase">
                  {ord.scenarioType}
                </span>
              </div>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 shrink-0"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: ord.badgeColor.bg,
                  border: `1px solid ${ord.badgeColor.border}`,
                  color: ord.badgeColor.text,
                }}
              >
                {ord.badge}
              </span>
            </div>

            {/* Item & Price */}
            <div className="flex items-baseline justify-between mb-0.5">
              <span className="font-semibold text-xs sm:text-sm" style={{ color: "var(--color-ink)" }}>
                {ord.item}
              </span>
              <span className="text-xs font-mono font-bold shrink-0 ml-2" style={{ color: "var(--color-warm-text)" }}>
                {ord.price}
              </span>
            </div>

            {/* Status & ETA */}
            <p className="text-[11px] mb-1.5" style={{ color: "var(--color-warm-text)" }}>
              Customer: <strong style={{ color: "var(--color-ink)" }}>{ord.customer}</strong> &bull; {ord.status} &bull; <span className="italic">{ord.eta}</span>
            </p>

            {/* Voice Prompt Shortcut */}
            <div
              className="text-[10px] font-mono font-medium flex items-center gap-1"
              style={{ color: "var(--color-terra)" }}
            >
              <span>&rsaquo; Ask: &ldquo;{ord.actionPrompt}&rdquo;</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
