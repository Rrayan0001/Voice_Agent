#!/bin/bash
# ========================================================
# Voice Agent - Quickstart Runner Script
# Starts both Backend (FastAPI :8000) and Frontend (Next.js :3000)
# ========================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "========================================================"
echo " 🎙️  VOICE AGENT - STARTING FULL STACK SERVICE"
echo "========================================================"

# Trap exits to kill background processes gracefully
cleanup() {
    echo ""
    echo "🛑 Shutting down Voice Agent services..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend
echo "📦 Starting FastAPI backend on http://0.0.0.0:8000..."
cd "$DIR/backend"
if command -v uv &> /dev/null; then
    uv run --with fastapi --with uvicorn --with httpx --with python-dotenv --with pydantic uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
else
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
fi
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# 2. Start Frontend
echo "💻 Starting Next.js frontend on http://0.0.0.0:3000..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================================"
echo " ✨ Voice Agent is LIVE!"
echo " 👉 Web Portal:    http://localhost:3000"
echo " 👉 Backend API:   http://localhost:8000/docs"
echo " 👉 Orders Guide:  teammate_testing_guide.md"
echo " Press CTRL+C to stop all services."
echo "========================================================"

wait
