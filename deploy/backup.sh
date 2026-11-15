#!/usr/bin/env bash
# Backs up the database and uploads/ into backups/<date_time>/ and keeps the newest 7.
# Lives in /home/pranayoga/app/; cron runs it nightly as `pranayoga` (docs/DEPLOY.md), and
# restore.sh runs it before replacing anything. backups/latest points at the newest one.
#
# Each backup holds db.dump (pg_dump custom format), uploads.tar.gz, INFO and SHA256SUMS:
# the layout restore.sh reads and scripts/first-load-export.mjs writes.
set -euo pipefail
umask 077

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"
LOG_TAG=backup
# shellcheck source=lib.sh
source "$APP_DIR/lib.sh"

KEEP=7
# Not while a deploy or restore swaps the database; restore.sh already holds the lock when it
# runs this script. The nightly run waits up to an hour.
take_lock 3600

stamp="$(date +%Y-%m-%d_%H%M%S)"
target="backups/$stamp"
partial="backups/.partial-$stamp"

mkdir -p backups
trap 'rm -rf -- "$partial"' EXIT
mkdir "$partial"

docker compose exec -T db pg_dump -U pranayoga -d pranayoga --format=custom --no-owner \
  >"$partial/db.dump"
# The uploads belong to the container's user; fix_upload_owner (lib.sh) keeps them readable for
# `pranayoga`, so tar runs on the host. Repeated here: a file with odd permissions would
# otherwise surface only as a failed nightly backup.
if has_image "$LOCAL_IMAGE:current"; then fix_upload_owner; fi
tar -czf "$partial/uploads.tar.gz" -C uploads . || die "could not read uploads/"

printf 'created=%s\napp_revision=%s\n' "$(date --iso-8601=seconds)" \
  "$(revision_of "$LOCAL_IMAGE:current")" >"$partial/INFO"
(cd "$partial" && sha256sum db.dump uploads.tar.gz >SHA256SUMS)

mv "$partial" "$target"
trap - EXIT
ln -sfn "$stamp" backups/latest

# Only folders this script created (backups/20…): newest first, everything after $KEEP goes.
find backups -mindepth 1 -maxdepth 1 -type d -name '20*' -printf '%f\n' | sort -r |
  tail -n "+$((KEEP + 1))" | while read -r old; do rm -rf -- "backups/$old"; done

log "saved $target ($(du -sh "$target" | cut -f1))"
