import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type RoomMemberData = {
    userId: string;
    roomCode: string;
};

export const createAndUpdateRoom = async ( data: RoomMemberData) => {
    try {
        // Upsert Room and connect or create RoomMember
        const room = await prisma.room.upsert({
            where: {
                code: data.roomCode
            },
            create: {
                code: data.roomCode,
                members: {
                    create: {
                        userId: data.userId
                    }
                }
            },
            update: {
                members: {
                    connectOrCreate: {
                        where: {
                            userId_roomId: {
                                userId: data.userId,
                                roomId: undefined // this will be resolved dynamically
                            }
                        },
                        create: {
                            userId: data.userId
                        }
                    }
                }
            }
        });

        return room;
    } catch (error) {
        console.error('Error creating/updating room:', error);
        throw new Error('Failed to create or update room');
    }
};
