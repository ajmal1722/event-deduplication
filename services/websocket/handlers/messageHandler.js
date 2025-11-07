import { connectRedis } from "../../config/connectRedis.js";

// Create shared Redis connection
const redis = connectRedis();

export const handleMessage = async (ws, message) => {
    try {
        const parsed = JSON.parse(message);
        const eventId = parsed.id || parsed.eventId || parsed._id;

        if (!eventId) {
            console.warn('⚠️ Message missing eventId, skipping');
            return;
        }

        // Check if this event is already processed
        const isDuplicate = await redis.exists(eventId);
        if (isDuplicate) {
            console.log(`🚫 Duplicate event skipped: ${eventId}`);
            return;
        }

        // Mark event as processed with a TTL (e.g., 5 minutes)
        await redis.set(eventId, 'processed', 'EX', 300);

        // Process event here
        console.log(`✅ Processing event: ${eventId}`);
        ws.send(`Processed event: ${eventId}`);

    } catch (error) {
        console.error('❌ handleMessage error:', error.message);
    }
};