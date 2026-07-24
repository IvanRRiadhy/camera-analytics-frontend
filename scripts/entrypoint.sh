#!/bin/bash
# =============================================================================
# entrypoint.sh — Docker container entrypoint
# 1. Clone or update the repo
# 2. Initial build
# 3. Set up cron for daily auto-update
# 4. Start update server
# 5. Start Nginx
# =============================================================================

set -e

REPO_DIR="/app/repo"
HTML_DIR="/usr/share/nginx/html"
SCRIPTS_DIR="/app/scripts"
LOG_FILE="/var/log/wa-agent-update.log"

GIT_REPO_URL="${GIT_REPO_URL:-https://github.com/IvanRRiadhy/WAAPI.git}"
GIT_BRANCH="${GIT_BRANCH:-main}"
TZ="${TZ:-Asia/Jakarta}"
API_BASE_URL="${API_BASE_URL:-}"

export GIT_BRANCH

log() {
    echo "[entrypoint $(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ---- Step 1: Clone or update repo ----
if [ -d "$REPO_DIR/.git" ]; then
    log "Repo already exists, pulling latest..."
    cd "$REPO_DIR"
    git fetch origin "$GIT_BRANCH"
    git reset --hard "origin/$GIT_BRANCH"
else
    log "Cloning repo: $GIT_REPO_URL (branch: $GIT_BRANCH)..."
    git clone --branch "$GIT_BRANCH" --single-branch "$GIT_REPO_URL" "$REPO_DIR"
    cd "$REPO_DIR"
fi

CURRENT_HASH=$(git rev-parse HEAD)
log "Repo at commit: $CURRENT_HASH"

# ---- Step 2: Initial build ----
log "Installing dependencies..."
npm ci --production=false 2>&1 | tee -a "$LOG_FILE"

log "Building production bundle..."
npm run build 2>&1 | tee -a "$LOG_FILE"

# ---- Inject runtime config from environment ----
log "Writing runtime config (API_BASE_URL=${API_BASE_URL})..."
cat > dist/config.json <<CONFIG
{
  "API_BASE_URL": "${API_BASE_URL}"
}
CONFIG

log "Deploying to Nginx..."
rm -rf "${HTML_DIR:?}"/*
cp -r dist/* "$HTML_DIR/"

# Write initial status
cat > /tmp/update-status.json <<EOF
{
  "last_check": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "status": "initial_build",
  "message": "Container started with fresh build",
  "branch": "$GIT_BRANCH",
  "commit": "$CURRENT_HASH"
}
EOF

log "Initial build deployed successfully!"

# ---- Step 3: Set up cron for daily auto-update at 00:00 ----
log "Setting up daily update cron (00:00 $TZ)..."

# Create cron entry
echo "0 0 * * * GIT_BRANCH=$GIT_BRANCH $SCRIPTS_DIR/update-check.sh >> $LOG_FILE 2>&1" > /etc/crontabs/root

# Start crond in the background
crond -b -l 2
log "Cron daemon started."

# ---- Step 4: Start the update HTTP server in the background ----
log "Starting update server on port 9000..."

# Use a simple socat-based server
(
    while true; do
        socat TCP-LISTEN:9000,reuseaddr,fork EXEC:"$SCRIPTS_DIR/update-handler.sh" 2>/dev/null || {
            sleep 1
        }
    done
) &
UPDATE_SERVER_PID=$!
log "Update server started (PID: $UPDATE_SERVER_PID)."

# ---- Step 5: Start Nginx in foreground ----
log "Starting Nginx..."
exec nginx -g 'daemon off;'
