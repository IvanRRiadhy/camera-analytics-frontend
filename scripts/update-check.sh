#!/bin/bash
# =============================================================================
# update-check.sh — Check git for updates, rebuild if new commits are found
# =============================================================================

set -e

REPO_DIR="/app/repo"
HTML_DIR="/usr/share/nginx/html"
LOG_FILE="/var/log/wa-agent-update.log"
LOCK_FILE="/tmp/update-check.lock"
STATUS_FILE="/tmp/update-status.json"

GIT_BRANCH="${GIT_BRANCH:-main}"
API_BASE_URL="${API_BASE_URL:-}"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

write_status() {
    local status="$1"
    local message="$2"
    local commit="${3:-unknown}"
    cat > "$STATUS_FILE" <<EOF
{
  "last_check": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "status": "$status",
  "message": "$message",
  "branch": "$GIT_BRANCH",
  "commit": "$commit"
}
EOF
}

# Prevent concurrent runs
if [ -f "$LOCK_FILE" ]; then
    LOCK_PID=$(cat "$LOCK_FILE" 2>/dev/null)
    if kill -0 "$LOCK_PID" 2>/dev/null; then
        log "Update check already running (PID $LOCK_PID), skipping."
        write_status "skipped" "Another update is already in progress"
        exit 0
    else
        log "Stale lock file found, removing."
        rm -f "$LOCK_FILE"
    fi
fi

echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

cd "$REPO_DIR"

log "=== Starting update check ==="
log "Branch: $GIT_BRANCH"

# Fetch latest from remote
log "Fetching from origin..."
git fetch origin "$GIT_BRANCH" 2>&1 | tee -a "$LOG_FILE"

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse "origin/$GIT_BRANCH")

log "Local:  $LOCAL_HASH"
log "Remote: $REMOTE_HASH"

if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
    log "No updates found. Already up to date."
    write_status "up_to_date" "No new commits" "$LOCAL_HASH"
    exit 0
fi

log "New commits detected! Pulling and rebuilding..."

# Pull latest changes
git reset --hard "origin/$GIT_BRANCH" 2>&1 | tee -a "$LOG_FILE"

NEW_HASH=$(git rev-parse HEAD)
COMMIT_MSG=$(git log -1 --pretty=format:"%s" HEAD)
log "Updated to: $NEW_HASH ($COMMIT_MSG)"

# Install dependencies (in case package.json changed)
log "Installing dependencies..."
npm ci --production=false 2>&1 | tee -a "$LOG_FILE"

# Build
log "Building production bundle..."
npm run build 2>&1 | tee -a "$LOG_FILE"

# Inject runtime config
log "Writing runtime config (API_BASE_URL=${API_BASE_URL})..."
cat > dist/config.json <<CONFIG
{
  "API_BASE_URL": "${API_BASE_URL}"
}
CONFIG

# Deploy — replace Nginx html root
log "Deploying new build..."
rm -rf "${HTML_DIR:?}"/*
cp -r dist/* "$HTML_DIR/"

log "=== Update complete! ==="
write_status "updated" "Updated to: $COMMIT_MSG" "$NEW_HASH"
