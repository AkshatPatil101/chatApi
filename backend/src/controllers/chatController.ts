import type { Request, Response, NextFunction } from "express";
import Chat from "../models/Chat";
import type { AuthRequest } from "../middleware/auth";
import { json } from "stream/consumers";

export async function getChats(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email avatar")
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
        populate: {
          path: "sender",
          select: "_id",
        },
      })
      .sort({ lastMessageAt: -1 });

    const formattedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (p: any) => p._id.toString() !== userId
      );

      // --- SAFE sender extraction ---
      let lastSenderId: string | null = null;

      if (
        chat.lastMessage &&
        typeof chat.lastMessage === "object" &&
        "sender" in chat.lastMessage &&
        chat.lastMessage.sender
      ) {
        lastSenderId =
          typeof chat.lastMessage.sender === "object"
            ? chat.lastMessage.sender._id.toString()
            : chat.lastMessage.sender.toString();
      }

      // --- READ LOGIC ---
      const isRead =
        !chat.lastMessage || // no messages
        lastSenderId === userId || // last message sent by self
        chat.readBy?.some((id) => id.toString() === userId); // explicitly read
      console.log(isRead)
      return {
        _id: chat._id,
        participant: otherParticipant ?? null,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
        isRead,
      };
    });

    res.status(200).json(formattedChats);
  } catch (error) {
    next(error);
  }
}




export async function getOrCreateChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { participantId } = req.params;
    const userId = req.userId;

    if (!participantId)
      return res.status(400).json({ message: "Participant Id is required" });

    if (participantId === userId)
      return res.status(400).json({ message: "Cannot create chat with yourself" });

    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    })
      .populate("participants", "name email avatar")
      .populate({
        path: "lastMessage",
        select: "text sender createdAt",
        populate: { path: "sender", select: "_id" },
      });

    if (!chat) {
      chat = await Chat.create({
        participants: [userId, participantId],
      });

      chat = await chat.populate("participants", "name email avatar");
    }

    const otherParticipant = chat.participants.find(
      (p: any) => p._id.toString() !== userId
    );

    res.json({
      _id: chat._id,
      participant: otherParticipant ?? null,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    next(error);
  }
}
