import {Router} from "express"
import { getUsers } from "../controlleres/userController";
import { protectRoute } from "../middleware/auth";

const userRouter = Router();


userRouter.get('/',protectRoute, getUsers);


export default userRouter;