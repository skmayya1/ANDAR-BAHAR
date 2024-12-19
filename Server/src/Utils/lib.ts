import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type RoomMemberData = {
    userId: string;
    solAddress: string;
    roomCode: string;
};

export const createAndUpdateRoom = async (data: RoomMemberData) => {
    console.log("Creating Room with Data:", data);
    try {
        const user = await prisma.user.findUnique({
            where: {
                solAddress: data.solAddress
            }
        })
        const room = await prisma.room.findUnique({
            where: {
                code: data.roomCode
            }
        })
        if (!room) { 
            
        }
        
    } catch (error) {
        console.log(error);    
    }
};
