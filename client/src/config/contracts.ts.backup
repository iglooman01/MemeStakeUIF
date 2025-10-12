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

  // USDT Token (BEP-20)
  USDT_TOKEN: {
    address: '0xa865e7988e121bac5c8eadb179a6cfe4e92f152e',
    abi: [
      { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" },
      { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }
    ]
  },

  // Staking Contract
  MEMES_STAKE: {
    address: '0x09EB3f7E23ae0c6987bFd1757cB814E6dC95dbFB',
    abi: [ { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "addRewardFund", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "claimRewards", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_memesTokenAddress", "type": "address" }, { "internalType": "address", "name": "_presale", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "stakeId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "returnedCapital", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "penaltyApplied", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "earlyWithdrawal", "type": "bool" } ], "name": "CapitalWithdrawn", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_to", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "staker", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256" } ], "name": "ReferralBonusDistributed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "stakeId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "RewardsClaimed", "type": "event" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" } ], "name": "stake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "stakeId", "type": "uint256" } ], "name": "withdrawCapital", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Unpaused", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "stakeId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256" } ], "name": "UserStaked", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ], "name": "getStakeIds", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "stakeId", "type": "uint256" } ], "name": "getStakeInfo", "outputs": [ { "components": [ { "internalType": "uint256", "name": "stakedAmount", "type": "uint256" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "lastClaimTime", "type": "uint256" }, { "internalType": "bool", "name": "capitalWithdrawn", "type": "bool" }, { "internalType": "uint256", "name": "totalRewardsClaimed", "type": "uint256" } ], "internalType": "struct MemesStaking.StakeInfo", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ], "name": "getUserStakes", "outputs": [ { "components": [ { "internalType": "uint256", "name": "stakeId", "type": "uint256" }, { "internalType": "uint256", "name": "stakedAmount", "type": "uint256" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "lastClaimTime", "type": "uint256" }, { "internalType": "bool", "name": "capitalWithdrawn", "type": "bool" }, { "internalType": "uint256", "name": "totalRewardsClaimed", "type": "uint256" } ], "internalType": "struct MemesStaking.UserStake[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "memesToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "user", "type": "address" }, { "internalType": "uint256", "name": "stakeId", "type": "uint256" } ], "name": "pendingRewards", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pendingOwner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "presale", "outputs": [ { "internalType": "contract IMemesPresale", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rewardFundBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ]
  },

  // Presale Contract
  MEMES_PRESALE: {
    address: '0x4534a6d5bF5834fa890DD1650CFB354699a07083',
    abi: [
      // View Functions
      { 
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }], 
        "name": "referrerOf", 
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }], 
        "stateMutability": "view", 
        "type": "function" 
      },
      { 
        "inputs": [], 
        "name": "defaultReferrer", 
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }], 
        "stateMutability": "view", 
        "type": "function" 
      },
      {
        "inputs": [
          { "internalType": "address", "name": "tokenAddress", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "calculateMemesTokens",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "", "type": "address" },
          { "internalType": "uint256", "name": "", "type": "uint256" }
        ],
        "name": "referralRewardByLevel",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      // Write Functions
      {
        "inputs": [
          { "internalType": "address", "name": "tokenToPay", "type": "address" },
          { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" },
          { "internalType": "address", "name": "_referrer", "type": "address" }
        ],
        "name": "buy",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      // Constructor and Events
      { "inputs": [ { "internalType": "address", "name": "_memesToken", "type": "address" }, { "internalType": "address[]", "name": "acceptedTokens", "type": "address[]" }, { "internalType": "uint256[]", "name": "tokenPrices", "type": "uint256[]" }, { "internalType": "bool[]", "name": "isOldToken", "type": "bool[]" }, { "internalType": "address", "name": "_paymentReceiver", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, 
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "blackListed", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "value", "type": "bool" } ], "name": "Blacklist", "type": "event" }, 
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "tokenAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenPurchased", "type": "uint256" } ], "name": "Buy", "type": "event" }, 
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "_from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_to", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, 
      { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Paused", "type": "event" }, 
      { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": true, "internalType": "address", "name": "referrer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "level", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenAmount", "type": "uint256" } ], "name": "ReferralBonusDistributed", "type": "event" }
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
