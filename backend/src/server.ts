import express from "express"
import { connectDB } from "./config/db";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import messageRouter from "./routes/messageRoutes";
import chatRouter from "./routes/chatRoutes";
import { clerkMiddleware } from '@clerk/express'
import { errorHandler } from "./middleware/errorHandler";
import {createServer} from "http"
import { initializeSocket } from "./utils/socket";

const app = express();

// Middleware
app.use(clerkMiddleware());
app.use(express.json());

// Routes
app.use('/api/auth',authRouter);
app.use('/api/chats',chatRouter);
app.use('/api/messages',messageRouter);
app.use('/api/users',userRouter);


// Error Handles
app.use(errorHandler);


app.get('/',(req,res)=>{
    res.status(200).json({
        status:"ok",
        message:"Server running"
    })
})

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

initializeSocket(httpServer);

app.listen(PORT,()=>{
    connectDB();
    console.log(`Listening on port ${PORT}`);
})


export default app;