import axios from "axios";
import { io, Socket } from "socket.io-client";

const API_URL = "https://bolt-chat-backend.onrender.com";

// PASTE YOUR TWO TOKENS HERE
const TOKEN_A = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zOTFUbVBNS0J6anEzVkJFV1NNalA0ZzBxUm0iLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3NzAzNzA1NDgsImZ2YSI6Wzk5OTk5LC0xXSwiaWF0IjoxNzcwMzcwNDg4LCJpc3MiOiJodHRwczovL3N1cHJlbWUtdmlwZXItMzUuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzcwMzcwNDc4LCJzaWQiOiJzZXNzXzM5STR3SE5XWUlhZllhNEhucnNJYzdGenRoSiIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzlIZnNQVW0yR2ZPZGFiRkhKcFNXb0tzVHFmIiwidiI6Mn0.fpEVtaFZib23CicnSJbgkgbiHz9kMt_O1W2eqe1n4s5Kr6IvKjvuLn-pyVyv6TgiAEWbG2wtvG2sLpfliqQUeDTUNmMaqzV-JQlY2UB_pa8nc6-Yakd1HaxvY15G0PLKeMKzMyYvEG2RdCFNuDs8zOkbMdx1FTBuL-7sgdrVjetcdlHvWVP2CxrXLDUG7Z-bptWUI74L0k4_Qv7Bxai6h7ZMyfy5GE5ntFfJGg6V9sVCG2Xe4xsUcufOyYQ1ojJOrkUk5-otgxyY1XzmV8S3u0DvW-IPkZ5Ss9jmLTRRrsGmOShUIcPzehqCkmAgTCXzOuh-MRj8LjhupNWEh2xpBQ";
const TOKEN_B = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zOTFUbVBNS0J6anEzVkJFV1NNalA0ZzBxUm0iLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3NzAzNzA1NjEsImZ2YSI6Wzk5OTk5LC0xXSwiaWF0IjoxNzcwMzcwNTAxLCJpc3MiOiJodHRwczovL3N1cHJlbWUtdmlwZXItMzUuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzcwMzcwNDkxLCJzaWQiOiJzZXNzXzM5STR5MXlmblBjYVludnFvNDZ2ZXNHQnltMyIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzlHYzBzaGlDODRWQUFjZ29UdUZFdFFNRkFMIiwidiI6Mn0.GxMDFzu_hBXIW9O5yJwoiq6HmUMTNICKNy2rdRK1KzQmP_sKutBfSgx-BkazMQtRkh9VzBdWm8rupM7O-wAE5JuR6kxeamuvpNUMV7WNTyOhm0M6yELzTcjcsPoIKEylVYktKy58-v4KtkJ0ghvl5jLqqrvGIQOPHGsrFrls4pLlV9I2lZzIRgWYPJ0gN4Xp_0Dkz9j4Fnq1TzMwytWMNeo6xJh_lWSPDB3hLi9sFjFER1_mmBdYYgY4qF2Uiim8rKNPz03vJv23dNyBP37LWf_yIGD2c6qhnruu7QtS2wGPNYrS_6GgzWT0YNae8V1kj2l6IGLPMRclanGQrzhiuw";

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