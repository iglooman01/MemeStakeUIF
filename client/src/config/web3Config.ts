// BSC Network Configuration for wallet connections
export const BSC_NETWORK = {
  chainId: '0x38', // 56 in decimal  
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB', 
    decimals: 18,
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
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

    // Switch to BSC network
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
        throw switchError;
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