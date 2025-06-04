import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port : 8080})

const allSockets=new Map <WebSocket,string>();


wss.on("connection", (socket)=>{
    console.log("user connected ")
  


    socket.on("message",(message)=>{
         const parsedMessage = JSON.parse(message.toString());
         if(parsedMessage.type==="join"){
            allSockets.set(socket,parsedMessage.payload.roomId)
            console.log(parsedMessage.payload.roomId)
              //console.log("Raw message received:", message.toString()); // ✅ Add this



         }

      if (parsedMessage.type === "message") {  
                    console.log(parsedMessage.payload.message)
 
             const roomId = allSockets.get(socket);
            if (!roomId) return;



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
        
 

    socket.on("disconnect",()=>{
    }) // removing the socket which gets dissconnected   
 
}) 