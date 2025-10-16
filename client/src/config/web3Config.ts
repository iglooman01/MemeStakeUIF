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
    // Wait for provider to be injected on mobile wallets (they need time to initialize)
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let ethereum = window.ethereum;
    
    // Check if window.ethereum exists after waiting
    if (!window.ethereum) {
      return { 
        success: false, 
        error: 'Please open this page in your wallet app browser (Trust Wallet, MetaMask, or SafePal mobile app)' 
      };
    }
    
    // Log wallet detection for debugging
    console.log('Detected wallet providers:', {
      hasEthereum: !!window.ethereum,
      isTronLink: window.ethereum?.isTronLink,
      isMetaMask: window.ethereum?.isMetaMask,
      isTrust: window.ethereum?.isTrust,
      providers: window.ethereum?.providers?.map((p: any) => ({
        isMetaMask: p.isMetaMask,
        isTronLink: p.isTronLink,
        isTrust: p.isTrust
      }))
    });
    
    // If only TronLink is detected, show error
    if (window.ethereum.isTronLink && !window.ethereum.providers) {
      return { success: false, error: 'TronLink is not compatible with BSC Testnet. Please install MetaMask, Trust Wallet, or SafePal extension.' };
    }
    
    // Handle different wallet types
    switch (walletType.toLowerCase()) {
      case 'metamask':
        // For MetaMask, check if there are multiple providers
        if (window.ethereum.providers && window.ethereum.providers.length > 0) {
          // Find MetaMask provider (exclude TronLink)
          const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask && !p.isTronLink);
          if (!metamaskProvider) {
            return { success: false, error: 'MetaMask not found. Please install MetaMask extension.' };
          }
          ethereum = metamaskProvider;
        } else if (window.ethereum.isMetaMask && !window.ethereum.isTronLink) {
          ethereum = window.ethereum;
        } else if (window.ethereum) {
          // On mobile, MetaMask might just inject as window.ethereum without isMetaMask flag
          ethereum = window.ethereum;
        } else {
          return { success: false, error: 'Please open this page in MetaMask mobile app browser' };
        }
        break;
        
      case 'trust':
        // Trust Wallet mobile detection - check multiple properties
        if (window.trustWallet) {
          ethereum = window.trustWallet;
        } else if (window.ethereum?.isTrust || window.ethereum?.isTrustWallet) {
          ethereum = window.ethereum;
        } else if (window.ethereum && !window.ethereum.isMetaMask) {
          // On mobile, Trust Wallet might just inject as window.ethereum
          ethereum = window.ethereum;
        } else {
          return { success: false, error: 'Please open this page in Trust Wallet mobile app browser' };
        }
        break;
        
      case 'safepal':
        // SafePal mobile detection
        if (window.safePal) {
          ethereum = window.safePal;
        } else if (window.ethereum?.isSafePal) {
          ethereum = window.ethereum;
        } else if ((window as any).safepalProvider) {
          ethereum = (window as any).safepalProvider;
        } else if (window.ethereum && !window.ethereum.isMetaMask) {
          // On mobile, SafePal might just inject as window.ethereum
          ethereum = window.ethereum;
        } else {
          return { success: false, error: 'Please open this page in SafePal mobile app browser' };
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