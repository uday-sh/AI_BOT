import { Request, Response } from "express";
import Chat from "../models/chatModel";
import { model } from "../utils/geminiClient";


export const handleChat = async (req: Request, res: Response) => {
  try {
    const { userId, prompt } = req.body;

   
    const result = await model.generateContent(prompt);
    const botMessage = result.response.text();

    let chat = await Chat.findOne({ userId });
    if (chat) {
      chat.messages.push({ role: "user", content: prompt });
      chat.messages.push({ role: "bot", content: botMessage });
      await chat.save();
    } else {
      chat = await Chat.create({
        userId,
        messages: [
          { role: "user", content: prompt },
          { role: "bot", content: botMessage },
        ],
      });
    }

  
    res.json({ success: true, botMessage });
  } catch (err: any) {
    console.error("❌ handleChat error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};


 
export const getChats = async (req: Request, res: Response) => {
  try {
    const chat = await Chat.findOne({ userId: req.params.userId });
    res.json(chat ? chat.messages : []);
  } catch (err) {
    res.status(500).json({ error: "Error fetching chats" });
  }
};

export const clearChats = async (req: Request, res: Response) => {
  try {
    await Chat.deleteOne({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error clearing chats" });
  }
};
