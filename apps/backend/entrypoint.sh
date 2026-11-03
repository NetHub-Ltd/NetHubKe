#!/usr/bin/env sh
set -eu

echo "NetHubKe backend starting (Architecture A resource server)"

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running Alembic migrations (sync)..."
  alembic upgrade head
fi

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8000}"
WORKERS="${WORKERS:-1}"

echo "Starting uvicorn on ${HOST}:${PORT} (workers=${WORKERS})"
exec uvicorn app.main:app --host "${HOST}" --port "${PORT}" --workers "${WORKERS}"
