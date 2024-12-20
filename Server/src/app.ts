import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import { createAndUpdateRoom, getRoomdetails, getRoomMembers, leaveRoom } from './Utils/lib';
import Prisma from './Utils/Prisma';
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const port =process.env.PORT || 3000;

io.on("connection", (socket) => {
    //INITIAL
    console.log("A user connected",socket.id);
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

  socket.on("join-room", async (data) => {
    try {
      console.log("Joining Room", data);

      // Destructure with default values
      const { roomCode = '', solAddress = '', Name = 'Guest' } = data;

      // Check if required data is present
      if (!roomCode) {
        console.error("Room code is required to join the room.");
        return;
      }

      // Create or update the room
      const room = await createAndUpdateRoom(data);
      if (!room) {
        console.error("Failed to create or update room.");
        return;
      }

      // Get the updated list of members in the room
      const members = await getRoomMembers(roomCode);
      if (!members) {
        console.error("Failed to fetch room members.");
        return;
      }

      // Join the socket room
      socket.join(roomCode);
      console.log("A user joined room", roomCode);

      // Notify others in the room
      socket.to(roomCode).emit("user-joined", {
        Message: `${Name} joined the room`,
      });

      // Send the updated members list to everyone in the room
      io.to(roomCode).emit("room-members", members);

    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  socket.on("signin", async (data) => { 
    const { solAddress } = data;
    console.log(solAddress);
    console.log(data);
    
    try {
      const user = await Prisma.user.findUnique({
        where: {
          solAddress
        }
      });
      let Message: string;
      let status : number;
      if (user) {
        Message = "Login Successfull";
        status = 200;
      } else {
        const newUser = await Prisma.user.create({
          data: {
            solAddress
          }
        })
        Message = "User Signup Successfull";
        status = 201;
      }
     socket.emit("signin", { Message, status });
    } catch (error) {
      socket.emit("error", {Message:"Error Occured",status:500});
      console.log(error);
    }
  });
  socket.on("leave-room", async (data) => {
    try {
      // Destructure with default values to prevent undefined access
      const { roomCode = '', solAddress = '', Name = 'Guest' } = data;

      // Check if required data is present
      if (!roomCode) {
        console.error("Room code is required to leave the room.");
        return;
      }

      // Remove user from the room
      const user = await leaveRoom(data);
      if (!user) {
        console.error("Failed to remove user from the room.");
        return;
      }

      console.log(`${Name} has left the room: ${roomCode}`);

      // Leave the socket room
      socket.leave(roomCode);

      // Notify other users in the room about the user who left
      socket.to(roomCode).emit("leave-room", {
        Message: `${Name} has left the room`,
        user,
      });
      
      // Get the updated list of members in the room
      const members = await getRoomMembers(roomCode);
      if (!members) {
        console.error("Failed to fetch room members.");
        return;
      }

      // Notify all users in the room about the updated members list
      io.to(roomCode).emit("room-members", members);

    } catch (error) {
      console.error("Error handling leave-room event:", error);
    }
  });
  socket.on("get-room-data", async (data) => {
    console.log("Getting Room Data", data);
    const Roomdata = await getRoomdetails(data.roomCode);
    console.log("Room",Roomdata);
    socket.emit("get-room-data",Roomdata);
  });

});

httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

//SOCKET CONNECTION EMITS :
/*
  user-joined : When a user Joins a Room.

   
*/

//SOCKET CONNECTION ON :
/*
  join-room : JOIN A ROOM.

   
*/