import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";


dotenv.config({ path: "./.env" });

const app = express();

//  Middleware
app.use(express.json());
app.use(cookieParser());


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE"],
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);



mongoose
  .connect(process.env.MONGODB_URL as string)
  .then(() => console.log("✅ MongoDB connected successfully 🚀"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

//  Root route
app.get("/", (req: Request, res: Response) => {
  res.send("🤖 Lexa AI Backend is running...");
});

//  Start the server
app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
});

