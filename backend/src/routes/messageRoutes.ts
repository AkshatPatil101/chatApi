import {Router} from "express"
import { protectRoute } from "../middleware/auth";
import { getMessages } from "../controllers/messageController";

const messageRouter = Router();

messageRouter.get('/chat/:chatId',protectRoute,getMessages);


export default messageRouter;