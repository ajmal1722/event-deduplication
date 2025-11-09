import WebSocket from "ws";
const url = "ws://localhost:5000";
const TOTAL = 100;

function sendEvent(i) {
    const event = { id: `event_bulk_${i}`, type: "LOAD_TEST", payload: { n: i } };
    const ws = new WebSocket(url);
    ws.on("open", () => {
        ws.send(JSON.stringify(event));
        setTimeout(() => ws.close(), 50);
    });
    ws.on("error", e => console.error("ws err", i, e.message));
}

for (let i = 0; i < TOTAL; i++) {
    setTimeout(() => sendEvent(i), i * 5); // small stagger
}