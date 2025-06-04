Notes to myself 

The logic I have used to map socket to roomId , in that if the user sends a room id again then , the prev roomId gets over ridden . Not a issue , ✅ This is okay if room switching is allowed
If your app design allows users to leave one room and join another, then this behavior is correct and expected.

But if you want to prevent users from switching rooms (or only allow it under certain conditions), you should check before updating:


if (!allSockets.has(socket)) {
  allSockets.set(socket, parsedMessage.payload.roomId);
} else {
  console.log("User already joined a room. Ignoring re-join.");
}



Or allow it, but log the switch:


const prevRoom = allSockets.get(socket);
allSockets.set(socket, parsedMessage.payload.roomId);
console.log(`User moved from room ${prevRoom} to ${parsedMessage.payload.roomId
