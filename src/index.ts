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
    const history = new Map<string, string[]>();

    wss.on("connection", (socket)=>{
    console.log("user connected ")
  


    socket.on("message",(message)=>{
         const parsedMessage = JSON.parse(message.toString());
         if(parsedMessage.type==="join"){
              const roomId = parsedMessage.payload.roomId;

            allSockets.set(socket,roomId)
            console.log(roomId)
            console.log(`User connected room: ${roomId}`);

            
            const msgs = history.get(roomId) || [];

              socket.send(
                    JSON.stringify({
                         type: "history",
                         payload: msgs,
                                    })
                        )


         }

      if (parsedMessage.type === "message") {  
                    console.log(parsedMessage.payload.message)
 
             const roomId = allSockets.get(socket);
            if (!roomId) return;

            const msgs = history.get(roomId) || [];
            msgs.push(parsedMessage.payload.message);
            history.set(roomId, msgs);





  // Broadcast to others in the same room
            for (const [client, clientRoom] of allSockets) {
                if ( //client !== socket &&                 // don’t send to sender
                    clientRoom === roomId &&            // same room
                    client.readyState === WebSocket.OPEN) 
                    {
                    client.send(JSON.stringify({
                    type: "message",
                    payload: parsedMessage.payload,   // send message payload directly
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
