import {Router} from "express"
import { protectRoute } from "../middleware/auth";
import { getMessages } from "../controlleres/messageController";

const messageRouter = Router();

messageRouter.get('/chat/:chatId',protectRoute,getMessages);


export default messageRouter;