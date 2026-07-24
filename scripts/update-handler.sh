#!/bin/bash
# =============================================================================
# update-handler.sh — Handles a single HTTP request from socat
# Called by: socat TCP-LISTEN:9000,fork EXEC:"/app/scripts/update-handler.sh"
# =============================================================================

STATUS_FILE="/tmp/update-status.json"
SCRIPTS_DIR="/app/scripts"

send_response() {
    local status_code="$1"
    local body="$2"
    local content_length=${#body}

    printf "HTTP/1.1 %s\r\n" "$status_code"
    printf "Content-Type: application/json\r\n"
    printf "Content-Length: %d\r\n" "$content_length"
    printf "Access-Control-Allow-Origin: *\r\n"
    printf "Connection: close\r\n"
    printf "\r\n"
    printf "%s" "$body"
}

# Read the request line
read -r request_line

method=$(echo "$request_line" | awk '{print $1}')
path=$(echo "$request_line" | awk '{print $2}')

# Consume headers
while IFS= read -r header; do
    header=$(echo "$header" | tr -d '\r\n')
    [ -z "$header" ] && break
done

# Strip query string and trailing slash
path="${path%%\?*}"
path="${path%/}"

case "$path" in
    /check)
        # Run the update check
        output=$("$SCRIPTS_DIR/update-check.sh" 2>&1)
        
        if [ -f "$STATUS_FILE" ]; then
            send_response "200 OK" "$(cat "$STATUS_FILE")"
        else
            send_response "500 Internal Server Error" '{"status":"error","message":"Update check failed"}'
        fi
        ;;
    /status)
        if [ -f "$STATUS_FILE" ]; then
            send_response "200 OK" "$(cat "$STATUS_FILE")"
        else
            send_response "200 OK" '{"status":"unknown","message":"No update check has been run yet"}'
        fi
        ;;
    /logs)
        # Return the last 50 lines of the update log
        if [ -f "/var/log/wa-agent-update.log" ]; then
            logs=$(tail -50 /var/log/wa-agent-update.log | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}')
            send_response "200 OK" "{\"logs\":\"$logs\"}"
        else
            send_response "200 OK" '{"logs":"No logs available"}'
        fi
        ;;
    *)
        send_response "404 Not Found" '{"error":"Not found","endpoints":["/check","/status","/logs"]}'
        ;;
esac
