import { WebSocketServer } from 'ws';
import { handleMessage } from './handlers/messageHandler.js';

export const initializeWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        console.log('🟢 New client connected');

        ws.send('Welcome to the WebSocket server!');

        ws.on('message', (message) => handleMessage(ws, message));

        ws.on('close', () => {
            console.log('🔴 Client disconnected');
        });
    });

    console.log('⚡ WebSocket server initialized');
};
