# Fantacode Distributed WebSocket Dedup

A distributed WebSocket listener cluster with exactly-once persistence using Redis + MongoDB behind an Nginx reverse proxy.

• See [ARCHITECTURE.md](./ARCHITECTURE.md) for full design, algorithms, failure modes, and scaling notes.
• See [TESTING.md](./TESTING.md) for step‑by‑step scenarios to validate deduplication and recovery.

## Features

- Exactly-once (logical) persistence using Redis claims + Mongo unique index
- Crash recovery via claim TTL & reclaim
- WebSocket scaling behind Nginx (`least_conn`) with passive health checks
- Works out-of-the-box locally (Docker) without secrets

## Tech Stack

- Node.js (Express, ws)
- Redis (claims, processed markers, pub/sub)
- MongoDB (persistence with unique index)
- Nginx (reverse proxy, WS upgrade, load balancing)

## Quick start

- Docker (recommended)
  - `docker compose up -d`
  - Connect WS client to `ws://localhost:5000`

- Local (dev only)
  - MongoDB at `mongodb://localhost:27017/fantacode`
  - Redis at `redis://localhost:6379`
  - `npm install`
  - `npm start`

## Scripts

- Duplicate flood: `node scripts/floodTest.js`
- Unique load (100 events): `node scripts/loadTest.js`

## Troubleshooting

- Seeing `already_processed` in load tests?
  - Use unique IDs per run (e.g., add a timestamp suffix) or clear test keys in Redis (dev only).
- Redis down?
  - The handler responds `temporarily_unavailable` until Redis reconnects.
- Unbalanced WS distribution?
  - `least_conn` is enabled; prefer short‑lived test connections with a small stagger for fairer balancing.
