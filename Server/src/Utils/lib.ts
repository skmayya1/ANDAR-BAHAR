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
                        roomId: true,
                        wins: true,
                        betQty: true,
                        bettedOn: true,
                    }
                }
            }
        });
        if (!room.members) {
            return [];
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

export const getRoomdetails = async (roomcode: string) => { 
    try {
        const room = await Prisma.room.findUnique({
            where: {
                code: roomcode
            },
            select: {
                members: true,
                rounds: true,
                currentMagicCard: true,
                currentRound: true,
                pool: true,
                RoundStarted:true
        }
        });
        return room;
    } catch (error) {
        console.error('Error in getRoomdetails:', error);
        return undefined;
    }
}
export function selectRandomCard():string {
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
        "AD", "AS", "AH", "AC"
    ];
    const randomIndex = Math.floor(Math.random() * cards.length);
    return cards[randomIndex];
}

export const placeBet = async (data: { roomCode: string, solAddress: string, betQty: number, bettedOn: number }) => {
    try {
        // Find user by Solana address
        console.log(data);
        
        const user = await Prisma.user.findUnique({ where: { solAddress: data.solAddress } });
        if (!user) {
            throw new Error('User not found');
        }

        // Find room by code, select members' bets and round status
        const room = await Prisma.room.findUnique({
            where: { code: data.roomCode }, select: {
                members: {
                    select: {
                        bettedOn: true
                    }
                },
                RoundStarted: true,
                id: true,
            }
        });
        if (!room) {
            throw new Error('Room not found');
        }

        // Find the member in the room
        const roomMember = await Prisma.roomMember.findUnique({
            where: {
                userId_roomId: {
                    userId: user.id,
                    roomId: room.id,
                }
            }
        });
        if (!roomMember) {
            throw new Error('Room member not found');
        }

        // Update the member's bet in the room
        await Prisma.roomMember.update({
            where: {
                userId_roomId: {
                    userId: user.id,
                    roomId: room.id,
                }
            },
            data: {
                betQty: data.betQty,
                bettedOn: data.bettedOn
            }
        });

        // Check if round should start (Round not started and no null bets among members)
        if (!room.RoundStarted && !room.members.some(member => member.bettedOn === null)) {
            await StartRound({ roomCode: data.roomCode });
        }

        return { message: 'Bet placed successfully.' };
    } catch (error) {
        console.error(error);
        return { message: 'An error occurred while placing the bet.' };
    }
}

const StartRound = async (data: { roomCode: string }) => {
    try {
        console.log("Starting Round with Data:", data);
        // Your logic to start the round
    } catch (error) {
        console.error(error);
    }
}
