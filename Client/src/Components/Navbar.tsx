import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PiSignOutFill } from "react-icons/pi";
import LoadingSpinner from './LoadingSpinner';
import { useEffect, useState } from 'react';

const Navbar = () => {
    const { connect, connected, connecting, disconnect, disconnecting, wallets, select, publicKey } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState<string | null>(null);

    useEffect(() => {
        wallets.forEach((wallet) => console.log(wallet.adapter));
    }, [wallets]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (publicKey) {
                const balance = await connection.getBalance(publicKey);
                setBalance((balance / LAMPORTS_PER_SOL).toFixed(2));
            }
        };
        fetchBalance();
    }, [publicKey, connection]);

    const handleConnect = async () => {
        try {
            const walletName = wallets[0]?.adapter.name;
            if (!walletName) return console.error('No wallet found');
            select(walletName);
            await connect();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
            setBalance(null); // Clear balance after disconnect
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    };

    return (
        <div className="absolute flex items-center w-full justify-end px-20 py-6 gap-2">
            {connected && (
                <div className="h-10 w-fit px-5 border border-zinc-700 rounded-lg text-zinc-400 font-semibold font-mono flex items-center justify-center text-sm">
                    <p>{balance} SOL</p>
                </div>
            )}
            <div className="h-10 w-40 p-2 border border-zinc-700 text-zinc-300 rounded-lg text-center">
                {connecting ? (
                    <LoadingSpinner  />
                ) : !connected ? (
                    <button className='' onClick={handleConnect} disabled={connecting}>
                        Connect Wallet
                    </button>
                ) : (
                    <button className='text-sm text-purple-500 font-medium font-mono'>
                        {publicKey?.toBase58().substring(0, 10) + '...'}
                    </button>
                )}
            </div>
            {connected && (
                <button
                    className="bg-zinc-800 p-3 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-all duration-300 ease-in-out"
                    onClick={handleDisconnect}
                >
                    {disconnecting ? <LoadingSpinner /> : <PiSignOutFill />}
                </button>
            )}
        </div>
    );
};

export default Navbar;
