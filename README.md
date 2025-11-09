# Fantacode Distributed WebSocket Dedup

A distributed WebSocket listener cluster with exactly-once persistence using Redis + MongoDB behind an Nginx reverse proxy.

- See ARCHITECTURE.md for the full design, algorithms, failure modes, and scaling notes.
- See TESTING.md for step-by-step scenarios to validate deduplication and recovery.

## Quick start

- With Docker (recommended):
  - `docker compose up -d`
  - Connect a client to `ws://localhost:5000`

- Without Docker (dev only):
  - Ensure local MongoDB at `mongodb://localhost:27017/fantacode`
  - Ensure Redis at `redis://localhost:6379`
  - `npm install`
  - `npm start`

## Load tests

- Duplicate flood: `node scripts/floodTest.js`
- Unique load (100 events): `node scripts/loadTest.js`
