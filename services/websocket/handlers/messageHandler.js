export const handleMessage = async (ws, message, redis) => {
    try {
        const msg = message.toString();
        console.log("Received:", msg);

        // Read the previous value before updating
        const prev = await redis.get("lastMessage");
        console.log("Previous lastMessage:", prev, "on", process.env.PORT);

        // Update the shared key
        await redis.set("lastMessage", msg);

        // Read back to confirm
        const stored = await redis.get("lastMessage");
        console.log("Redis echo:", stored);

        ws.send(`Redis shared value: ${stored}`);
    } catch (error) {
        console.error("❌ handleMessage error:", error.message);
    }
};