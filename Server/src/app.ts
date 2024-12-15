import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import { createAndUpdateRoom } from './Utils/lib';



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

//SOCKET CONNECTION EMITS :
/*
  user-joined : When a user Joins a Room.

   
*/

//SOCKET CONNECTION ON :
/*
  join-room : JOIN A ROOM.

   
*/