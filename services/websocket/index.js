import { WebSocketServer } from "ws";
import { connectRedis, connectRedisSubscriber } from "../config/connectRedis.js";
import { handleMessage } from "./handlers/messageHandler.js";

export const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({ server });
    const redis = connectRedis();
    const sub = connectRedisSubscriber();

    // Subscribe to cluster events
    sub.subscribe("events", (err) => {
        if (err) console.error("❌ Redis subscribe failed:", err.message);
    });

    sub.on("message", (channel, msg) => {
        let data;
        try {
            data = JSON.parse(msg);
        } catch (e) {
            console.error(`⚠️ [${process.env.PORT}] Invalid broadcast payload:`, msg);
            return;
        }
        console.log(`📡 [${process.env.PORT}] Received broadcast:`, data);

        // Broadcast to all local WebSocket clients
        wss.clients.forEach((client) => {
            if (client.readyState === 1) client.send(JSON.stringify({ broadcast: data }));
        });
    });

    wss.on("connection", (ws) => {
        console.log(`🟢 [${process.env.PORT}] Client connected`);
        ws.send("Welcome to the distributed WebSocket cluster!");

        ws.on("message", (message) => handleMessage(ws, message, redis));
        ws.on("close", () => console.log(`🔴 [${process.env.PORT}] Client disconnected`));
    });

    // Announce node presence cluster-wide
    try {
        redis.publish(
            "events",
            JSON.stringify({ type: "node_online", port: process.env.PORT, ts: Date.now() })
        );
    } catch (e) {
        console.error("⚠️ Failed to publish node_online:", e.message);
    }

    console.log(`⚡ WebSocket server initialized on ${process.env.PORT}`);
};