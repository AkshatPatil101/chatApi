import {Router} from "express"
import { authCallBack, getMe } from "../controlleres/authController";
import { protectRoute } from "../middleware/auth";

const authRouter = Router();


authRouter.get('/me',protectRoute,getMe);

authRouter.post('/callback',authCallBack);



export default authRouter;