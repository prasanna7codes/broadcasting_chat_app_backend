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

          allSockets.set(socket, roomId);
          console.log(`User connected to room: ${roomId}`);

          let roomData = await DataModel.findOne({ roomId });

          if (!roomData) {
            roomData = await DataModel.create({ roomId, messages: [] });
          }

          socket.send(
            JSON.stringify({
              type: "history",
              payload: roomData.messages,
            })
          );
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
