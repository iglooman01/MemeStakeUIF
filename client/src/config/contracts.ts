// Smart Contract Configuration
// Contract addresses and ABIs for MemeStake platform

export const CONTRACTS = {
  // Token Contract
  MEMES_TOKEN: {
    address: '0xBaF3c31BfA0ee3990A43b5cD4C0D4C7E0cFE5AcF',
    abi: [
      { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" },
      { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" },
      { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" },
      { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }
    ]
  },

  // Presale Contract
  MEMES_PRESALE: {
    address: '0x4534a6d5bF5834fa890DD1650CFB354699a07083',
    abi: [
      { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "_tokenPrice", "type": "uint256" }, { "internalType": "bool", "name": "_isOldToken", "type": "bool" } ], "name": "addToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "tokenToPay", "type": "address" }, { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }, { "internalType": "address", "name": "_referrer", "type": "address" } ], "name": "buy", "outputs": [], "stateMutability": "payable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "_memesToken", "type": "address" }, { "internalType": "address[]", "name": "acceptedTokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "tokenPrices", "type": "uint256[]" }, { "internalType": "bool[]", "name": "isOldToken", "type": "bool[]" }, { "internalType": "address", "name": "_paymentReceiver", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "blackListed", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "value", "type": "bool" } ], "name": "Blacklist", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "tokenAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenPurchased", "type": "uint256" } ], "name": "Buy", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" } ], "name": "OwnershipTransferRequested", "type": "event" },
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" },
      { "inputs": [ { "internalType": "address", "name": "tokenAddress", "type": "address" } ], "name": "removeToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "_blackListedUser", "type": "address" }, { "internalType": "bool", "name": "value", "type": "bool" } ], "name": "setBlacklist", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "_paymentReceiver", "type": "address" } ], "name": "setPaymentReceiver", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "to", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "_tokenPrice", "type": "uint256" } ], "name": "updateTokenPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "_token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "withdrawToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "acceptedTokens", "outputs": [ { "internalType": "bool", "name": "isAccepted", "type": "bool" }, { "internalType": "uint256", "name": "tokenPrice", "type": "uint256" }, { "internalType": "bool", "name": "isOldToken", "type": "bool" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "blacklist", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "memesToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "paymentReceiver", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }
    ]
  }
};

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: '0x38', // BSC Mainnet (56 in hex)
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/']
};
