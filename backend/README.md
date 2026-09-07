# Voice Agent Backend

FastAPI backend service powering the Voice Agent customer support platform.

## Architecture

- **`main.py`**: FastAPI server handling CORS, REST endpoints, Vapi webhooks, and live translation.
- **`order_service.py`**: Customer order management engine with 20 realistic mock orders (#1 to #20), status queries, address updates, cancellations, returns, and speech normalization (e.g. converting spoken words "order one" to "1").
- **`vapi_manager.py`**: Vapi Assistant configuration, system prompts for customer support agent **IRIS**, and function-calling tool definitions.

## Requirements

- Python 3.10+
- `fastapi`, `uvicorn`, `httpx`, `python-dotenv`, `pydantic`

## Setup & Running

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   *Or with `uv`:*
   ```bash
   uv pip install -r requirements.txt
   ```

2. **Configure environment**:
   Copy `.env.example` to `.env` and provide your Vapi keys:
   ```bash
   cp .env.example .env
   ```

3. **Start the server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Key Endpoints

- `GET /api/config`: Returns active public configuration (Vapi public key, assistant ID).
- `POST /api/config`: Updates runtime configuration.
- `GET /api/orders/status`: Returns current status and details for all orders or a filtered query.
- `POST /api/vapi/webhook`: Webhook handler for Vapi function calls during live voice conversations.
- `POST /api/translate`: Neural translation proxy (MyMemory + Google Translate failover).
- `POST /api/temporal/simulate`: Simulates an order query directly via text.
