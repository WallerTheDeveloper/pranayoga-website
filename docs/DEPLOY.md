# Deploying: staging on the DigitalOcean droplet

The site runs on the existing droplet until the client buys the OVH VPS (docs/PLAN.md, "Staging on
DigitalOcean first"). The same image and compose file run on both servers; only `.env` and the
proxy differ.

**How it fits together**

```
push to master ─► GitHub Actions: lint, types, tests, E2E ─► build against a migrated DB
               ─► image ─► smoke test ─► GHCR ─► ssh: deploy.sh on the droplet ─► smoke test

browser ─► nginx (HTTPS, shared login, noindex) ─► 127.0.0.1:3100 ─► app container ─► db container
                                                    (rootless Docker of the `pranayoga` user)
```

On every start the app container runs pending migrations, marks the in-memory page cache stale
(`/next/refresh/`, inside the container only) and requests every public page once. Its port
opens only after the refresh, so nobody sees the empty pages the CI build prerendered; until then
nginx shows "Die Vorschau wird gerade aktualisiert". Docker reports the app healthy once every
page is cached, and `deploy.sh` waits for that (and rolls back if the app fails to start).

**Files**

| In the repo | On the droplet | What it is |
|---|---|---|
| `deploy/compose.yml` | `/home/pranayoga/app/compose.yml` | app + PostgreSQL 18 |
| `deploy/env.example` | `/home/pranayoga/app/.env` | secrets and settings, `chmod 600` |
| `deploy/lib.sh`, `deploy.sh`, `backup.sh`, `restore.sh` | `/home/pranayoga/app/` | deploy, rollback, backups |
| `deploy/nginx/pranayoga-staging.conf` | `/etc/nginx/sites-available/pranayoga-staging` | proxy, shared login |
| `scripts/first-load-export.mjs` | (your PC) | builds the first database |
| `Dockerfile`, `.github/workflows/deploy.yml` | (CI) | image and pipeline |

Prompts below: `root#` on the droplet as root, `pranayoga$` on the droplet as `pranayoga`,
`PC>` on your PC in the project folder. `<ip>` is the droplet's IP address.

---

## 1. Before you start

1. **Snapshot.** DigitalOcean → the droplet → Snapshots → take one. Delete it once everything
   below works; snapshots are billed per GB while kept.
2. **DNS.** In your Cloudflare zone `pickmajob.cc`, an A record `pranayoga → <ip>` with proxy
   status **DNS only** (grey cloud) must exist before step 6 (certbot). Check with
   `nslookup pranayoga.pickmajob.cc`: it must print `<ip>`, not a Cloudflare address. A name
   under `pranayogastudio.de` isn't possible for now: that zone sits in a Cloudflare account
   nobody here can reach (docs/PLAN.md, "Address").
3. **SSH from GitHub.** GitHub's runners connect to port 2222 from changing addresses. UFW
   allows 2222 from anywhere (checked 2026-11-14) and logins are key-only, so nothing to do. If
   that ever changes, `ufw status | grep 2222` must still show `ALLOW` for `Anywhere`.
4. **Free port.** `root# ss -tlnp | grep ':3100 '` must print nothing. Otherwise pick another port
   and use it for `APP_PORT` (step 3) and in the nginx file (step 6).

## 2. The `pranayoga` user and rootless Docker

Docker runs as `pranayoga` only (rootless); the system-wide Docker service stays off, so nothing
here can touch the other sites' files.

```
root# apt-get update
root# apt-get install -y ca-certificates curl uidmap dbus-user-session systemd-container
root# install -m 0755 -d /etc/apt/keyrings
root# curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
root# chmod a+r /etc/apt/keyrings/docker.asc
root# echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
root# apt-get update
root# apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-ce-rootless-extras
root# systemctl disable --now docker.service docker.socket containerd.service
```

Ubuntu 24.04 blocks user namespaces for unknown programs; rootless Docker needs an AppArmor
profile for `rootlesskit`. Skip this if `ls /etc/apparmor.d | grep -i rootlesskit` already
shows one:

```
root# cat > /etc/apparmor.d/usr.bin.rootlesskit <<'EOF'
abi <abi/4.0>,
include <tunables/global>

/usr/bin/rootlesskit flags=(unconfined) {
  userns,

  include if exists <local/usr.bin.rootlesskit>
}
EOF
root# systemctl restart apparmor.service
```

Create the user. Lingering keeps its Docker running without a login:

```
root# adduser --disabled-password --gecos "" pranayoga
root# grep pranayoga /etc/subuid /etc/subgid      # both must list a range
root# cat /etc/subuid                             # no two ranges may overlap
root# loginctl enable-linger pranayoga
root# machinectl shell pranayoga@                 # a real login session (sudo -iu doesn't set one up)
```

As `pranayoga`:

```
pranayoga$ dockerd-rootless-setuptool.sh install
pranayoga$ systemctl --user enable --now docker
pranayoga$ echo 'export DOCKER_HOST=unix:///run/user/$(id -u)/docker.sock' >> ~/.bashrc
pranayoga$ source ~/.bashrc
pranayoga$ docker info --format '{{.SecurityOptions}} {{.CgroupVersion}}'   # shows rootless and 2
pranayoga$ cat /sys/fs/cgroup/user.slice/user-$(id -u).slice/user@$(id -u).service/cgroup.controllers
```

The last line must list `memory`, or the containers' memory limits are ignored. If the setup tool
prints AppArmor instructions instead of finishing, follow them and run it again.

## 3. The app folder

```
pranayoga$ mkdir -p ~/app/uploads ~/app/backups ~/import && chmod 700 ~/app ~/import
```

Your PC copies files as `pranayoga`, never as root, so they arrive with the right owner. Give
`pranayoga` your PC's SSH key. This is your personal key, separate from GitHub's deploy key in
step 4:

```
PC> Get-ChildItem $HOME\.ssh\*.pub           # none listed? ssh-keygen -t ed25519 (set a passphrase)
PC> Get-Content $HOME\.ssh\id_ed25519.pub    # copy this one line
root# sshd -T | grep -iE '^(allowusers|allowgroups)'
root# install -d -m 700 -o pranayoga -g pranayoga /home/pranayoga/.ssh
root# echo '<the line you copied>' >> /home/pranayoga/.ssh/authorized_keys
root# chown pranayoga:pranayoga /home/pranayoga/.ssh/authorized_keys && chmod 600 /home/pranayoga/.ssh/authorized_keys
```

If the `sshd -T` line prints `allowusers` lines (one per allowed user), `pranayoga` must join
them. The config usually holds them as one line, `AllowUsers root deploy …`; add the name to the
end of that line. Keep your root session open until the test below works:

```
root# grep -rnE '^\s*AllowUsers' /etc/ssh/sshd_config /etc/ssh/sshd_config.d/   # file:line:text
root# cp <file> <file>.bak
root# sed -i '<line>s/$/ pranayoga/' <file>
root# sshd -t && systemctl reload ssh       # sshd -t prints nothing when the file is valid
root# sshd -T | grep -i '^allowusers'       # now ends with: allowusers pranayoga
```

`AllowGroups` works the same way, with a group `pranayoga` belongs to. If `systemctl reload ssh`
says the service isn't active, that's fine: on Ubuntu 24.04 sshd may start on demand and reads
the config at the next connection.

Check that your PC trusts the right server. The first connection shows a fingerprint, or your
PC may already have stored one; both must match the droplet's:

```
root# ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
PC> ssh-keygen -l -F "[<ip>]:2222"           # what your PC stored, if anything
PC> ssh -p 2222 pranayoga@<ip> whoami        # prints: pranayoga
```

If the fingerprints differ, stop: remove the PC's entry (`ssh-keygen -R "[<ip>]:2222"`) and find
out why before connecting again. From now on, `ssh -p 2222 pranayoga@<ip>` is also a way into a
`pranayoga` session, besides `machinectl shell`.

Copy the files and set their permissions:

```
PC> scp -P 2222 deploy/compose.yml deploy/env.example deploy/lib.sh deploy/deploy.sh deploy/backup.sh deploy/restore.sh pranayoga@<ip>:app/
pranayoga$ cd ~/app && mv env.example .env && chmod 700 *.sh && chmod 600 .env
pranayoga$ grep -l $'\r' *.sh    # must print nothing; otherwise: sed -i 's/\r$//' *.sh
```

Fill in `.env` as `pranayoga`. Secrets first, then the two names. The secrets travel through a
pipe, so they never show up in the process list other users can read:

```
pranayoga$ cd ~/app
pranayoga$ for name in POSTGRES_PASSWORD PAYLOAD_SECRET PREVIEW_SECRET CACHE_REFRESH_SECRET; do printf 's/^%s=$/%s=%s/\n' "$name" "$name" "$(openssl rand -hex 32)" | sed -i -f - .env; done
pranayoga$ nano .env
```

- `IMAGE_REPO=ghcr.io/<github owner>/<repository>`, all lowercase.
- `SERVER_URL=https://pranayoga.pickmajob.cc`.
- `APP_PORT` stays 3100 unless step 1 said otherwise.

`POSTGRES_PASSWORD` is used only when the database is first created; don't change it afterwards.
Changing `PAYLOAD_SECRET` logs everyone out.

Then the nightly backup (03:30, keeps 7):

```
pranayoga$ crontab -e
30 3 * * * /home/pranayoga/app/backup.sh >> /home/pranayoga/app/backups/backup.log 2>&1
```

## 4. The deploy key

A key only GitHub Actions uses. It may run `deploy.sh` and nothing else: no shell, no file copy,
no port forwarding.

**This key must have no passphrase:** GitHub Actions can't type one. When `ssh-keygen` asks for a
passphrase, press Enter twice without typing anything. Don't use `-N ""` instead: Windows
PowerShell 5.1 drops the empty argument and `ssh-keygen` fails with "Too many arguments". The key
goes in `.ssh`, not the repo folder, so it can't be committed by accident.

```
PC> ssh-keygen -t ed25519 -C github-actions-pranayoga -f $HOME\.ssh\pranayoga_deploy
PC> ssh-keygen -y -f $HOME\.ssh\pranayoga_deploy    # must print the key without asking a passphrase
PC> Get-Content $HOME\.ssh\pranayoga_deploy.pub    # copy this one line
```

Typed a passphrase anyway? Remove it with `ssh-keygen -p -f $HOME\.ssh\pranayoga_deploy`: enter
the old passphrase, then press Enter twice for the new one.

This writes `pranayoga_deploy` (private, goes into GitHub) and `pranayoga_deploy.pub`. Put the
public key on the droplet with the restriction in front:

```
root# install -d -m 700 -o pranayoga -g pranayoga /home/pranayoga/.ssh
root# echo 'restrict,command="/home/pranayoga/app/deploy.sh" <contents of pranayoga_deploy.pub>' >> /home/pranayoga/.ssh/authorized_keys
root# chown pranayoga:pranayoga /home/pranayoga/.ssh/authorized_keys && chmod 600 /home/pranayoga/.ssh/authorized_keys
```

`authorized_keys` now holds two lines: your PC's key (step 3) and this restricted one.

The droplet's host keys, so GitHub can check it is talking to the right server (copy the output):

```
root# for f in /etc/ssh/ssh_host_*_key.pub; do echo "[<ip>]:2222 $(cut -d' ' -f1,2 "$f")"; done
```

Test from your PC. It needs the filled-in `.env` from step 3 and should print `current:` and
`previous:` (both empty) and an empty list:

```
PC> ssh -i $HOME\.ssh\pranayoga_deploy -o IdentitiesOnly=yes -p 2222 pranayoga@<ip> status
```

## 5. GitHub

Repository → Settings:

1. **Environments → New environment** `staging`. Under "Deployment branches and tags", allow
   `master` only.
2. In `staging`, **Environment secrets**:

   | Name | Value |
   |---|---|
   | `DEPLOY_HOST` | `<ip>` |
   | `DEPLOY_PORT` | `2222` |
   | `DEPLOY_USER` | `pranayoga` |
   | `DEPLOY_SSH_KEY` | the whole `pranayoga_deploy` file (`Get-Content -Raw $HOME\.ssh\pranayoga_deploy`) |
   | `DEPLOY_KNOWN_HOSTS` | the lines from step 4 |
   | `STAGING_BASIC_AUTH` | `vorschau:<shared password>` (step 6) |

3. In `staging`, **Environment variables**: `STAGING_URL` = `https://pranayoga.pickmajob.cc`.
4. **Rules → Rulesets → New branch ruleset:** name it `master`, set "Enforcement status" to
   Active, add the target "Include default branch", and tick **Restrict deletions** and **Block
   force pushes**. Then save. Direct pushes to `master` keep working, so deploys work as before.
   Only people with write access can push to `master`, and only `master` can use the `staging`
   secrets (point 1). Give write access only to people who may deploy.

Then delete `$HOME\.ssh\pranayoga_deploy` from your PC, or keep it in your password manager.

The image goes to the GitHub Container Registry as a private package, linked to the repository.
The deploy job hands its own short-lived token to the droplet, which logs in, pulls and logs
out again, so the droplet stores no GitHub token.

## 6. nginx and HTTPS

The shared login, with a generated password (24 characters; nginx doesn't slow down guessing,
so it must be long). Note the printed password for the client and for `STAGING_BASIC_AUTH`:

```
root# pw="$(openssl rand -base64 18)"; echo "shared password: $pw"
root# printf 'vorschau:%s\n' "$(openssl passwd -6 -stdin <<<"$pw")" > /etc/nginx/pranayoga-staging.htpasswd; unset pw
root# chown root:www-data /etc/nginx/pranayoga-staging.htpasswd && chmod 640 /etc/nginx/pranayoga-staging.htpasswd
```

The site block:

```
PC> scp -P 2222 deploy/nginx/pranayoga-staging.conf pranayoga@<ip>:import/
root# install -m 644 /home/pranayoga/import/pranayoga-staging.conf /etc/nginx/sites-available/pranayoga-staging
root# rm /home/pranayoga/import/pranayoga-staging.conf
root# ln -s /etc/nginx/sites-available/pranayoga-staging /etc/nginx/sites-enabled/pranayoga-staging
root# nginx -t && systemctl reload nginx
root# certbot --nginx -d pranayoga.pickmajob.cc --redirect
root# nginx -t && systemctl reload nginx
```

Always run `nginx -t` before a reload: the other sites share this nginx, and a broken file would
take them down too. Until the first deploy the new site answers "Die Vorschau wird gerade
aktualisiert"; that's expected. Use the login only over HTTPS, so share it after certbot ran.

### Keep the droplet's other users away from the app

The app listens on 127.0.0.1 only, but any program on the droplet can still reach it there, past
the shared login. Two firewall rules fix that: only nginx (`www-data`) and root may connect to
port 3100, and `pranayoga`'s containers may not query DigitalOcean's metadata service
(169.254.169.254, which holds the droplet's user data). Tested with UFW on Ubuntu 24.04.

```
root# grep -E '^user' /etc/nginx/nginx.conf      # must say: user www-data;
root# cp /etc/ufw/before.rules /etc/ufw/before.rules.bak
root# nano /etc/ufw/before.rules
```

Paste this directly above the line `# allow all on loopback` (use your port if it isn't 3100):

```
# pranayoga staging: only nginx (www-data) and root may connect to the app port,
# and pranayoga's containers may not query the cloud metadata service.
-A ufw-before-output -o lo -p tcp --dport 3100 -m owner --uid-owner www-data -j ACCEPT
-A ufw-before-output -o lo -p tcp --dport 3100 -m owner --uid-owner root -j ACCEPT
-A ufw-before-output -o lo -p tcp --dport 3100 -j REJECT --reject-with tcp-reset
-A ufw-before-output -d 169.254.169.254 -m owner --uid-owner pranayoga -j REJECT
```

```
root# ufw reload
root# sudo -u nobody curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3100/   # 000: refused
```

If `ufw reload` reports an error, put the backup back at once (`cp /etc/ufw/before.rules.bak
/etc/ufw/before.rules && ufw reload`). After the first deploy, `curl -s -o /dev/null -w
'%{http_code}\n' http://127.0.0.1:3100/next/health/` as root answers 200.

## 7. First deploy

1. Push the code to a **branch** first. The workflow runs every check and builds the image there,
   but neither pushes nor deploys it. Fix anything red.
2. Merge or push to `master`. The run also pushes the image and deploys it; most of its time
   goes to E2E. GitHub → Actions shows the progress; on the droplet:

   ```
   pranayoga$ cd ~/app && docker compose ps && docker compose logs --tail 50 app
   ```

3. The site now runs with an empty database: no content and no admin account yet. Step 8 fills it.

## 8. First load

The content comes from a fresh seed on your PC. A copy of your dev database won't do: dev pushes
the schema, which leaves a "dev" marker that stops the server's start-up migration. `restore.sh`
refuses such dumps.

```
PC> docker compose up -d db
PC> $env:SEED_ADMIN_EMAIL = 'you@example.com'
PC> $env:SEED_ADMIN_PASSWORD = [Net.NetworkCredential]::new('', (Read-Host -AsSecureString 'Admin password, min. 12')).Password
PC> pnpm first-load:export --server-url https://pranayoga.pickmajob.cc
PC> Remove-Item Env:SEED_ADMIN_PASSWORD
```

PowerShell syntax. The password is typed at a hidden prompt, so it stays out of the command
history. In Git Bash: `read -rsp 'Admin password: ' SEED_ADMIN_PASSWORD && export
SEED_ADMIN_PASSWORD SEED_ADMIN_EMAIL=you@example.com`, then the `pnpm` line.

It prints the folder it wrote, `exports/<stamp>/`. Copy it over and restore it:

```
PC> scp -P 2222 -r exports/<stamp> pranayoga@<ip>:import/
pranayoga$ ~/app/restore.sh ~/import/<stamp>          # type RESTORE when asked
```

Then:

1. Open `https://pranayoga.pickmajob.cc`, log in with the shared login, then at `/admin/`
   with the seed admin.
2. Create the client's account under Users and pass the password on directly. There is no email
   on staging, so "forgot password" doesn't work; you set passwords yourself.
3. Delete the export folder on the droplet: `pranayoga$ rm -r ~/import/<stamp>`.
4. Check memory: `pranayoga$ docker stats --no-stream`. Locally the pair used about 225 MB after
   warm-up (app ~165 MB, database ~60 MB).

From now on the data on staging is the real data. The seed never runs there again.

## Everyday

| Task | How |
|---|---|
| Deploy | Push to `master`. |
| Which version runs | `pranayoga$ ~/app/deploy.sh status` |
| Logs | `pranayoga$ cd ~/app && docker compose logs --tail 100 app` |
| Roll back | `pranayoga$ ~/app/deploy.sh rollback` (again to roll forward) |
| Backup now | `pranayoga$ ~/app/backup.sh` |
| Download the latest backup | `PC> mkdir staging-backup; scp -P 2222 "pranayoga@<ip>:app/backups/latest/*" staging-backup/` |
| Restore a backup | `pranayoga$ ~/app/restore.sh ~/app/backups/<date_time>` |
| Change the shared login | Rerun the two `pw` lines (step 6); update `STAGING_BASIC_AUTH`. |

- **Download a backup** after each round of client edits and before the OVH move. Each backup
  folder holds `db.dump`, `uploads.tar.gz`, `INFO` and `SHA256SUMS`.
- **Rollback and migrations:** a rollback restarts the previous image but can't undo a
  migration. If the newer version changed the schema, restore the backup from before that deploy.
- **`restore.sh`** first backs up the current state, restores into a separate database, checks
  it, and only then swaps it in.
- **One at a time:** deploys, rollbacks, restores and backups take turns. A deploy that arrives
  while a restore runs waits for it (up to 10 minutes); the nightly backup waits up to an hour.
- **Changed server files:** `compose.yml` and the scripts are not deployed by CI (its key may only
  run `deploy.sh`). When they change in git, copy them again as in step 3 and run
  `~/app/deploy.sh status` to check.

**Schema changes** (new or changed Payload fields): run `pnpm payload migrate:create <name>` and
commit the new files in `src/migrations/`. CI fails if the schema changed without a migration.
Servers run new migrations on start; dev keeps pushing the schema as before.

**Changing the address** (for example, to `vorschau.pranayogastudio.de` once that zone is
reachable):

1. Add the new DNS record.
2. Change `server_name` in the nginx file and run `certbot --nginx -d <new name> --redirect`.
3. Set `SERVER_URL` in `.env` and `STAGING_URL` in GitHub.
4. In the admin, Technik → Site URL.
5. `pranayoga$ cd ~/app && docker compose up -d --force-recreate app`.

The image reads the address at runtime, so no rebuild is needed.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `deploy.sh`: "could not pull" | `IMAGE_REPO` not lowercase or wrong. Or the package lacks the repository under Package settings → Manage Actions access. |
| App never gets healthy | `docker compose logs app`. "CACHE_REFRESH_SECRET is missing": `.env`. "password authentication failed": `POSTGRES_PASSWORD` changed after the first start. |
| App exits right after "It looks like you've run Payload in dev mode" | The database came from a schema push. Restore a proper export (step 8). |
| "Die Vorschau wird gerade aktualisiert" for more than a few minutes | The app isn't running or still starting (`docker compose ps`, then the logs), or `APP_PORT` and the nginx port differ. |
| `deploy.sh` or `backup.sh`: "gave up waiting" | Another deploy, restore or backup held the lock too long; check `ps -u pranayoga`, then rerun. |
| 413 on upload | `client_max_body_size` is missing from the server block. |
| `docker`: "Cannot connect to the Docker daemon" | Not in a real `pranayoga` session: use `machinectl shell pranayoga@`, and check `DOCKER_HOST` in `~/.bashrc`. |
| Memory limits ignored | `memory` is missing from the cgroup controllers (step 2). |

## Moving to OVH (later phase)

The OVH phase adds Caddy in a second compose file. The move itself:

1. Set up the VPS like steps 2–5, with Caddy instead of nginx.
2. Make a last backup on staging, download it and copy it to the VPS. Then run `restore.sh` there.
3. Point DNS at the VPS. The domain's nameservers lead to a Cloudflare account nobody here can
   reach, so first take DNS back: in the client's OVH account (Domain names → DNS servers),
   change the nameservers. Before that, copy every existing record into the new zone (the
   website, and MX, SPF and DKIM for the client's email), and check whether DNSSEC is on.
4. In the admin, set Technik → Site URL and turn `noindex` off.
5. Stop the staging stack: `pranayoga$ cd ~/app && docker compose down`.
6. Delete the `pranayoga` record in the `pickmajob.cc` zone, and the nginx block.
