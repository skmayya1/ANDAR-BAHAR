import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import { createAndUpdateRoom } from './Utils/lib';
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

    //JOIN ROOM
    socket.on("join-room", async (data) => {
        const room = await createAndUpdateRoom(data);
        socket.join(data.roomCode);
        socket.to(data.roomCode).emit("user-joined", socket.id);
        console.log("A user joined room", data.roomCode);
    });
  socket.on("signin", async (data) => { 
    const { solAddress } = data;
    console.log(solAddress);
    
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