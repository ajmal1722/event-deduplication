import Event from '../../model/Event.js';
import { randomUUID } from 'crypto';

export const handleMessage = async (ws, rawMessage, redis) => {
    const start = Date.now();
    let claimKey;

    try {
        // Parse and extract eventId
        const message = JSON.parse(rawMessage);
        const eventId = message.id || message.eventId || randomUUID(); // fallback if none
        const type = message.type || 'generic';
        const processedKey = `processed:${eventId}`;
        claimKey = `claim:${eventId}`;

        console.log(`📩 Received event ${eventId} on ${process.env.PORT}`);

        // Fast-path: skip if already processed (covers replays long after claim TTL)
        if (await redis.exists(processedKey)) {
            console.log(`⏭️ Already processed (redis): ${eventId}`);
            ws.send(JSON.stringify({ status: 'already_processed', eventId }));
            return;
        }

        // Atomic claim so only one replica processes concurrently
        const claimed = await redis.set(claimKey, process.env.PORT, 'NX', 'EX', 300); // 5 min claim TTL
        if (!claimed) {
            console.log(`🚫 Duplicate in-flight skipped (claimed by other): ${eventId}`);
            ws.send(JSON.stringify({ status: 'in_progress_elsewhere', eventId }));
            return;
        }

        // Double-check after claim in case of a race with a just-finished processor
        if (await redis.exists(processedKey)) {
            console.log(`⏭️ Already processed after claim: ${eventId}`);
            return;
        }

        // Process (business logic placeholder)
        console.log(`⚙️ Processing event: ${eventId}`);
        await new Promise((res) => setTimeout(res, 100));

        // Persist (idempotent insert via Mongo unique index)
        try {
            await Event.create({
                eventId,
                type,
                payload: message,
                processedBy: process.env.PORT,
            });
            console.log(`✅ Event persisted in MongoDB: ${eventId}`);
        } catch (err) {
            if (err.code === 11000) {
                console.log(`⚠️ Already persisted in MongoDB (unique idx): ${eventId}`);
            } else {
                throw err;
            }
        }

        // Mark as processed (longer horizon than claim TTL)
        await redis.set(processedKey, process.env.PORT, 'EX', 86400); // 24h

        // Acknowledge to sender
        ws.send(JSON.stringify({ status: 'processed', eventId, processedBy: process.env.PORT, ms: Date.now() - start }));

    } catch (err) {
        console.error('❌ Error handling message:', err.message);
    } finally {
        if (claimKey) {
            try { await redis.del(claimKey); } catch {}
        }
    }
};