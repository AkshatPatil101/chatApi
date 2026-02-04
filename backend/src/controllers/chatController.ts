import type { Request, Response, NextFunction } from "express";
import Chat from "../models/Chat";
import type { AuthRequest } from "../middleware/auth";
import { json } from "stream/consumers";

export async function getChats(req:AuthRequest, res:Response, next:NextFunction){
    try {

        const userId = req.userId;
        console.log(userId)
        const chats = await Chat.find({
            participants:userId
        }).populate("participants","name email avatar").populate("lastMessage","text").sort({lastMessageAt:-1}); // Desc (Latest First)

        if(!chats) return res.status(404).json({message:"No chats available"});
        const formattedChats = chats.map((chat)=>{
            const otherParticipants = chat.participants.find(p => p._id.toString()!==userId);
            return {
                _id:chat._id,
                participant:otherParticipants ?? null,
                lastMessage:chat.lastMessage,
                lastMessageAt:chat.lastMessageAt,
                createdAt:chat.createdAt
            }
        })
        console.log("hit");
        res.status(200).json(formattedChats);

    } catch (error) {
        res.status(500);
        next(error);
    }
}



export async function getOrCreateChat(req:AuthRequest, res:Response, next:NextFunction){
    try {
        const {participantId} = req.params;
        const userId = req.userId;

        if(!participantId){
            res.status(400).json({message:"Participant Id is required"});
        }

        if(participantId==userId){
            res.status(400).json({message:"Cannot create chat with yourself"});
        }

        let chat = await Chat.findOne({participants:{$all:[userId,participantId]}})
        .populate("participants","name email avatar")
        .populate("lastMessage","text")

        if(!chat){
            const newChat = new Chat({participants:[userId,participantId]});  // new DataModel({...}) is loosely typed
            await newChat.save();
            chat = await newChat.populate("participants","name email avatar");
        }

        const otherParticipants = chat.participants.find(p => p._id.toString()!==userId);

        res.json({
            _id:chat._id,
            participant:otherParticipants ?? null,
            lastMessage:chat.lastMessage,
            lastMessageAt:chat.lastMessageAt,
            createdAt:chat.createdAt
        })

    } catch (error) {
        res.status(500);
        next(error); 
    }
}














