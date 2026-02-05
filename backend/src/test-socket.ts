import axios from "axios";
import { io, Socket } from "socket.io-client";

const API_URL = "http://localhost:3000";

// PASTE YOUR TWO TOKENS HERE
const TOKEN_A = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zOTFUbVBNS0J6anEzVkJFV1NNalA0ZzBxUm0iLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3NzAzMTQzODksImZ2YSI6Wzk5OTk5LC0xXSwiaWF0IjoxNzcwMzE0MzI5LCJpc3MiOiJodHRwczovL3N1cHJlbWUtdmlwZXItMzUuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzcwMzE0MzE5LCJzaWQiOiJzZXNzXzM5R0Y3MHpiNWtnazVhYWJXcHlXRGpKNFoxQyIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzlGejZwUGcxRzNiVkJXZEJnb2JXR2ZsRTdIIiwidiI6Mn0.aH-L3o5mJmW7doLybQpvicIASIeVZzXkJt8Ij9nQznPsmuOQ14hQv0F9uyljHRwqw5la-08gKeenJpxm8OiaXsmU-xe_vtinWFwEqUUcfqUCWphE8D04tYFQH9iAQmW5lUKxRj0ggWPgWI4Hlfl4XoE2Jr6evAV5ZpXzpp5j8Y2c8K4PeR2CYLfXvC-xpeRBOwqGynDQZPvS70s-krgyM0h9gDP-pH6gzN38EFbQdOOhpFJEIQdwlVbua9sJfLHo052C14nO9ldqGfgeHHbh75VQCVOOA8fefEFQoS5rfivYh3-p1AB2RzWz9dOqd5o8ter-dHdP8vudWJbsqhJnVA";
const TOKEN_B = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zOTFUbVBNS0J6anEzVkJFV1NNalA0ZzBxUm0iLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3NzAzMTQ0MDMsImZ2YSI6Wzk5OTk5LC0xXSwiaWF0IjoxNzcwMzE0MzQzLCJpc3MiOiJodHRwczovL3N1cHJlbWUtdmlwZXItMzUuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzcwMzE0MzMzLCJzaWQiOiJzZXNzXzM5R0Y4bEREZFBPTFA0SXhkUVhRS0JPYTFWZiIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzlEa2k3QWh6dTZJNUV4Z1dSUDl1V05oa0xtIiwidiI6Mn0.bOPK8-F5Chg2rI_HLhp_-OL8hlm2o42sjlg_BWstHs7K7ppC9G3oITomMgPwD4CwWEIou_lE4uk6_PQi6aRw9jV6pmYYlpKLMVTmS6OT7UQLwqCim95WT2OM7OQWd5kOwAHFk4kEp0VuVBAsuUPa6KA-zVRnmfOCWBUGeZ4I64vogYruigCFrAcn_M5qha4MC4nr1f29sIjumDz2wqNL2cmYen9kKLfRKhlDpLxAshx4igtGfHBolAWOUq9ZzZgGOjHX6v7XuZviMghNJYRLz8jWqtW6RT42xpZFhYeIz2dsDmZHChBenwNyvUQWEFNJZZg48ZVSRCvJvJblJ06IbA";

async function runDuel() {
    console.log("🤺 Starting the Socket Duel...");

    try {
        // --- 1. SETUP USER A ---
        const httpA = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${TOKEN_A}` } });
        const meA = await httpA.post("/api/auth/callback");
        const userAId = meA.data._id;
        console.log(`👤 User A Synced: ${meA.data.name} (${userAId})`);

        // --- 2. SETUP USER B ---
        const httpB = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${TOKEN_B}` } });
        const meB = await httpB.post("/api/auth/callback");
        const userBId = meB.data._id;
        console.log(`👤 User B Synced: ${meB.data.name} (${userBId})`);

        // --- 3. LINK USERS ---
        console.log("🔗 Linking Users in a Chat...");
        const chatRes = await httpA.post(`/api/chats/with/${userBId}`);
        const chatId = chatRes.data._id;
        console.log(`✅ Chat Created! ID: ${chatId}`);

        // --- 4. CONNECT SOCKETS ---
        // We use transports: ["websocket"] to ensure Bun/Node doesn't hang on polling
        const socketA: Socket = io(API_URL, { auth: { token: TOKEN_A }, transports: ["websocket"] });
        const socketB: Socket = io(API_URL, { auth: { token: TOKEN_B }, transports: ["websocket"] });

        // --- 5. SETUP LISTENERS & EMITTERS ---

        // Error handling for debugging
        socketA.on("socket-error", (err) => console.error("❌ Socket A Error:", err));
        socketB.on("socket-error", (err) => console.error("❌ Socket B Error:", err));
        socketA.on("connect_error", (err) => console.error("❌ Socket A Connect Error:", err.message));

        socketA.on("connect", () => {
            console.log("📡 User A Socket Connected");
            // Backend expects "join-chat"
            socketA.emit("join-chat", chatId); 
        });

        // Backend emits "new-message"
        socketA.on("new-message", (msg) => {
            console.log(`\n✨ REAL-TIME ALERT: User A received a message!`);
            console.log(`📩 From: ${msg.sender.name}`);
            console.log(`💬 Text: "${msg.text}"`);
            console.log("\n🚀 BACKEND IS BULLETPROOF!");
            
            // Clean up and exit
            socketA.disconnect();
            socketB.disconnect();
            process.exit(0);
        });

        socketB.on("connect", () => {
            console.log("📡 User B Socket Connected");
            socketB.emit("join-chat", chatId); 

            // Give User A time to join the room
            setTimeout(() => {
                console.log("📤 User B emitting 'send-message'...");
                socketB.emit("send-message", {
                    chatId: chatId,
                    text: "Hello from User B! This is a bulletproof test."
                });
            }, 1500);
        });

    } catch (error: any) {
        console.error("❌ Duel Failed!");
        console.error(error.response?.data || error.message);
        process.exit(1);
    }
}

runDuel();