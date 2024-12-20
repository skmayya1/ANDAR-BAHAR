import { PrismaClient } from '@prisma/client';
import Prisma from './Prisma';

type RoomMemberData = {
    userId: string;
    solAddress: string;
    roomCode: string;
};

export const createAndUpdateRoom = async (data: RoomMemberData) => {
    console.log("Creating Room with Data:", data);
    try {
        const user = await Prisma.user.findUnique({
            where: {
                solAddress: data.solAddress
            }
        })
        const room = await Prisma.room.findUnique({
            where: {
                code: data.roomCode
            }
        })
        console.log(room, user);
        let Message:string;
        if (!room) {
            const newRoom = await Prisma.room.create({
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
            const roomMember = await Prisma.roomMember.findUnique({
                where: {
                    userId_roomId: {
                        userId: user.id,
                        roomId: room.id
                    }
                }
            })
            if (!roomMember) {
                const updateRoom = await Prisma.room.update({
                    where: {
                        code: data.roomCode
                    },
                    data: {
                        members: {
                            create: {
                                userId: user.id
                            }
                        }
                    }
                })
            }
            Message="Room Joined succesfully"
        }
        return Message  
    } catch (error) {
        console.log(error);    
    }
};

export const leaveRoom = async (data: RoomMemberData) => {
    try {
        const user = await Prisma.user.findUnique({ where: { solAddress: data.solAddress } });
        if (!user) {
            throw new Error('User not found');
        }

        const room = await Prisma.room.findUnique({ where: { code: data.roomCode } });
        if (!room) {
            throw new Error('Room not found');
        }

        const roomMember = await Prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    userId: user.id,
                    roomId: room.id
                }
            }
        });

        if (!roomMember) {
            return { message: 'User is not a member of this room.' };
        }

        await Prisma.roomMember.delete({
            where: {
                userId_roomId: {
                    userId: user.id,
                    roomId: room.id
                }
            }
        });

        return { message: 'Left the room successfully.' };
    } catch (error) {
        console.error('Error in leaveRoom:', error);
        return { error: 'An error occurred while leaving the room.' };
    }
};

