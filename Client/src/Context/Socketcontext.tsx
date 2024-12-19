import { createContext, useState, useEffect, ReactNode, ReactElement } from 'react';
import { Bounce, toast } from 'react-toastify';
import io, { Socket } from 'socket.io-client';

interface SocketProviderProps {
    children?: ReactNode;
}

export interface SocketContexts {
    socket: Socket | null;
    Signinhandler: (data: { solAddress: string }) => void;
}

const SocketContext = createContext<SocketContexts | undefined>(undefined);

export const SocketProvider = ({ children }: SocketProviderProps): ReactElement => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const Signinhandler = async (data: { solAddress: string }) => {
        console.log(data.solAddress);
        socket?.emit("signin", { solAddress: data.solAddress });
    }

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);
        newSocket.on("signin", (data) => {
            console.log(data);
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
            console.log(error);
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
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, Signinhandler }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
