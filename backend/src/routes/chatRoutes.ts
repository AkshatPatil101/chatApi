import {Router} from "express"
import { protectRoute } from "../middleware/auth";
import { getChats, getOrCreateChat } from "../controlleres/chatController";

const chatRouter = Router();


chatRouter.get('/',protectRoute,getChats);

chatRouter.post('/with/:participantId',protectRoute,getOrCreateChat);


export default chatRouter;