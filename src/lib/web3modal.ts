import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { mainnet, base } from 'wagmi/chains';

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '5261912a5c184ed019675c830f491d1a';

// 2. Create wagmiConfig
const metadata = {
  name: 'Inteliose',
  description: 'Inteliose App',
  url: 'https://inteliose.com',
  icons: ['https://inteliose.com/favicon.ico']
};

const chains = [mainnet, base];
export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });
