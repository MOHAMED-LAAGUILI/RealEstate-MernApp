import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import postsRoute from "./routes/post.route.js";
import usersRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";

dotenv.config();

const app = express()
const port = process.env.API_PORT || 8000 

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoute)
app.use('/api/users', usersRoute)
app.use('/api/posts', postsRoute)


app.listen( port, () => {
  console.warn(`app running on http://localhost:${port}`);
})