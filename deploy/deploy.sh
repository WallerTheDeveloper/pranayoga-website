#!/usr/bin/env bash
# Deploys, rolls back or reports the app version. Lives in /home/pranayoga/app/ and runs as the
# `pranayoga` user, by hand or from GitHub Actions. GitHub's SSH key may run only this script
# (authorized_keys: restrict,command="/home/pranayoga/app/deploy.sh"); the words it sends arrive
# in SSH_ORIGINAL_COMMAND and are checked strictly. See docs/DEPLOY.md.
#
#   deploy.sh deploy <git-sha> <github-user>   registry token on stdin, never as an argument
#   deploy.sh rollback                         back to the version before the current one
#   deploy.sh status
set -euo pipefail
umask 077

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"
LOG_TAG=deploy
# shellcheck source=lib.sh
source "$APP_DIR/lib.sh"

# Reads KEY=value from .env without executing it.
env_value() {
  grep -E "^$1=" .env | tail -n 1 | cut -d= -f2- || true
}

[[ -f .env ]] || die ".env is missing in $APP_DIR (see deploy/env.example)"
IMAGE_REPO="$(env_value IMAGE_REPO)"
[[ "$IMAGE_REPO" =~ ^ghcr\.io/[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9._-]*$ ]] ||
  die "IMAGE_REPO in .env must look like ghcr.io/<owner>/<repository> (lowercase)"

# Keeps the images of the current and the previous version; removes older ones.
prune_images() {
  local keep_current keep_previous ref
  keep_current="$(revision_of "$LOCAL_IMAGE:current")"
  keep_previous="$(revision_of "$LOCAL_IMAGE:previous")"
  while read -r ref; do
    [[ -z "$ref" ]] && continue
    case "${ref##*:}" in
      "$keep_current" | "$keep_previous") ;;
      *) docker rmi "$ref" >/dev/null || true ;;
    esac
  done < <(docker image ls "$IMAGE_REPO" --format '{{.Repository}}:{{.Tag}}')
  docker image prune -f >/dev/null || true
}

cmd_status() {
  printf 'current:  %s\n' "$(revision_of "$LOCAL_IMAGE:current")"
  printf 'previous: %s\n' "$(revision_of "$LOCAL_IMAGE:previous")"
  docker compose ps
}

cmd_deploy() {
  local sha="$1" user="$2" token="" remote pulled=0
  [[ "$sha" =~ ^[0-9a-f]{40}$ ]] || die "the version must be a full git commit SHA"
  [[ "$user" =~ ^[A-Za-z0-9][A-Za-z0-9-]{0,38}(\[bot\])?$ ]] || die "invalid GitHub user name"
  IFS= read -r token || true
  [[ -n "$token" ]] || die "expected the registry token on stdin"
  remote="$IMAGE_REPO:$sha"

  log "pulling $remote"
  printf '%s' "$token" | docker login ghcr.io -u "$user" --password-stdin >/dev/null
  docker pull -q "$remote" >/dev/null && pulled=1
  # The token expires with the CI job anyway; don't leave it in ~/.docker.
  docker logout ghcr.io >/dev/null 2>&1 || true
  ((pulled == 1)) || die "could not pull $remote"
  [[ "$(revision_of "$remote")" == "$sha" ]] || die "the image's revision label doesn't match $sha"

  if [[ "$(revision_of "$LOCAL_IMAGE:current")" == "$sha" ]]; then
    log "$sha is already the current version; restarting it"
  elif has_image "$LOCAL_IMAGE:current"; then
    docker tag "$LOCAL_IMAGE:current" "$LOCAL_IMAGE:previous"
  fi
  docker tag "$remote" "$LOCAL_IMAGE:current"

  start_current
  if wait_healthy; then
    log "deployed $sha"
    prune_images
    cmd_status
    return 0
  fi

  log "$sha did not get healthy; its last log lines:"
  docker compose logs --no-color --tail 80 app >&2 || true
  if has_image "$LOCAL_IMAGE:previous" &&
    [[ "$(revision_of "$LOCAL_IMAGE:previous")" != "$sha" ]]; then
    log "rolling back to $(revision_of "$LOCAL_IMAGE:previous")"
    docker tag "$LOCAL_IMAGE:previous" "$LOCAL_IMAGE:current"
    start_current
    if wait_healthy; then
      log "rollback healthy"
      # Drops the failed image; the disk is small.
      prune_images
    else
      log "rollback did not get healthy either"
    fi
  fi
  return 1
}

cmd_rollback() {
  has_image "$LOCAL_IMAGE:previous" || die "no previous version is kept"
  log "rolling back from $(revision_of "$LOCAL_IMAGE:current") to $(revision_of "$LOCAL_IMAGE:previous")"
  # Swap, so a second rollback returns to where we started.
  docker tag "$LOCAL_IMAGE:current" "$LOCAL_IMAGE:swap"
  docker tag "$LOCAL_IMAGE:previous" "$LOCAL_IMAGE:current"
  docker tag "$LOCAL_IMAGE:swap" "$LOCAL_IMAGE:previous"
  docker rmi "$LOCAL_IMAGE:swap" >/dev/null
  start_current
  wait_healthy || die "the rolled-back version did not get healthy"
  cmd_status
}

main() {
  local -a words
  # Split on whitespace only: no globbing, no quotes, no shell evaluation of what SSH sent.
  read -r -a words <<<"${SSH_ORIGINAL_COMMAND:-$*}"

  case "${words[0]:-} ${#words[@]}" in
    'deploy 3')
      take_lock 600
      cmd_deploy "${words[1]}" "${words[2]}"
      ;;
    'rollback 1')
      take_lock 600
      cmd_rollback
      ;;
    'status 1') cmd_status ;;
    *) die "usage: deploy.sh deploy <git-sha> <github-user> | rollback | status" ;;
  esac
}

main "$@"
