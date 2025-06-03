import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port : 8080})

let allSockets:WebSocket[] = []


wss.on("connection", (socket)=>{
    console.log("user connected ")

    allSockets.push(socket)// we are keeping all the socket object instances here



socket.on("message",(message)=>{

allSockets.forEach(s => s.send(message.toString() + "sent through server "))// we are broadcasting the messages to all te sockets we have 

})    
 
})