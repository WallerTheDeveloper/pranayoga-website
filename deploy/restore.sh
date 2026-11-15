#!/usr/bin/env bash
# Replaces the database and uploads/ with a backup folder: a nightly backup, the first-load
# export (scripts/first-load-export.mjs) or, at the OVH move, the last staging backup.
# Lives in /home/pranayoga/app/ and runs as `pranayoga`. See docs/DEPLOY.md.
#
#   restore.sh <folder with db.dump, uploads.tar.gz and SHA256SUMS>
#
# Safe order: back up the current state first, restore into a separate database and check it,
# and only then swap it in. The site is down only for the swap and the restart.
set -euo pipefail
umask 077

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"
LOG_TAG=restore
# shellcheck source=lib.sh
source "$APP_DIR/lib.sh"

[[ $# -eq 1 ]] || die "usage: restore.sh <backup folder>"
[[ -d "$1" ]] || die "no such folder: $1"
source_dir="$(cd "$1" && pwd)"
for file in db.dump uploads.tar.gz SHA256SUMS; do
  [[ -f "$source_dir/$file" ]] || die "$source_dir has no $file"
done
(cd "$source_dir" && sha256sum --check --quiet SHA256SUMS) || die "checksums don't match"
has_image "$LOCAL_IMAGE:current" || die "deploy the app once before restoring (this uses its image)"

psql_db() { docker compose exec -T db psql -U pranayoga -v ON_ERROR_STOP=1 -Atq "$@"; }

# Asked before taking the lock, so a deploy isn't held up while the question waits.
printf 'This replaces the database and all uploads with %s.\nType RESTORE to continue: ' \
  "$source_dir" >&2
read -r answer || die "cancelled (no answer)"
[[ "$answer" == RESTORE ]] || die "cancelled"

take_lock 600

docker compose up -d --wait db

log "backing up the current state first"
"$APP_DIR/backup.sh"

log "restoring the dump into a separate database"
psql_db -d postgres -c 'DROP DATABASE IF EXISTS pranayoga_incoming WITH (FORCE)'
psql_db -d postgres -c 'CREATE DATABASE pranayoga_incoming OWNER pranayoga'
docker compose exec -T db pg_restore -U pranayoga -d pranayoga_incoming --no-owner \
  --exit-on-error <"$source_dir/db.dump"

has_table="$(psql_db -d pranayoga_incoming -c "SELECT to_regclass('public.payload_migrations') IS NOT NULL")"
[[ "$has_table" == t ]] ||
  die "the dump has no migration records: it wasn't made from a migrated database"
migrations="$(psql_db -d pranayoga_incoming -c 'SELECT count(*) FROM payload_migrations')"
dev_rows="$(psql_db -d pranayoga_incoming -c 'SELECT count(*) FROM payload_migrations WHERE batch = -1')"
((migrations > 0)) || die "the dump has no migration records: it wasn't made from a migrated database"
# Payload's dev schema push leaves a row with batch -1. The start-up migration would then stop
# to ask a question nobody can answer in a container, and the app would never start.
((dev_rows == 0)) ||
  die "the dump comes from a schema-push (dev) database; export it with scripts/first-load-export.mjs"

log "swapping in the database and the uploads (the site is down for a moment)"
docker compose stop app
psql_db -d postgres -c 'DROP DATABASE pranayoga WITH (FORCE)'
psql_db -d postgres -c 'ALTER DATABASE pranayoga_incoming RENAME TO pranayoga'

# The uploads belong to the container's `node` user, so the swap runs inside the app image.
docker compose run --rm --no-deps --user root -v "$source_dir:/restore:ro" --entrypoint sh app -c \
  "find /app/uploads -mindepth 1 -delete &&
   tar -xzf /restore/uploads.tar.gz -C /app/uploads --no-same-owner &&
   $UPLOADS_OWNER_FIX"

log "starting the app: pending migrations, then the cache refresh and warm-up"
start_current
wait_healthy || die "the app did not get healthy; check: docker compose logs app"
log "done"
