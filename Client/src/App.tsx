import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Pages/Home';
import Join from './Pages/Join';
import Room from './Pages/Room';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  UnsafeBurnerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import Navbar from './Components/Navbar';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/room', element: <Join /> },
  { path: '/room/:id', element: <Room /> }
]);

const App = () => {
  const network = WalletAdapterNetwork.Devnet;  // Set the network

  // Get the Solana RPC URL based on the network
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // List of wallets
  const wallets: Adapter[] = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new UnsafeBurnerWalletAdapter(), // Use only for development purposes
    ],
    [] // Dependency array to prevent unnecessary re-renders
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Navbar  /> {/* Pass props */}
          <RouterProvider router={router} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
