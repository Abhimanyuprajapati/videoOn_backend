import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import chatRoutes from './routes/chat.route.js'
import { connectDB } from './lib/db.js'
import cookieParser from 'cookie-parser'



const app = express()
const PORT = process.env.PORT || 1111;

// app.use(cors({
//   origin: "http://localhost:5173" "https://video-on.vercel.app/",
//   credentials: true,
// }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://video-on.vercel.app",
    "https://video-on.vercel.app/"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World! from backend')
})

// auth routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
  connectDB();
})
