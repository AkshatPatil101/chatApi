import { Router} from "express"
import { authCallBack, getMe } from "../controllers/authController";
import { protectRoute } from "../middleware/auth";
import type { Response,Request } from "express";

const authRouter = Router();


authRouter.get('/me',protectRoute,getMe);

authRouter.post('/callback',authCallBack);
authRouter.get('/callback',(req:Request,res:Response)=>{
    res.status(200).json({
        message:"working"
    })
})



export default authRouter;