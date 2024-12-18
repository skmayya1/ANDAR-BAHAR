import { useConnection } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PiSignOutFill } from "react-icons/pi";
import {  useState } from 'react';
const Navbar = () => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const selectedWallet = new PhantomWalletAdapter();
    const [isConnected, setIsConnected] = useState(false);
    const [Balance, setBalance] = useState(0.00)
    const { connection} = useConnection();
    if (!connection) console.log("dvsgdsg");
    console.log(connection);
    
    
    const handleConnect = async () => {
        if (!selectedWallet) {
            alert('Please select a wallet.');
            return;
        }

        try {
            await selectedWallet.connect();
            if (selectedWallet.publicKey) {
                setWalletAddress(selectedWallet.publicKey?.toBase58() || null);
                const balance = await connection.getBalance(selectedWallet.publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
                setIsConnected(true);
             }

        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    };

    const handleDisconnect = async () => {
        if (selectedWallet) {
            await selectedWallet.disconnect();
            setWalletAddress(null);
            setIsConnected(false);
        }
    };

    return (
        <div className="absolute flex items-center w-full justify-end px-20 py-6 gap-2">
            {isConnected &&
                <div className="h-10 w-fit px-5 border border-zinc-700 rounded-lg text-zinc-400  font-semibold font-mono flex items-center justify-center text-sm ">
                    <p>{(Balance)}</p>
                </div>
            }
            <div className="h-10 w-40 p-2 border border-zinc-700 text-zinc-300 rounded-lg ">
                {!isConnected ? (
                        <button
                            className="w-full h-full font-semibold text-sm flex items-center justify-center text-zinc-200 rounded-lg "
                            onClick={handleConnect}
                        >
                            Connect Wallet
                        </button>
                ) : (
                        <div className='flex  items-center justify-center'>
                            <button
                                className='text-sm text-purple-500 font-medium font-mono'>
                                {walletAddress?.substring(0, 15)}...
                            </button>
                        </div>
                        
                )}
                
            </div>
            {isConnected &&
                <button
                    className=" bg-zinc-800  p-3  text-zinc-200 rounded-lg hover:bg-zinc-700 transition-all duration-300 ease-in-out"
                    onClick={handleDisconnect}
                >
                    <PiSignOutFill />
                </button>
            }
        </div>
    );
};

export default Navbar;
