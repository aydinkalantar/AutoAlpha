"use client";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, arbitrum, polygon, optimism, base, sepolia } from 'wagmi/chains';
import { ReactNode } from 'react';

const queryClient = new QueryClient();

// In production, we should place this in an environment variable `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
// 8a33fa3fc40d3a5a4c9c19b0de7d8df9 is a known functional default for local dev.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8a33fa3fc40d3a5a4c9c19b0de7d8df9';

const metadata = {
  name: 'AutoAlpha',
  description: 'AutoAlpha Institutional Crypto Copy-Trading',
  url: 'https://autoalpha.ai',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [mainnet, arbitrum, polygon, optimism, base, sepolia] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
});

if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    enableAnalytics: false,
  });
}

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
