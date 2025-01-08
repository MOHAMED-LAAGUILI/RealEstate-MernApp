import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import postsRoute from "./routes/post.route.js";
import usersRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";

dotenv.config();

const app = express()
const port = process.env.API_PORT || 8000 

// Enable CORS for all routes globally with a specific origin
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',  // Replace with your front-end URL
  credentials: true,  // Optional: allow credentials like cookies
};

app.use(cors(corsOptions));


app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoute)
app.use('api/users', usersRoute)
app.use('api/posts', postsRoute)


app.listen( port, () => {
  console.warn(`app running on http://localhost:${port}`);
})