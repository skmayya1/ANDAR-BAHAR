import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Pages/Home';
import Join from './Pages/Join';
import Room from './Pages/Room';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import {
  PhantomWalletAdapter,
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
  const network = WalletAdapterNetwork.Devnet;  

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets: Adapter[] = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    [] 
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Navbar  /> 
          <RouterProvider router={router} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
