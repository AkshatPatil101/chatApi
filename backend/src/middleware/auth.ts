import type { Request, Response, NextFunction } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { User } from "../models/User";

export type AuthRequest = Request & {
    userId?:string;
}

export const protectRoute = [
    requireAuth(),
    async (req:AuthRequest, res:Response, next:NextFunction) => {
        try{
            const {userId:clerkId} = getAuth(req);
            if (!clerkId) return res.status(401).json({message:"Unauthorized - Invalid Token"});

            const user = await User.findOne({clerkId:clerkId});
            if(!user) return res.status(404).json({message:"User not Found"});

            req.userId = user._id.toString();

            next();

        } catch(error){
            console.error("Error in protect route middleware", error);
        }
    }
]