# Testing Scenarios for Distributed Deduplication

This document describes how to validate correctness, recovery, and scaling characteristics of the system.

Prereqs:
- Stack running via `docker compose up -d` (Nginx, listeners, Redis, Mongo).
- WebSocket client (e.g., `wscat`) or the provided Node scripts.

## 1) Duplicate Flood (Exactly-once for same id)
Purpose: Ensure only one listener processes and persists when multiple duplicates arrive.

- Script: `node scripts/floodTest.js`
  - Sends the same `id` from multiple clients concurrently.
- Expect:
  - Logs: one listener shows `Processing` then `Event persisted`; others log `in_progress_elsewhere` or `already_processed`.
  - Mongo: `db.events.countDocuments({ eventId: "evt_concurrent_test" })` → 1
  - Redis: `GET processed:evt_concurrent_test` → winner port

## 2) Crash-Once Recovery (Claim TTL expiry)
Purpose: Demonstrate recovery when the claimer crashes before persisting.

- Temporarily modify handler (or use the crash-once code path) to crash on a specific id after claim.
- Set claim TTL small (e.g., 5s).
- Send: `{ "id":"evt_crash_test_001", "type":"TEST" }`
- Wait > TTL, then send again.
- Expect:
  - First claimer logs a crash, others skip during TTL.
  - After TTL, another listener processes and persists.
  - Mongo: `countDocuments({ eventId: "evt_crash_test_001" })` → 1

## 3) TTL Reclaim with Slow Worker (Overlap, single finalize)
Purpose: If processing exceeds claim TTL, verify only one finalizes/persists.

- Temporarily set: claim TTL = 5s, processing delay = 6s.
- Send once, wait >5s, send again.
- Expect:
  - Two workers may log `Processing`, but only one persists and publishes.
  - Mongo: `countDocuments({ eventId: "evt_ttl_reclaim_test" })` → 1

## 4) Redis Downtime (Readiness Guard)
Purpose: Ensure no processing happens when Redis is down.

- Stop Redis: `docker stop fantacode_redis`
- Send any event.
- Expect:
  - Client receives `{ status: 'temporarily_unavailable', reason: 'redis_down' }`.
  - No claim/persist happens.
- Start Redis: `docker start fantacode_redis`
- Send again: normal processing resumes.

## 5) High Throughput (100 unique events)
Purpose: Validate throughput and distribution across listeners.

- Script: `node scripts/loadTest.js`
  - Optionally use a per-run suffix to avoid dedupe hits.
- Expect:
  - Mongo: `db.events.countDocuments({ type: "LOAD_TEST" })` → 100
  - Distribution:
    ```
    db.events.aggregate([
      { $match: { type: "LOAD_TEST" } },
      { $group: { _id: "$processedBy", count: { $sum: 1 } } }
    ])
    ```
    Counts are roughly balanced across 5001/5002/5003.

## 6) Nginx Upgrade and Failover
Purpose: Confirm WS upgrade and failover behavior.

- Observe Nginx logs for `101` Switching Protocols during tests.
- Optional in nginx.conf `location /` add:
  - `proxy_next_upstream error timeout http_502 http_503 http_504;`
  - `proxy_next_upstream_tries 3;`

## Tips
- If you rerun tests with the same ids during the 24h processed TTL, you’ll see `already_processed`. Either change ids or delete test keys from Redis (dev only).
- Ensure Mongo has a unique index on `eventId`:
  - `db.events.createIndex({ eventId: 1 }, { unique: true })`
  - Check: `db.events.getIndexes()`
