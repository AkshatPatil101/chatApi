import type { Request,Response, NextFunction } from "express"
import type { AuthRequest } from "../middleware/auth"
import { User } from "../models/User"


export async function getUsers(req:AuthRequest, res:Response, next:NextFunction){
    try {

        const users = await User.find({_id:{$ne:req.userId}}).select("name email avatar");

        res.json(users);

    } catch (error) {
        res.status(500);    
        next(error);
    }
}