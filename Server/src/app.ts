import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import { createAndUpdateRoom, getRoomdetails, getRoomMembers, leaveRoom, placeBet, selectRandomCard } from './Utils/lib';
import Prisma from './Utils/Prisma';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins (adjust this for production)
  },
});
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
  socket.on("select-magic-card", async (data) => {
    const { roomCode } = data;
    console.log("Select Magic Card Request Received:", data);
    try {
      let MagicCard;
       MagicCard = await Prisma.room.findUnique({ where: { code: roomCode }, select: { currentMagicCard: true } });
      if (!MagicCard.currentMagicCard) {
        MagicCard = selectRandomCard();
        console.log("Magic Card Selected:", MagicCard);
        const room = await Prisma.room.update({ where: { code: roomCode }, data: { currentMagicCard: MagicCard } });
      }
      const Roomdata = await getRoomdetails(roomCode);
      console.log("Room Data Fetched Successfully:", Roomdata);
      io.to(roomCode).emit("get-room-data", Roomdata);
    } catch (error) {
      console.log(error);
      
    }
  })
  socket.on("place-bet", async (data, callback) => {
    try {
      // Extract data and ensure required fields are present
      const { roomCode = '', solAddress = '', betQty = 0, bettedOn = 0 } = data;

      // Check if roomCode and solAddress are provided
      if (!roomCode || !solAddress) {
        console.error("Room code or solAddress is missing in place-bet.");
        return;
      }

      // Validate betQty and bettedOn
      if (betQty < 1 || betQty > 999) {
        console.error("Bet quantity must be between 1 and 999.");
        return;
      }
      if (![0, 1].includes(bettedOn)) {
        console.error("Invalid bet option. Please choose between 0 (Andar) and 1 (Bahar).");
        return;
      }

      console.log("Place Bet Request Received:", data);

      // Place the bet
      await placeBet(data);

      const Roomdata = await getRoomdetails(roomCode);
      console.log("Room Data Fetched Successfully:", Roomdata);

      // Emit updated room data to clients in the room
      io.to(roomCode).emit("get-room-data", Roomdata);

      // Send acknowledgment to the client who placed the bet
    } catch (error) {
      console.error("Error in place-bet:", error);
    }
  });

});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//Card select Magic card and Distribution
//Place a bet
//Evveryoine betted start the round