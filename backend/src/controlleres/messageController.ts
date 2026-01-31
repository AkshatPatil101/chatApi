import type {Request, Response, NextFunction} from "express"
import type { AuthRequest } from "../middleware/auth";
import Chat from "../models/Chat";
import { Message } from "../models/Message";

export async function getMessages(req:AuthRequest, res:Response, next:NextFunction){

    try {

        const {chatId} = req.params;
        const userId = req.userId;

        const chat = await Chat.findOne({
            _id:chatId,
            participants:userId
        })

        if(!chat) return res.status(404).json({message:"Chat not Found"});

        const messages = await Message.find({
            chat:chatId
        }).populate("sender", "name email avatar").sort({createdAt:1}); // Ascending (Oldest First)

        res.json(messages)


    } catch (error) {
        
    }

}