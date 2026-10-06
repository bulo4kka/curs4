#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PIDS=()
cleanup() {
  echo -e "\n[run.sh] Останавливаю процессы…"
  for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done
  pkill -f "node index.js" 2>/dev/null || true
  pkill -f "vite" 2>/dev/null || true
  wait 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

[ -d server/node_modules ] || (echo "[run.sh] npm install server…" && (cd server && npm install))
[ -d client/node_modules ] || (echo "[run.sh] npm install client…" && (cd client && npm install))

echo "[run.sh] Инициализация и сидинг SQLite…"
(cd server && node seed.js)

echo "[run.sh] Запуск сервера (Express + Socket.io)…"
(cd server && exec node index.js) &
PIDS+=($!)

echo "[run.sh] Запуск клиента (Vite)…"
(cd client && exec npm run dev) &
PIDS+=($!)

echo "[run.sh] API: http://localhost:3001 · Клиент: http://localhost:5173"
wait
