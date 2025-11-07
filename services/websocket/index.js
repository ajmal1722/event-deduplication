import { WebSocketServer } from "ws";
import { connectRedis } from "../config/connectRedis.js";
import { handleMessage } from "./handlers/messageHandler.js";

export const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    const redis = connectRedis(); // ✅ Shared connection layer

    wss.on("connection", (ws) => {
        console.log("🟢 New WebSocket connection");

        ws.send("Welcome to the distributed listener!");

        ws.on("message", (msg) => handleMessage(ws, msg, redis));

        ws.on("close", () => console.log("🔴 Client disconnected"));
    });

    console.log("⚡ WebSocket server initialized");
};