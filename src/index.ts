import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port : 8080})

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