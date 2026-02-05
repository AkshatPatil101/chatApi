import { clerkClient, getAuth } from "@clerk/express";
import type { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import type {Response, Request, NextFunction} from "express"

export async function getMe(req:AuthRequest,res:Response, next:NextFunction){
    try {

        const user = await User.findById(req.userId);

        if(!user) return res.status(404).json({message:"User not Found"});

        res.status(200).json(user);

    } catch (error) {
       res.status(500)
       next();
    }
}

export async function authCallBack(req:Request, res:Response, next:NextFunction){
    try {
        console.log("authCallBack is called")
        const {userId:clerkId} = getAuth(req);

        if(!clerkId) return res.status(401).json({message:"Unathorized - Invalid Token"});

        let user = await User.findOne({clerkId:clerkId});
        if(!user){
            const clerkUser = await clerkClient.users.getUser(clerkId);

            user = await User.create({
                clerkId,
                name:clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim() : clerkUser.emailAddresses[0]?.emailAddress.split("@")[0],
                email:clerkUser.emailAddresses[0]?.emailAddress,
                avatar:clerkUser.imageUrl,
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500);
        next();
    }
}