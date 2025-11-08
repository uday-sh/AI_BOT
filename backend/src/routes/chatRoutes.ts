import express from "express";
import { handleChat, getChats, clearChats } from "../controllers/chatController";
import { model } from "../utils/geminiClient";

const router = express.Router();

// Test route for Gemini
router.get("/test-gemini", async (req, res) => {
  try {
    const result = await model.generateContent("Write a one-line quote about AI");
    const reply = result.response.text();
    res.json({ success: true, reply });
  } catch (err: any) {
    console.error("❌ test-gemini error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

//  Main routes
router.post("/", handleChat);
router.get("/:userId", getChats);
router.delete("/:userId", clearChats);

export default router;
