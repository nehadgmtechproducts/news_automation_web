#!/usr/bin/env bash
# Turn the auto-publisher on or off on a Mac (a launchd job that runs publish-content.sh every 5 minutes).
#   ./scripts/auto-publish-macos.sh install     start it in the background (also after every login)
#   ./scripts/auto-publish-macos.sh status      is it loaded? show the last log lines
#   ./scripts/auto-publish-macos.sh uninstall   stop it and remove it
#   ./scripts/auto-publish-macos.sh watch       no background job: run it in THIS Terminal window until Ctrl+C
#
# macOS blocks background jobs from reading ~/Documents, ~/Desktop and ~/Downloads unless /bin/bash has
# "Full Disk Access" (System Settings > Privacy & Security). If the repo is in one of those folders,
# `install` detects the block, removes the job and tells you; use `watch`, or grant the access and
# install again. Terminal windows are not affected.
# On a Linux server use cron instead (see deploy/README.md).
set -euo pipefail

LABEL="com.thebrief.publish-content"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/thebrief-publish-content.log"
DOMAIN="gui/$(id -u)"

case "${1:-}" in
  install)
    mkdir -p "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"
    cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>/bin/bash</string><string>$REPO/scripts/publish-content.sh</string></array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin</string>
    <key>REPO_DIR</key><string>$REPO</string>
  </dict>
  <key>StartInterval</key><integer>300</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
</dict>
</plist>
PLIST
    launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
    : > "$LOG"
    launchctl bootstrap "$DOMAIN" "$PLIST"     # RunAtLoad makes it run once right now: a built-in self-test
    sleep 6
    if grep -q "Operation not permitted" "$LOG" 2>/dev/null; then
      launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
      rm -f "$PLIST"
      echo "NOT installed: macOS stopped the background job from reading $REPO." >&2
      echo "Either:" >&2
      echo "  1. run  $0 watch  in a Terminal window (it works while that window is open), or" >&2
      echo "  2. give /bin/bash \"Full Disk Access\" (System Settings > Privacy & Security > Full Disk Access)," >&2
      echo "     then run  $0 install  again, or" >&2
      echo "  3. run it on the server instead, where cron has no such restriction (see deploy/README.md)." >&2
      exit 1
    fi
    echo "Installed. New stories in $REPO are committed and pushed every 5 minutes."
    echo "Log: $LOG"
    ;;
  watch)
    echo "Publishing new stories every 5 minutes. Press Ctrl+C to stop. (Repo: $REPO)"
    while true; do
      "$REPO/scripts/publish-content.sh" || echo "[watch] run failed; trying again in 5 minutes"
      sleep 300
    done
    ;;
  status)
    if launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then echo "running (every 5 minutes)"; else echo "not installed"; fi
    [ -f "$LOG" ] && tail -n 8 "$LOG" || echo "(no log yet: nothing has been published since it was installed)"
    ;;
  uninstall)
    launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
    rm -f "$PLIST"
    echo "Removed. Stories will no longer be committed automatically."
    ;;
  *)
    echo "usage: $0 install | status | uninstall | watch" >&2; exit 2 ;;
esac
