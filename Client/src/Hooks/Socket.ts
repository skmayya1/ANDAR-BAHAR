import { useContext } from "react";
import SocketContext, { SocketContexts } from "../Context/Socketcontext";

export const useSocket = (): SocketContexts => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};