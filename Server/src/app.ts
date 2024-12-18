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
});

httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
app.post('/signin', async (req, res) => {
  const { solAddress } = req.body;
  try {
    const user = await Prisma.user.findUnique({
      where: {
        solAddress
      }
    });
    if (user) res.send({ message: "User Exists , Login Succesfull", status: 200 });
    const newUser = await Prisma.user.create({
      data: {
        solAddress
      }
    })
    res.send({ message: "User Created", status: 200  });
  } catch (error) {
    res.status(400).send({ message: error.message });
    console.log(error);
  }
})
//SOCKET CONNECTION EMITS :
/*
  user-joined : When a user Joins a Room.

   
*/

//SOCKET CONNECTION ON :
/*
  join-room : JOIN A ROOM.

   
*/