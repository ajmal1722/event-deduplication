import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './services/config/connectDB.js';

dotenv.config();
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`)
})