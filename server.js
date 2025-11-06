import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './services/config/connectDB.js';
import routes from './routes/index.js';
import { initializeWebSocket } from './services/websocket/index.js';

dotenv.config();
connectDB();

const port = process.env.PORT || 3000;

// Initialize Express app
const app = express();

// Initialize middleware
app.use(morgan('dev'));
app.use(express.json());

// Initialize routes
app.use('/', routes);

// Initialize WebSocket server
const server = http.createServer(app);

// Initialize WebSocket server
initializeWebSocket(server);

server.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});