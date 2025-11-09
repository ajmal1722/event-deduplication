import WebSocket from "ws";

const url = "ws://localhost:5000";
const TOTAL = 10;
const payload = JSON.stringify({
    id: "evt_concurrent_test_003",
    type: "TEST",
    payload: { msg: "flood event" },
});

for (let i = 0; i < TOTAL; i++) {
    const ws = new WebSocket(url);
    ws.on("open", () => ws.send(payload));
    ws.on("message", (data) => console.log(`Client ${i}: ${data}`));
}
