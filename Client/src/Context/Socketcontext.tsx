import { createContext, useState, useEffect, ReactNode, ReactElement } from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketProviderProps {
    children?: ReactNode;
}

export interface SocketContexts {
    socket: Socket | null;
    msg: string;
}

const SocketContext = createContext<SocketContexts | undefined>(undefined); // Avoid null, prefer undefined for context
 



export const SocketProvider = ({ children }: SocketProviderProps): ReactElement => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [msg, setmsg] = useState("dnsjfbhds")

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);
        setmsg("socket Concected")
        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket ,msg}}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;

