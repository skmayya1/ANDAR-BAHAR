import { createContext, useState, useEffect, ReactNode, ReactElement } from 'react';
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
}
 interface Datatype { 
    name: string;
    roomId: string
    user:User
    
}
interface User{
    id: string;
    solAddress: string;
}

const SocketContext = createContext<SocketContexts | undefined>(undefined);

export const SocketProvider = ({ children }: SocketProviderProps): ReactElement => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [Data, setData] = useState<Datatype[]|null>(null);
    const Signinhandler = async (data: { solAddress: string  | undefined}) => {
        socket?.emit("signin", { solAddress: data.solAddress });
    }
    const CreateRoom = async (data: { Name: string, roomCode: string, solAddress: string | undefined }) => { 
        socket?.emit("join-room", data);
    };
    const LeaveRoom = async (data: { Name: string, roomCode: string, solAddress: string | undefined }) => { 
        socket?.emit("leave-room", data);
    }

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
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
            toast.error(data.message, {
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
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, Signinhandler ,CreateRoom,LeaveRoom ,Data}}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
