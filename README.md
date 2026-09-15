# Wardogs Mortar Calculator

A small static web page that calculates a mortar firing solution (elevation, apex firing height, time of flight) from the X/Y coordinates of a firing position and a target, for the game Wardogs.

## How it works

The mortar is modeled as a single muzzle velocity fired at a variable elevation angle, calibrated so that a 700 m max range is achieved at 45° elevation — standard projectile motion on flat terrain:

```
range = v^2 * sin(2 * theta) / g
```

For any target distance up to 700 m there are two elevation angles that land on it:

- **High angle** (the typical mortar solution) — steeper arc, shown first.
- **Low angle** — flatter, faster, alternate solution.

For each, the page reports the elevation angle, the apex (peak) height of the round's arc, and time of flight.

Assumes flat terrain (no elevation/Z difference between firer and target) and `g = 9.8 m/s²`. Both constants live at the top of [script.js](script.js) if you need to tune them to match observed in-game behavior.

## Running locally

Just open `index.html` in a browser, or serve the folder with any static file server:

```bash
npx serve .
```

## Running with Docker

```bash
docker build -t wardogs-app .
docker run -d -p 8080:80 --name wardogs-app wardogs-app
```

Then visit `http://localhost:8080`.

## Deploying with Portainer

**Option A — Stack from this Git repository (recommended):**

1. In Portainer, go to **Stacks → Add stack**.
2. Choose **Repository**, and point it at this GitHub repo's URL (branch `master`, compose path `docker-compose.yml`).
3. Deploy the stack. Portainer will build the image from the included `Dockerfile` and run it, publishing on port `8080` (edit the port mapping in `docker-compose.yml` first if you need a different one).

**Option B — Build and upload manually:**

1. Build the image locally (`docker build -t wardogs-app .`), save it (`docker save wardogs-app | gzip > wardogs-app.tar.gz`), and upload it under **Images** in Portainer.
2. Or push it to a registry Portainer can pull from, then create the container from that image using the same port mapping as `docker-compose.yml`.
