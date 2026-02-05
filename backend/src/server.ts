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
import { clerkClient } from "@clerk/express";



app.get('/dev/token/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Create a Sign-In Token (This is the official way to 'impersonate' for tests)
        // This generates a URL that usually logs a user in, but we just want the JWT.
        const signInToken = await clerkClient.signInTokens.createSignInToken({
            userId,
            expiresInSeconds: 3600, // 1 hour
        });

        // 2. To get a raw JWT session token without a browser, 
        // we use the 'testing tokens' or 'createSession' if available.
        // If your SDK version supports it, this is the correct syntax:
        const session = await clerkClient.sessions.createSession({ userId });
        const tokenResponse = await clerkClient.sessions.getToken(session.id);

        res.json({ 
            userId,
            token: tokenResponse.jwt 
        });
    } catch (error: any) {
        // If sessions.createSession fails, it's likely because your 
        // Clerk instance is in Production or the SDK version is different.
        console.error("Manual Token Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});
app.use('/api/auth',authRouter);
app.use('/api/chats',chatRouter);
app.use('/api/messages',messageRouter);
app.use('/api/users',userRouter);


// Error Handles
app.use(errorHandler);


app.get('/health',(req,res)=>{
    res.status(200).json({
        status:"ok",
        message:"Server running"
    })
})

const PORT = Number(process.env.PORT) || 3000;

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, '0.0.0.0', () => {
    connectDB();
    console.log(`🚀 Server & Sockets running on port ${PORT}`);
});

export default app;