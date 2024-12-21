import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import { createAndUpdateRoom, getRoomdetails, getRoomMembers, leaveRoom } from './Utils/lib';
import Prisma from './Utils/Prisma';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const port = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });

  socket.on("join-room", async (data) => {
    try {
      console.log("Joining Room Request Received:", data);

      const { roomCode = '', solAddress = '', Name = 'Guest' } = data;

      if (!roomCode) {
        console.error("Room code is missing in join-room.");
        return;
      }

      const room = await createAndUpdateRoom(data);
      if (!room) {
        console.error("Failed to create or update room.");
        return;
      }

      const Roomdata = await getRoomdetails(roomCode);
      console.log("Room Data Fetched Successfully:", Roomdata);

      socket.join(roomCode);
      console.log(`User ${Name} joined room: ${roomCode}`);

      socket.to(roomCode).emit("user-joined", { Message: `${Name} joined the room` });
      io.to(roomCode).emit("get-room-data", Roomdata);

    } catch (error) {
      console.error("Error in join-room:", error);
    }
  });

  socket.on("signin", async (data) => {
    const { solAddress } = data;
    console.log("Signin Request Received:", solAddress);

    try {
      const user = await Prisma.user.findUnique({ where: { solAddress } });
      const Message = user ? "Login Successful" : "User Signup Successful";
      const status = user ? 200 : 201;

      if (!user) {
        await Prisma.user.create({ data: { solAddress } });
      }

      socket.emit("signin", { Message, status });

    } catch (error) {
      console.error("Error in signin:", error);
      socket.emit("error", { Message: "Signin Failed", status: 500 });
    }
  });

  socket.on("leave-room", async (data) => {
    try {
      console.log("Leave Room Request Received:", data);

      const { roomCode = '', solAddress = '', Name = 'Guest' } = data;

      if (!roomCode) {
        console.error("Room code is missing in leave-room.");
        return;
      }

      const user = await leaveRoom(data);
      if (!user) {
        console.error("Failed to remove user from room.");
        return;
      }

      console.log(`User ${Name} left room: ${roomCode}`);
      socket.leave(roomCode);

      socket.to(roomCode).emit("leave-room", { Message: `${Name} has left the room` });
      const Roomdata = await getRoomdetails(roomCode);

      io.to(roomCode).emit("get-room-data", Roomdata);

    } catch (error) {
      console.error("Error in leave-room:", error);
    }
  });

  socket.on("get-room-data", async (data) => {
    try {
      console.log("Get Room Data Request Received:", data);

      const Roomdata = await getRoomdetails(data.roomCode);
      console.log("Room Data Sent:", Roomdata);

      socket.emit("get-room-data", Roomdata);

    } catch (error) {
      console.error("Error in get-room-data:", error);
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
