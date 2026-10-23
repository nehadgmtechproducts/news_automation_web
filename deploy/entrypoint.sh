#!/bin/sh
# Runs the website and restarts it whenever a story is added or changed.
#
# Why: `next start` only learns about files in public/ when it starts, so a picture added after
# that returns 404 until the server restarts (verified). The backend adds pictures every time a
# story is approved, so this script watches the content folders and restarts the server a moment
# after they change. Text-only changes would show up without a restart; restarting for every
# change keeps things simple and takes about a second.
set -u

WATCH="content/articles public/media"
INTERVAL="${WATCH_INTERVAL_SECONDS:-5}"

fingerprint() {
  # name + size + modified time of every file; changes when anything is added, removed or rewritten
  find $WATCH -type f -printf '%p %s %T@\n' 2>/dev/null | sort | md5sum | cut -d' ' -f1
}

PID=""
start() {
  node_modules/.bin/next start -p "${PORT:-3000}" -H "${HOSTNAME:-0.0.0.0}" &
  PID=$!
}
stop() {
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null
    wait "$PID" 2>/dev/null
  fi
  PID=""
}
trap 'stop; exit 0' TERM INT

LAST="$(fingerprint)"
start
while true; do
  sleep "$INTERVAL"
  if [ -n "$PID" ] && ! kill -0 "$PID" 2>/dev/null; then
    echo "[watch] server exited; stopping container so Docker restarts it"
    exit 1
  fi
  NOW="$(fingerprint)"
  if [ "$NOW" != "$LAST" ]; then
    # let the backend finish writing (JSON is written last, pictures first): wait until it is stable
    sleep "$INTERVAL"
    SETTLED="$(fingerprint)"
    if [ "$SETTLED" = "$NOW" ]; then
      echo "[watch] content changed; restarting the website"
      stop
      start
      LAST="$SETTLED"
    fi
  fi
done
