import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import {  createAndUpdateRoom, getRoomdetails, getRoomMembers, leaveRoom, placeBet, selectRandomCard } from './Utils/lib';
import Prisma from './Utils/Prisma';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
  pingTimeout: 60000,  // Set the timeout duration in milliseconds
  pingInterval: 25000  // Set the interval at which pings are sent to keep the connection alive
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
      const startRound = await placeBet(data);
      if (startRound) {
        console.log("Round Started");
        io.to(roomCode).emit("round-started", { Message: "Round Started",roomCode:roomCode });
      }

      const Roomdata = await getRoomdetails(roomCode);
      console.log("Room Data Fetched Successfully:", Roomdata);

      // Emit updated room data to clients in the room
      io.to(roomCode).emit("get-room-data", Roomdata);

      // Send acknowledgment to the client who placed the bet
    } catch (error) {
      console.error("Error in place-bet:", error);
    }
  });
  let winners = [];
  socket.on("start-round", async (data) => {
    console.log("Starting cards distribution", data);
    const cards = [
      "2D", "2S", "2H", "2C",
      "3D", "3S", "3H", "3C",
      "4D", "4S", "4H", "4C",
      "5D", "5S", "5H", "5C",
      "6D", "6S", "6H", "6C",
      "7D", "7S", "7H", "7C",
      "8D", "8S", "8H", "8C",
      "9D", "9S", "9H", "9C",
      "JD", "JS", "JH", "JC",
      "QD", "QS", "QH", "QC",
      "KD", "KS", "KH", "KC",
      "AD", "AS", "AH", "AC",
    ];

    const room = await Prisma.room.findUnique({
      where: { code: data.roomCode },
      select: {
        currentMagicCard: true,
        pool: true,
        members: true,
        id: true,
      },
    });

    if (!room) {
      socket.emit("error", { message: "Room not found." });
      return;
    }

    socket.emit("round-start", { message: "Round Started", magicCard: room.currentMagicCard });
    
    let isZero = true; // Start with 0
    const members = await Prisma.room.findUnique({
      where: { code: data.roomCode },
      select: {
        members: {
          select: {
            bettedOn: true,
            betQty: true,
            name: true,
          },
        },
      },
    });

    let intervalId = setInterval(async () => {
      if (cards.length === 0) {
        clearInterval(intervalId); // Stop the interval when the deck is empty
        socket.emit("round-ended", { message: "Round has ended. All cards distributed." });
        return;
      }

      const randomIndex = Math.floor(Math.random() * cards.length);
      const card = cards[randomIndex];
      cards.splice(randomIndex, 1); // Remove the card from the deck

      const currentNumber = isZero ? 1 : 0;
      isZero = !isZero; // Toggle between 0 and 1

      if (room.currentMagicCard[0] === card[0]) {  // Corrected comparison to check the first character
        for (const member of members.members) {  // Use for...of for synchronous behavior
          if (member.bettedOn === currentNumber) {
            winners.push(member);
            console.log("Member won:", member);
          }
        }

        if (winners.length > 0) {
          const amount = room.pool / winners.length;

          // Stop the interval when winners are found
          clearInterval(intervalId);

          await Prisma.roomMember.updateMany({
            where: {
              roomId: room.id,
              name: { in: winners.map((winner) => winner.name) },
            },
            data: {
              wins: {
                increment: amount,
              },
            },
          });
         const newCard = await selectRandomCard();
          await Prisma.room.update({
            where: { code: data.roomCode },
            data: {
              currentMagicCard: newCard,
              rounds: {
                increment: 1,
              },
              RoundStarted: false,
              members: {
                updateMany: {
                  where: {
                    roomId: room.id
                  },
                  data: {
                    betQty: 0,
                    bettedOn: null
                  }
                }
              }
            }
          });

          io.to(data.roomCode).emit("round-ended", {
            message: "Round ended. Winners: " + winners.map(winner => winner.name).join(", "),
            winners: winners,
            card,
            number: currentNumber,
            amountWon: amount,
            roomCode: data.roomCode,
          });
        }
      }
      console.log(winners.length);
        io.to(data.roomCode).emit("card-distribution", { card, number: currentNumber,winner:winners });
    }, 2000);
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

//Card select Magic card and Distribution
//Place a bet
//Evveryoine betted start the round