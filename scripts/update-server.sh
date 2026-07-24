#!/bin/bash
# =============================================================================
# update-server.sh — Minimal HTTP server for manual update triggers
# Listens on port 9000 and handles:
#   GET /check  — triggers update-check.sh and returns the result
#   GET /status — returns the last update status
# =============================================================================

PORT=9000
STATUS_FILE="/tmp/update-status.json"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

log() {
    echo "[update-server $(date '+%H:%M:%S')] $1"
}

send_response() {
    local status_code="$1"
    local content_type="$2"
    local body="$3"
    local content_length=${#body}

    printf "HTTP/1.1 %s\r\nContent-Type: %s\r\nContent-Length: %d\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n%s" \
        "$status_code" "$content_type" "$content_length" "$body"
}

handle_request() {
    local request_line
    read -r request_line

    # Consume remaining headers
    while IFS= read -r header; do
        header=$(echo "$header" | tr -d '\r\n')
        [ -z "$header" ] && break
    done

    local method path
    method=$(echo "$request_line" | awk '{print $1}')
    path=$(echo "$request_line" | awk '{print $2}')

    # Strip trailing slash
    path="${path%/}"

    log "$method $path"

    case "$path" in
        /check)
            if [ "$method" = "GET" ] || [ "$method" = "POST" ]; then
                log "Triggering update check..."
                output=$("$SCRIPT_DIR/update-check.sh" 2>&1)
                exit_code=$?

                if [ -f "$STATUS_FILE" ]; then
                    result=$(cat "$STATUS_FILE")
                else
                    result="{\"status\":\"error\",\"message\":\"No status file found\",\"exit_code\":$exit_code}"
                fi

                send_response "200 OK" "application/json" "$result"
            else
                send_response "405 Method Not Allowed" "application/json" '{"error":"Method not allowed"}'
            fi
            ;;
        /status)
            if [ -f "$STATUS_FILE" ]; then
                send_response "200 OK" "application/json" "$(cat "$STATUS_FILE")"
            else
                send_response "200 OK" "application/json" '{"status":"unknown","message":"No update check has been run yet"}'
            fi
            ;;
        *)
            send_response "404 Not Found" "application/json" '{"error":"Not found. Use /check or /status"}'
            ;;
    esac
}

log "Starting update server on port $PORT..."

# Use socat to handle HTTP requests
while true; do
    socat TCP-LISTEN:${PORT},reuseaddr,fork SYSTEM:"$0 --handle" 2>/dev/null || {
        log "socat not available, falling back to netcat..."
        break
    }
done

# Fallback: netcat-based server (busybox nc in Alpine)
while true; do
    handle_request | nc -l -p ${PORT} -q 1 2>/dev/null || \
    handle_request | nc -l -p ${PORT} 2>/dev/null
done
