// BSC Testnet Configuration for wallet connections (for testing)
export const BSC_NETWORK = {
  chainId: '0x61', // 97 in decimal (BSC Testnet)
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'tBNB', 
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
}

// Wallet connection interface
declare global {
  interface Window {
    ethereum?: any;
    trustWallet?: any;
    safePal?: any;
  }
}

export interface WalletInfo {
  name: string;
  icon: string;
  connector: string;
}

export const supportedWallets: WalletInfo[] = [
  {
    name: 'MetaMask',
    icon: '🦊',
    connector: 'metamask'
  },
  {
    name: 'Trust Wallet', 
    icon: '🛡️',
    connector: 'trust'
  },
  {
    name: 'SafePal',
    icon: '🔒', 
    connector: 'safepal'
  }
]

// Wallet connection functions
export const connectWallet = async (walletType: string): Promise<{ success: boolean; address?: string; error?: string }> => {
  try {
    let ethereum = window.ethereum;
    
    // Handle different wallet types
    switch (walletType.toLowerCase()) {
      case 'metamask':
        if (!window.ethereum) {
          return { success: false, error: 'MetaMask not installed' };
        }
        ethereum = window.ethereum;
        break;
        
      case 'trust':
        if (window.trustWallet) {
          ethereum = window.trustWallet;
        } else if (window.ethereum?.isTrust) {
          ethereum = window.ethereum;
        } else {
          return { success: false, error: 'Trust Wallet not found' };
        }
        break;
        
      case 'safepal':
        if (window.safePal) {
          ethereum = window.safePal;
        } else if (window.ethereum?.isSafePal) {
          ethereum = window.ethereum;
        } else {
          return { success: false, error: 'SafePal Wallet not found' };
        }
        break;
        
      default:
        if (!window.ethereum) {
          return { success: false, error: 'No wallet found' };
        }
        ethereum = window.ethereum;
    }

    // Request account access
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      return { success: false, error: 'No accounts found' };
    }

    // Check current network first
    let currentChainId;
    try {
      currentChainId = await ethereum.request({ method: 'eth_chainId' });
    } catch (error) {
      currentChainId = null;
    }

    // Only switch network if not already on BSC Testnet
    if (currentChainId !== BSC_NETWORK.chainId) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_NETWORK.chainId }],
        });
      } catch (switchError: any) {
        // If the chain hasn't been added to the wallet, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_NETWORK],
          });
        } else {
          // User rejected the request or other error - continue anyway
          console.warn('Network switch error:', switchError);
        }
      }
    }

    return { success: true, address: accounts[0] };
    
  } catch (error: any) {
    console.error('Wallet connection error:', error);
    return { success: false, error: error.message || 'Failed to connect wallet' };
  }
}

export const disconnectWallet = () => {
  // Clear any stored wallet data
  localStorage.removeItem('walletConnected');
  localStorage.removeItem('walletAddress');
  localStorage.removeItem('walletType');
}