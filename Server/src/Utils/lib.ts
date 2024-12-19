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
        console.log(room, user);
        let Message:string;
        if (!room) {
            const newRoom = await prisma.room.create({
                data: {
                    code: data.roomCode,
                    members: {
                        create: {
                            userId: user.id
                        }
                    }
                }
            })
            Message="Room Created Successfull"
        } else { 
            const updateRoom = await prisma.room.update({
                where: {
                    code:data.roomCode
                },
                data: {
                    members: {
                        create: {
                            userId:user.id
                        }
                    }
                }
            })
            Message="Room Joined succesfully"
        }
        return Message
        
    } catch (error) {
        console.log(error);    
    }
};
