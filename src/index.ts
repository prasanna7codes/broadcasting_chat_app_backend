import { WebSocketServer, WebSocket, RawData } from "ws";
import mongoose from 'mongoose';
import { DataModel } from "./db";

const PORT = process.env.PORT || 8080;


const DB_URI = "mongodb+srv://prasannasahoo0806:pua5dRtvJRTYxvGm@cluster0.lx9jyi5.mongodb.net/ChatData";

async function StartServer() {
  try {
    await mongoose.connect(DB_URI);
    console.log("Database connected");

    const allSockets = new Map<WebSocket, string>();
     const wss = new WebSocketServer({ port: +PORT });

    wss.on("connection", (socket: WebSocket) => {
      console.log("User connected");

      socket.on("message", async (message: RawData) => {
        const parsedMessage = JSON.parse(message.toString());

if (parsedMessage.type === "join") {
  const roomId: string = parsedMessage.payload.roomId;
  const password: string | null = parsedMessage.payload.password ?? null;

  const roomData = await DataModel.findOne({ roomId });

  if (roomData) {
    // Room already exists
    if (roomData.password) {
      // Room is password protected
      if (!password || password !== roomData.password) {
        socket.send(JSON.stringify({
          type: "error",
          payload: { message: "Incorrect or missing password for this room. Or a private room already exists" }
        }));
        socket.close();
        return;
      }
    }

    // Correct password or public room
    allSockets.set(socket, roomId);
    console.log(`User connected to room: ${roomId}`);
    socket.send(JSON.stringify({
      type: "history",
      payload: roomData.messages,
    }));

  } else {
    // Room doesn't exist → allow creation
    const newRoom = await DataModel.create({
      roomId,
      password,
      messages: [],
    });

    allSockets.set(socket, roomId);
    console.log(`New room created: ${roomId}`);
    socket.send(JSON.stringify({
      type: "history",
      payload: newRoom.messages,
    }));
  }
}




        if (parsedMessage.type === "message") {
          const msg: string = parsedMessage.payload.message;
          const roomId = allSockets.get(socket);
          if (!roomId) return;

          await DataModel.updateOne({ roomId }, { $push: { messages: msg } });

          // Broadcast to others in the same room
          for (const [client, clientRoom] of allSockets) {
            if (
              clientRoom === roomId &&
              client.readyState === WebSocket.OPEN
            ) {
              client.send(
                JSON.stringify({
                  type: "message",
                  payload: { message: msg },
                })
              );
            }
          }
        }
      });

      socket.on("close", () => {
        const roomId = allSockets.get(socket);
        allSockets.delete(socket);
        console.log(`User disconnected from room: ${roomId}`);
      });
    });
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

StartServer();
