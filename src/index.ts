import { WebSocketServer, WebSocket } from "ws";
import mongoose from 'mongoose';
import { DataModel } from "./db"


const wss = new WebSocketServer({port : 8080})
const DB_URI = "mongodb+srv://prasannasahoo0806:pua5dRtvJRTYxvGm@cluster0.lx9jyi5.mongodb.net/ChatData";

async function StartServer(){
  try {

    await mongoose.connect(DB_URI);
    console.log("Database connected");


    const allSockets=new Map <WebSocket,string>();

    wss.on("connection", (socket)=>{
    console.log("user connected ")
  


    socket.on("message",async (message)=>{
         const parsedMessage = JSON.parse(message.toString());
         if(parsedMessage.type==="join"){
              const roomId = parsedMessage.payload.roomId;

            allSockets.set(socket,roomId)
            console.log(roomId)
            console.log(`User connected room: ${roomId}`);

            let roomData = await DataModel.findOne({ roomId });
           
            if (!roomData) {
                 roomData = await DataModel.create({ roomId, messages: [] });
                        }

              socket.send(
                    JSON.stringify({
                         type: "history",
                         payload: roomData.messages,
                                    })
                        )


         }

      if (parsedMessage.type === "message") {  
                    console.log(parsedMessage.payload.message)
 
             const roomId = allSockets.get(socket);
            if (!roomId) return;

            const msg = parsedMessage.payload.message;
            await DataModel.updateOne({ roomId }, { $push: { messages: msg } });//






  // Broadcast to others in the same room
            for (const [client, clientRoom] of allSockets) {
                if ( //client !== socket &&                 // don’t send to sender
                    clientRoom === roomId &&            // same room
                    client.readyState === WebSocket.OPEN) 
                    {
                    client.send(JSON.stringify({
                    type: "message",
                    payload: { message: msg },
      }));
    }
  }
}


        })
        
 

    socket.on("close", () => {
        const roomId = allSockets.get(socket);
        allSockets.delete(socket); // Clean up
        console.log(`User disconnected from room: ${roomId}`);
  }); // removing the socket which gets dissconnected   
 
}) 

  }
  catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
}

StartServer();
