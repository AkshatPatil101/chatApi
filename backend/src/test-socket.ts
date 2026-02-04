const { io } = require("socket.io-client");

// 1. PASTE YOUR TOKEN HERE
// It's okay if it includes "Bearer " or not; your backend fix handles both.
const MY_BEARER_TOKEN = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zOTFUbVBNS0J6anEzVkJFV1NNalA0ZzBxUm0iLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3NzAyMTA1NTUsImZ2YSI6WzEwNjYsLTFdLCJpYXQiOjE3NzAyMTA0OTUsImlzcyI6Imh0dHBzOi8vc3VwcmVtZS12aXBlci0zNS5jbGVyay5hY2NvdW50cy5kZXYiLCJuYmYiOjE3NzAyMTA0ODUsInNpZCI6InNlc3NfMzlBa3o3cHljVk9NNGNQNDN5NEpjQ0U1QU9vIiwic3RzIjoiYWN0aXZlIiwic3ViIjoidXNlcl8zOUE2OG5lUzdrTllOeHVDajZMRVFEejRyQ1UiLCJ2IjoyfQ.HT8XiyGw7-WfKAGsSoT0_0gdJnL4u8ZQyRVdwoGvq5bT5-zIZDeCnGf1RB4LgY3P06e7x8r-VlYfg7AyzNY5IDq6a2SDblhG7-r1FqyTi-bhr9rx4DiLodefb-o5qArqGpOEXMFP8OyeWYhDKiKZTYEi10Xqxcc1yalW-F9AAonoHf0HAnEVWFlQFKL2Sy6gtl7txtBOLS3B"; 

// 2. CHANGE TO YOUR LOCAL IP
const SERVER_URL = "http://10.186.137.57:3000";

console.log(`🔄 Attempting to connect to ${SERVER_URL}...`);

const socket = io(SERVER_URL, {
  auth: {
    token: MY_BEARER_TOKEN
  },
  transports: ["websocket"] // Highy recommended for mobile/local testing
});

// Event: Successful Connection
socket.on("connect", () => {
  console.log("✅ Connected! Socket ID:", socket.id);
  
  // Test: Join a chat room if you have a chatId
  // socket.emit("join-chat", "your_chat_id_here");
});

// Event: Connection Error (This is where "Authentication Error" will show up)
socket.on("connect_error", (err) => {
  console.log("❌ Connection Error:", err.message);
  if (err.data) console.log("Details:", err.data);
});

// Event: Listening for messages
socket.on("new-message", (message) => {
  console.log("📩 New Message Received:", message);
});

// Event: Online users list
socket.on("online-users", (data) => {
  console.log("👥 Online Users:", data.userIds);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Disconnected:", reason);
});