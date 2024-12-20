import Prisma from './Prisma';

type RoomMemberData = {
    userId: string;
    solAddress: string;
    roomCode: string;
    Name: string;
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
                            userId: user.id,
                            name: data.Name
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
                        roomId: room.id,
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
                                userId: user.id,
                                name: data.Name
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
        console.log("Leaving Room with Data:", data);
        
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
        await deleteRoomIfNoMembers(room.id);
        return { message: roomMember.name + ' left the room.' };
    } catch (error) {
        console.error('Error in leaveRoom:', error);
        return { error: 'An error occurred while leaving the room.' };
    }
};
export const getRoomMembers = async (roomCode: string) => { 
    try {
        const room = await Prisma.room.findUnique({
            where: {
                code: roomCode
            },
            include: {
                members: {
                    select: {
                        user: true,
                        name: true,
                        roomId: true
                    }
                }
            }
        });
        if (!room) {
            throw new Error('Room not found');
        }
        return room.members;
    } catch (error) {
        console.error('Error in getRoomMembers:', error);
        return [];
    }
}

async function deleteRoomIfNoMembers(roomId:string) {
    try {
        const room = await Prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            console.log(`Room with id ${roomId} does not exist.`);
            return;
        }

        // Count the number of members in the room
        const memberCount = await Prisma.roomMember.count({
            where: { roomId },
        });

        // If no members are found, delete the room
        if (memberCount === 0) {
            await Prisma.room.delete({
                where: { id: roomId },
            });
            console.log(`Room with id ${roomId} has been deleted because it had no members.`);
        } else {
            console.log(`Room with id ${roomId} still has ${memberCount} member(s), so it was not deleted.`);
        }
    } catch (error) {
        console.error('Error deleting room:', error);
    } finally {
        await Prisma.$disconnect();
    }
}

// Call the function
deleteRoomIfNoMembers('cm4vhl9510003piz4bnyjv05l'); // Replace this with the actual room ID
