export const handleMessage = (ws, message) => {
    console.log('📨 Received:', message);

    // Basic echo logic (can expand later)
    ws.send(`Server: You said "${message}"`);
};
