# Putting The Brief on a VPS

One server runs everything: the **backend** (finds news, writes stories, asks for Telegram approval)
and the **website** (shows approved stories, with HTTPS on your domain).

```
 visitors ──► Caddy (HTTPS, ports 80/443) ──► web (Next.js)  ──reads──►  site-data/  ◄──writes── backend
                                                                          content/articles/*.json
                                                                          public/media/<story>/*.jpg
```

The only thing the two halves share is the `site-data` folder: when you press **Approve** in Telegram,
the backend writes the story's JSON and pictures there, the website notices within about 10 seconds
and restarts itself (about a second). The story's own page and picture are then live; the home page
and other lists show it within about a minute (they refresh on a timer).

> **Status of this guide.** The Docker image, the auto-restart, the compose stack with Caddy (using
> `localhost` as the domain), the database migrations and the Caddyfile syntax were tested on a laptop. The parts that need a real server, domain and certificate
> (DNS, HTTPS issuance, the VPS provider's panel) have **not** been tested; check them when you
> set up, and tell whoever maintains this if a step is wrong.

## 0. What you need

- A VPS: Ubuntu 22.04 or 24.04, about 4 GB RAM or more (8 GB is comfortable), with Docker
  (Hostinger offers an Ubuntu + Docker template).
- A domain and access to its DNS settings.
- The backend's secrets: `NVIDIA_API_KEY` (or `FAL_KEY`), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
  **Create a fresh NVIDIA key for the server**; the one used while developing was shared in chat.

## 1. Point the domain at the server

In your domain's DNS add an **A record**: name `@` (or a sub-domain such as `news`), value = the VPS's IP.
Wait until `ping your-domain` shows that IP. Caddy cannot get a certificate before this works.

## 2. Prepare the server

```bash
ssh root@YOUR_VPS_IP
apt-get update && apt-get -y upgrade
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable   # only SSH + web are reachable
docker --version && docker compose version                                  # both must work
```

(No Docker? `curl -fsSL https://get.docker.com | sh`.)

## 3. Get the code and make the shared folder

```bash
mkdir -p /srv/news && cd /srv/news
git clone git@github.com:nehadgmtechproducts/content_automation.git
git clone git@github.com:nehadgmtechproducts/news_automation_web.git
mkdir -p site-data/content/articles site-data/public/media
```

(`git clone` over SSH needs a deploy key or your key on the server; HTTPS cloning works too if the repos are accessible.)

### Which stories go live first?

`site-data` starts empty, so the site starts with "No stories yet", and fills as you approve stories in
Telegram. If you want the stories that are in this repo (published on 23 October 2026, each approved
in Telegram by a person) to be there from the start, copy them in:

```bash
cd /srv/news/news_automation_web
cp content/articles/*.json /srv/news/site-data/content/articles/
cp -r public/media/* /srv/news/site-data/public/media/
```

(Only ever copy stories a person has approved: the site tells readers every story is reviewed.)

## 4. Start the backend

```bash
cd /srv/news/content_automation
cp .env.example .env
nano .env
```

Set at least:

```
SYNTHESIS_PROVIDER=nvidia
NVIDIA_API_KEY=nvapi-...            # the new key
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
WEB_PROJECT_HOST_DIR=/srv/news/site-data     # the folder from step 3
DOCKER_PLATFORM=linux/amd64                  # a normal Linux server (NOT the Apple-Silicon default)
GENERATE_VIDEO=false
```

Then start it. The database is empty the first time, so create its tables before starting the rest:

```bash
docker compose up -d postgres redis
docker compose run --rm worker alembic upgrade head    # creates the tables (safe to repeat)
docker compose up -d --build                           # worker, beat, approvals
docker compose ps                                      # everything "Up"
docker compose logs -f approvals                       # should say it is listening for Telegram button presses
```

Only **one** thing may listen to a Telegram bot at a time. Stop the copy on your laptop
(`docker compose down` there) before starting the server's, or approvals will behave oddly.

## 5. Start the website and HTTPS

```bash
cd /srv/news/news_automation_web/deploy
cp .env.example .env
nano .env        # SITE_DOMAIN, SITE_URL, SITE_DATA_DIR=/srv/news/site-data, CONTACT_EMAIL, SOCIAL_*
docker compose up -d --build
docker compose ps                  # web "healthy", caddy "Up"
docker compose logs -f caddy       # look for "certificate obtained successfully"
```

Open `https://your-domain`. The first build takes a few minutes.

## 6. Check the whole chain

1. The site loads over HTTPS with a padlock.
2. `https://your-domain/sitemap.xml` shows your domain, **not** `localhost` (if it says localhost, `SITE_URL` was wrong when it was built: fix `.env`, run `docker compose up -d --build`).
3. Wait for the next story (or trigger one), press **Approve** in Telegram, and within about 15 seconds
   its page and picture are live within about 15 seconds, and the home page lists it a minute or so later.
   `docker compose logs web` shows `[watch] content changed; restarting the website`.

## Day-to-day

| Task | Command |
|---|---|
| Update the website code | `cd /srv/news/news_automation_web && git pull && cd deploy && docker compose up -d --build` |
| Update the backend code | `cd /srv/news/content_automation && git pull && docker compose build worker && docker compose up -d` |
| See website logs | `cd /srv/news/news_automation_web/deploy && docker compose logs -f web` |
| See backend logs | `cd /srv/news/content_automation && docker compose logs -f worker approvals` |
| Restart the website by hand | `docker compose restart web` (in `deploy/`) |

## Keeping a copy of every story on GitHub (optional, automatic)

The site does **not** need this: it reads stories straight from `site-data`, so every approval is live
on its own. This is only for a history and an off-server copy of what was published, without anyone
running `git commit` after each approval.

`scripts/publish-content.sh` commits and pushes new stories (only `content/articles` and `public/media`,
never code) and does nothing when there is nothing new. On the server, point it at `site-data` made into
its own small repo. Use a **separate private repo for content** (for example `news_content`) so story
commits do not mix with code commits.

```bash
# once: make site-data a git repo with its own deploy key (GitHub: repo > Settings > Deploy keys > allow write access)
ssh-keygen -t ed25519 -N "" -f ~/.ssh/news_content_deploy        # then paste ~/.ssh/news_content_deploy.pub into GitHub
printf 'Host github-content\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/news_content_deploy\n  IdentitiesOnly yes\n' >> ~/.ssh/config
cd /srv/news/site-data
git init -b main && git remote add origin git@github-content:YOUR-ORG/news_content.git
git add -A && git commit -m "Initial content" && git push -u origin main

# every 5 minutes: crontab -e, then add this ONE line
*/5 * * * * REPO_DIR=/srv/news/site-data /srv/news/news_automation_web/scripts/publish-content.sh >> /var/log/publish-content.log 2>&1
```

Each approval then shows up on GitHub within about five minutes as a commit named `Publish 1 story` listing
the headline. A new server can be restored by cloning that repo into `site-data`.

On a **Mac** (a development laptop): `./scripts/auto-publish-macos.sh watch` in a Terminal window does the
same for the website repo while the window is open. `install` runs it as a background job, but macOS
blocks background jobs from `~/Documents` unless `/bin/bash` has Full Disk Access; the command checks and says so.

## Backups (do this before launch)

Three things hold data that cannot be recreated:

| What | Where | Back up with |
|---|---|---|
| Published stories | `/srv/news/site-data` | the auto-publisher above (a copy on GitHub), or copy the folder (`tar czf`) |
| Newsletter sign-ups and read counts | Docker volume `site_state` | `docker run --rm -v deploy_site_state:/d -v $PWD:/b alpine tar czf /b/site_state.tgz -C /d .` (the volume's name starts with the folder name; check `docker volume ls`) |
| Backend database | `/srv/news/content_automation/pgdata` | `docker compose exec -T postgres pg_dump -U engine content_engine > backup.sql` |

Turn on the provider's automatic server snapshots as well.

## If something is wrong

- **No HTTPS / certificate errors**: the DNS A record must point at this server and ports 80 and 443 must be open (`ufw status`). Check `docker compose logs caddy`.
- **502 right after starting**: the site is still starting; wait 30 seconds.
- **A story is approved but not on the site**: look at the card in Telegram (it says if publishing failed), then `docker compose logs approvals` in the backend folder. The story folder must be writable by the backend and be the **same** path as `SITE_DATA_DIR`.
- **Story is there but its picture is missing**: `docker compose logs web`; the picture must be in `site-data/public/media/<story>/`.
- **Sign-ups / counts vanished**: the `site_state` volume was removed (`docker compose down -v` deletes volumes; never use `-v`).

## Before going public

- Make sure every story on the site was approved by a person (the site says so on `/about`).
- The newsletter only **collects** addresses; nothing sends the daily email yet.
- Have `/terms` and `/privacy` reviewed by someone qualified.
- Set `CONTACT_EMAIL` and the real social links in `deploy/.env`.
