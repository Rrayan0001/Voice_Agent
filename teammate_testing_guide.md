# 📦 Apex Customer Support Voice Assistant — Teammate Testing Guide (20 Scenarios)

This guide contains the complete collection of **20 Order Scenarios** implemented in the **Apex Customer Support Voice Assistant**. Share this guide with your teammates so they can test voice commands, live translations, and order tools across multiple devices.

---

## 🌐 Quick Access URLs

| Platform | Access URL | Notes |
|---|---|---|
| **Local Machine** | [http://localhost:3000](http://localhost:3000) | Open in Chrome, Safari, or Edge |
| **Local WiFi / Mobile Phones** | `http://192.168.1.7:3000` | Open directly on phone browser connected to same WiFi |
| **Backend API** | [http://localhost:8000](http://localhost:8000) | FastAPI order & translation server |

> [!TIP]
> **No CORS Errors**: The backend and frontend are pre-configured with permissive network origin matching and Node.js proxying so teammates accessing from mobile phones or external laptops on the network will experience zero CORS issues.

---

## 🎯 The 20 Test Scenarios Matrix

### Scenario Category 1: Live Courier Tracking & Real-Time ETAs
| Order ID | Customer | Item & Price | Voice Prompt to Test | Expected Tool | Expected Assistant Response |
|---|---|---|---|---|---|
| **Order #1** | John Smith | Wireless Headphones ($79.99) | *"Where is my Order 1?"* or *"Check Order 1"* | `check_order_status` | Out for Delivery — Courier is 4 stops away, expected by 3:00 PM today. |
| **Order #9** | Tony Stark | 4K GPS Drone ($799.00) | *"Check Order 9, does it need a signature?"* | `check_order_status` | Out for Delivery — Courier in area; adult signature required upon handoff. |
| **Order #11** | Clark Kent | Laptop Stand & Dock ($45.00) | *"When will Order 11 arrive today?"* | `check_order_status` | Out for Delivery — Same-day driver estimated within 45 minutes. |

---

### Scenario Category 2: In-Transit Shipping & Hub Tracking
| Order ID | Customer | Item & Price | Voice Prompt to Test | Expected Tool | Expected Assistant Response |
|---|---|---|---|---|---|
| **Order #2** | Sarah Connor | Running Shoes ($120.00) | *"Where is Order 2 right now?"* | `check_order_status` | Shipped via FedEx — In transit, estimated delivery tomorrow afternoon. |
| **Order #6** | Bruce Wayne | 4-Camera Security Kit ($320.00) | *"Track Order 6"* | `check_order_status` | Shipped via UPS 2-Day Air — Scheduled for Wednesday by 5:00 PM. |
| **Order #17** | Leia Organa | Organic Bedding Set ($160.00) | *"Where is Order 17?"* | `check_order_status` | Shipped via FedEx Ground — Departed Atlanta hub, ETA Thursday. |

---

### Scenario Category 3: Address Updates & Reroutes
| Order ID | Customer | Item & Price | Voice Prompt to Test | Expected Tool | Expected Assistant Response |
|---|---|---|---|---|---|
| **Order #7** | Diana Prince | Travel Duffel ($145.00) | *"Change the address for Order 7 to 500 Park Avenue"* | `update_shipping_address` | Address updated to 500 Park Avenue prior to warehouse dispatch. |
| **Order #12** | Barry Allen | GPS Smartwatch ($210.00) | *"Update my address for Order 12 to include Apartment 4B"* | `update_shipping_address` | Delivery address updated with Apt 4B; pause on delivery lifted. |
| **Order #14** | Steve Rogers | Workshop Tool Chest ($450.00) | *"Update shipping address for Order 14 to 100 Main Street"* | `update_shipping_address` | Heavy freight shipping destination updated to 100 Main Street. |

---

### Scenario Category 4: Order Cancellations & Immediate Refunds
| Order ID | Customer | Item & Price | Voice Prompt to Test | Expected Tool | Expected Assistant Response |
|---|---|---|---|---|---|
| **Order #3** | Arthur Dent | Espresso Machine ($189.50) | *"I want to cancel Order 3 and get a refund"* | `cancel_order` | Order #3 cancelled in warehouse; full refund of $189.50 processed. |
| **Order #16** | Luke Skywalker | Motorized Telescope ($340.00) | *"Cancel Order 16 before it ships"* | `cancel_order` | Order #16 successfully cancelled prior to dispatch cutoff; refund issued. |
| **Order #20** | Hermione Granger | Portable Monitor ($199.99) | *"Can I still cancel Order 20?"* | `cancel_order` | Order #20 halted at loading dock and cancelled with full refund. |

---

### Scenario Category 5: Delivered Package Verification & 30-Day Returns
| Order ID | Customer | Item & Price | Voice Prompt to Test | Expected Tool | Expected Assistant Response |
|---|---|---|---|---|---|
| **Order #4** | Emily Watson | Gaming Keyboard ($95.00) | *"I want to return Order 4 for a refund"* | `file_return_request` | Return approved; prepaid return label emailed to customer. |
| **Order #8** | Peter Parker | Countertop Blender ($89.99) | *"Did my refund for Order 8 go through?"* | `check_order_status` | Status verified: Returned & full refund of $89.99 credited to Visa. |
| **Order #10** | Natasha Romanoff | Hiking Boots ($165.00) | *"I need to return or exchange Order 10"* | `file_return_request` | Return authorized; prepaid shipping slip sent to customer. |
| **Order #18** | Han Solo | Automotive Jump Starter ($85.00) | *"Where was Order 18 delivered?"* | `check_order_status` | Delivered yesterday morning and placed by side garage door. |
| **Order #19** | Harry Potter | Leather Journal Set ($55.00) | *"I would like to return Order 19"* | `file_return_request` | Return request approved; prepaid return label dispatched. |

---

### Scenario Category 6: Delivery Exceptions & Special Pickups
| Order ID | Customer | Item & Price | Voice Prompt to Test | Expected Tool | Expected Assistant Response |
|---|---|---|---|---|---|
| **Order #5** | Michael Scott | Ergonomic Chair ($249.00) | *"Why is Order 5 delayed?"* | `check_order_status` | Delayed due to regional winter storm advisory; new delivery in 2 days. |
| **Order #13** | Wanda Maximoff | Dutch Oven ($115.00) | *"When will Order 13 arrive?"* | `check_order_status` | Rail freight congestion delay checked; updated delivery Friday by 7 PM. |
| **Order #15** | James Bond | Wireless Earbuds ($135.00) | *"Where do I pick up Order 15?"* | `check_order_status` | Deposited into Apex Smart Locker #12 (Main St Branch); pickup PIN sent. |

---

## 🎙️ How to Test on Mobile or Desktop

1. Open **[http://localhost:3000](http://localhost:3000)** (or `http://192.168.1.7:3000` on your phone).
2. Tap **`[▶ START CALL]`** in the bottom dock.
3. Speak any test prompt from the matrix above (e.g., *"Where is my Order 1?"* or *"Cancel Order 3"*).
4. Watch the **Live Dialogue** display on screen transcribe your words live and show IRIS's formatted response.
5. Try switching the **`TRANSLATE`** dropdown to **Español**, **Français**, **Deutsch**, or **हिन्दी** to see instant real-time translated subtitles!
6. Tap the **`[⏹ STOP]`** button anytime to instantly silence IRIS or end the session.
