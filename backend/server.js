import "./config/env.js";

import express from "express"
import cors from "cors"
import morgan from "morgan"

import routes from "./routes/index.js"
import errorHandler from "./middleware/errorHandler.js"
import connectDB from './config/db.js'
import rateLimit from 'express-rate-limit'


const app = express();

app.use(cors({
  origin: "https://smart-mart-beta.vercel.app/",
  credentials: true
}));

const limiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 200,
    message: { error: 'Too many requests, please try again later.' }
});

app.use('/api',limiter);

app.use(express.json());
app.use(morgan('dev'));

app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});
