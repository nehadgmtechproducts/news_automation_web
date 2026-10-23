#!/usr/bin/env bash
# Commit and push newly published stories, and ONLY stories.
#
# The backend writes each approved story into content/articles and public/media. This script turns
# those new files into a git commit and pushes it, so nobody has to commit after every approval.
# It touches nothing else: your code changes, staged or not, are left exactly as they are.
#
# Safe to run as often as you like (it does nothing when there is nothing new). Run it from cron,
# launchd or a systemd timer; see deploy/README.md.
#
# Settings (environment variables, all optional):
#   REPO_DIR        the git repo to publish from        (default: the repo this script lives in)
#   PUBLISH_BRANCH  only publish while on this branch   (default: main)
#   SETTLE_SECONDS  wait for the backend to finish writing before committing (default: 15)
set -euo pipefail

REPO="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BRANCH="${PUBLISH_BRANCH:-main}"
SETTLE="${SETTLE_SECONDS:-15}"
PATHS=(content/articles public/media)

cd "$REPO"
log() { echo "[publish-content $(date -u +%H:%M:%S)] $*"; }

# One run at a time: a slow push must not overlap the next scheduled run.
LOCK="$(git rev-parse --git-dir)/publish-content.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  # a lock older than 30 minutes is a crashed run, not a running one
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +30 2>/dev/null)" ]; then rmdir "$LOCK" && mkdir "$LOCK"; else log "another run is in progress; skipping"; exit 0; fi
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

current="$(git rev-parse --abbrev-ref HEAD)"
if [ "$current" != "$BRANCH" ]; then log "on branch '$current', not '$BRANCH'; skipping"; exit 0; fi

# Anything new? (untracked, modified or deleted files under the story folders)
if [ -z "$(git status --porcelain -- "${PATHS[@]}")" ]; then exit 0; fi

# The backend writes pictures first and the JSON last. If files are still changing, wait; if they
# are STILL changing afterwards, leave it for the next run rather than commit half a story.
fingerprint() { find "${PATHS[@]}" -type f -print0 2>/dev/null | sort -z | xargs -0 cksum 2>/dev/null | cksum; }
before="$(fingerprint)"; sleep "$SETTLE"; after="$(fingerprint)"
if [ "$before" != "$after" ]; then log "files are still being written; will retry next run"; exit 0; fi

git add -A -- "${PATHS[@]}"
if git diff --cached --quiet -- "${PATHS[@]}"; then exit 0; fi

# Message: the headline of every story added or changed.
titles=""; count=0
while IFS=$'\t' read -r status file; do
  case "$file" in content/articles/*.json) ;; *) continue ;; esac
  count=$((count + 1))
  if [ "$status" = "D" ]; then
    titles="${titles}- removed: $(basename "$file" .json)"$'\n'
  else
    title="$(sed -n 's/^  "title": "\(.*\)",$/\1/p' "$file" | head -1)"
    titles="${titles}- ${title:-$(basename "$file" .json)}"$'\n'
  fi
done < <(git diff --cached --name-status -- content/articles)

if [ "$count" -gt 0 ]; then
  subject="Publish $count $([ "$count" = 1 ] && echo story || echo stories)"
else
  subject="Update story media"
fi

# --only: commit just these paths, leaving anything else that is staged in the index untouched.
git commit --only -q -m "$subject" -m "${titles:-Pictures only.}" -- "${PATHS[@]}"
log "committed: $subject"

if ! git push -q origin "$BRANCH" 2>/dev/null; then
  # the remote moved on (someone pushed code): replay our commit on top and try once more
  git pull -q --rebase --autostash origin "$BRANCH"
  git push -q origin "$BRANCH"
fi
log "pushed to origin/$BRANCH"
