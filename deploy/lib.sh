# shellcheck shell=bash
# Shared by deploy.sh, backup.sh and restore.sh (sourced, not run). Lives next to them in
# /home/pranayoga/app/.

# This user's rootless Docker, also from cron and forced-command SSH sessions, where the login
# environment isn't set up. An explicit DOCKER_HOST wins.
if [[ -z "${DOCKER_HOST:-}" ]]; then
  rootless_socket="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}/docker.sock"
  if [[ -S "$rootless_socket" ]]; then export DOCKER_HOST="unix://$rootless_socket"; fi
fi

LOCAL_IMAGE=pranayoga-app
# First start on a small server: migrations, cache refresh and warm-up.
HEALTH_TIMEOUT_SECONDS=420

log() { printf '[%s] %s\n' "${LOG_TAG:-pranayoga}" "$*" >&2; }
die() {
  log "error: $*"
  exit 1
}

# One deploy, rollback, restore or backup at a time, whether from CI, cron or by hand. Waits up
# to $1 seconds for a running one to finish. Scripts started while the lock is held
# (restore.sh runs backup.sh) inherit PRANAYOGA_LOCK_HELD and don't wait for themselves.
take_lock() {
  local wait_seconds="$1"
  if [[ "${PRANAYOGA_LOCK_HELD:-}" == 1 ]]; then return 0; fi
  exec 9>"$APP_DIR/.deploy.lock"
  if ! flock -n 9; then
    log "another deploy, restore or backup is running; waiting up to ${wait_seconds}s"
    flock -w "$wait_seconds" 9 || die "gave up waiting for the other deploy, restore or backup"
  fi
  export PRANAYOGA_LOCK_HELD=1
}

revision_of() {
  docker image inspect -f '{{ index .Config.Labels "org.opencontainers.image.revision" }}' \
    "$1" 2>/dev/null || true
}

has_image() { docker image inspect "$1" >/dev/null 2>&1; }

# uploads/ is bind-mounted; the app runs as `node` inside the container, a user that owns
# nothing on this host. Hand the folder to it on every start (cheap, repairs a restored folder),
# and keep it readable for `pranayoga`, whose backup.sh archives it from the host. Others can't
# reach it: the app folder is 700.
UPLOADS_OWNER_FIX='chown -R node:node /app/uploads && chmod -R u+rwX,go+rX /app/uploads'
fix_upload_owner() {
  mkdir -p uploads
  docker compose run --rm --no-deps --user root --entrypoint sh app -c "$UPLOADS_OWNER_FIX"
}

# (Re)starts the app on pranayoga-app:current, with the database up first.
start_current() {
  docker compose up -d --wait db
  fix_upload_owner
  docker compose up -d --no-deps --force-recreate app
}

# Waits for the image's HEALTHCHECK: healthy once the cache refresh ran and /next/health/ is 200.
# Gives up at once if the app exits or restarts: its start script exits when the refresh fails,
# and every restart would only start the wait over.
wait_healthy() {
  local deadline=$((SECONDS + HEALTH_TIMEOUT_SECONDS)) id state status restarts health
  local format='{{ .State.Status }} {{ .RestartCount }} {{ if .State.Health }}{{ .State.Health.Status }}{{ end }}'
  while ((SECONDS < deadline)); do
    id="$(docker compose ps --all -q app)"
    state="$(docker inspect -f "$format" "$id" 2>/dev/null || echo 'missing 0')"
    read -r status restarts health <<<"$state"
    if [[ "$health" == healthy ]]; then return 0; fi
    if [[ "$status" =~ ^(exited|dead|restarting)$ ]] || ((restarts > 0)); then
      log "the app stopped during start-up (state: $status, restarts: $restarts)"
      return 1
    fi
    sleep 3
  done
  log "the app did not get healthy within ${HEALTH_TIMEOUT_SECONDS}s"
  return 1
}
