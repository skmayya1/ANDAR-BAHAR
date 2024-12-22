import React, { createContext, useState, useEffect, ReactNode, ReactElement } from 'react';
import { Bounce, toast } from 'react-toastify';
import io, { Socket } from 'socket.io-client';

interface SocketProviderProps {
    children?: ReactNode;
}

export interface SocketContexts {
    socket: Socket | null;
    Signinhandler: (data: { solAddress: string | undefined }) => void;
    CreateRoom: (data: { Name: string, roomCode: string, solAddress: string | undefined }) => void;
    LeaveRoom: (data: { Name: string, roomCode: string, solAddress: string | undefined }) => void;
    Data: Datatype[] | null;
    GetRoomData: (data: { roomCode: string }) => void;
    RoomData: RoomData | null;
    CardData: CardsData | undefined;
    Ready: boolean;
    setReady: React.Dispatch<React.SetStateAction<boolean>>;
    MagicCard: (data: { roomCode: string | undefined }) => void;
    PlaceBet: (data: { roomCode: string | undefined, solAddress: string | undefined, betQty: number | undefined, bettedOn: number | undefined,}) => void;}

interface Datatype {
    name: string;
    roomId: string;
    user: User;
    wins: number,
    betQty: string,
    bettedOn: string,
}

interface User {
    id: string;
    solAddress: string;
}

interface RoomData {
    members: RoomMember[];
    rounds: number;
    currentMagicCard: string,
    currentRound: number,
    pool: number,
    RoundStarted: boolean

}

interface RoomMember {
    id: string;
    name: string;
    roomId: string;
    userId: string;
    wins: number,
    betQty: number | null,
    bettedOn: number | null,
}
interface CardsData {
    CurrCard: string;
}


const SocketContext = createContext<SocketContexts | undefined>(undefined);

export const SocketProvider = ({ children }: SocketProviderProps): ReactElement => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [Data, setData] = useState<Datatype[] | null>(null);
    const [RoomData, setRoomData] = useState<RoomData | null>(null);
    const [CardData, setCardData] = useState<CardsData>()
    const [Ready, setReady] = useState<boolean>(false)
    const Signinhandler = async (data: { solAddress: string | undefined }) => {
        socket?.emit("signin", { solAddress: data.solAddress });
    };

    const CreateRoom = async (data: { Name: string, roomCode: string, solAddress: string | undefined }) => {
        socket?.emit("join-room", data);
    };

    const LeaveRoom = async (data: { Name: string, roomCode: string, solAddress: string | undefined }) => {
        socket?.emit("leave-room", data);
    };

    const GetRoomData = async (data: { roomCode: string }) => {
        socket?.emit("get-room-data", data);
    };
    const MagicCard = async (data: { roomCode: string | undefined }) => { 
        socket?.emit("select-magic-card", data);
    }
    const PlaceBet = async (data: {
        roomCode: string | undefined,
        solAddress: string | undefined,
        betQty: number | undefined,
        bettedOn: number | undefined,
    }) => {
        console.log(data);
        socket?.emit("place-bet", data);
    }

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            reconnection: true, // Enable auto-reconnection
            reconnectionAttempts: Infinity, // Retry indefinitely
            reconnectionDelay: 1000, // Delay before retry
            reconnectionDelayMax: 5000, // Max delay between retries
        });
        setSocket(newSocket);

        newSocket.on("signin", (data) => {
            toast.success(data.Message, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        });

        newSocket.on("error", (error) => {
            toast.error(error, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        });

        newSocket.on("user-joined", (data) => {
            toast.success(data.Message, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        });

        newSocket.on("room-created", () => {
            toast.success("Room Created", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        });

        newSocket.on("room-members", (members) => {
            setData(members);
        });

        newSocket.on("leave-room", (data) => {
            toast.error(data.Message, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        });
        newSocket.on("card-data", (data) => { 
            setCardData(data);
        });
        newSocket.on("get-room-data", (data) => {
            console.log(data);
            setRoomData(data);
        });
        newSocket.on('disconnect', (reason) => {
            console.log(`Disconnected: ${reason}`);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, Signinhandler, CreateRoom, LeaveRoom, Data, GetRoomData, RoomData, CardData ,Ready ,setReady ,MagicCard ,PlaceBet}}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
