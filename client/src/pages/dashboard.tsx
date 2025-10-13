import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import memeStakeLogo from "@assets/ChatGPT Image Oct 9, 2025, 11_08_34 AM_1759988345567.png";
import { CONTRACTS } from "@/config/contracts";
import { createPublicClient, createWalletClient, http, custom, parseEther, parseUnits } from "viem";
import { bscTestnet } from "viem/chains";
import { Home, BookOpen, Coins, Copy, CheckCircle2, Users, TrendingUp, Shield, Rocket, Trophy, Zap, Lock, Gift, AlertTriangle } from "lucide-react";
import { SiTelegram, SiX } from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LiveJoinNotification } from "@/components/LiveJoinNotification";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [airdropTime, setAirdropTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [tokenBalance, setTokenBalance] = useState(0);
  const [stakingRewards, setStakingRewards] = useState(0);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletType, setWalletType] = useState<string>('');
  const [sponsorAddress, setSponsorAddress] = useState<string>('');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bnb' | 'usdt'>('bnb');
  const [estimatedTokens, setEstimatedTokens] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [showBuyPreview, setShowBuyPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedTokens, setPurchasedTokens] = useState(0);
  const [txHash, setTxHash] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Airdrop claim section state
  const [showAirdropClaim, setShowAirdropClaim] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [tasksPending, setTasksPending] = useState<Record<string, boolean>>({
    telegram_group: false,
    telegram_channel: false,
    twitter: false,
    youtube: false
  });
  const [airdropClaimed, setAirdropClaimed] = useState(false);
  const [airdropTxHash, setAirdropTxHash] = useState<string>('');
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [contractWalletBalance, setContractWalletBalance] = useState<string>('');
  const [totalStakedAmount, setTotalStakedAmount] = useState(0);
  const [isLoadingStakes, setIsLoadingStakes] = useState(false);
  const [pendingStakingRewards, setPendingStakingRewards] = useState(0);
  const [accruedToday, setAccruedToday] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [level1AirdropRewards, setLevel1AirdropRewards] = useState(0);
  const [level1StakingRewards, setLevel1StakingRewards] = useState(0);
  const [level2AirdropRewards, setLevel2AirdropRewards] = useState(0);
  const [level2StakingRewards, setLevel2StakingRewards] = useState(0);
  const [level3AirdropRewards, setLevel3AirdropRewards] = useState(0);
  const [level3StakingRewards, setLevel3StakingRewards] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(600); // Default BNB price in USD
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  
  const { toast } = useToast();
  
  const BSC_TESTNET_CHAIN_ID = '0x61'; // 97 in decimal

  // Fetch BNB price in USD
  useEffect(() => {
    const fetchBnbPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
        const data = await response.json();
        if (data.binancecoin?.usd) {
          setBnbPrice(data.binancecoin.usd);
        }
      } catch (error) {
        console.error('Error fetching BNB price:', error);
        // Keep default price of 600 USD
      }
    };

    fetchBnbPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchBnbPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize airdrop participant mutation
  const initAirdropMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; referralCode?: string }) => {
      const res = await apiRequest('POST', '/api/airdrop/init', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status', walletAddress] });
    }
  });

  // Fetch airdrop status
  const { data: airdropData, refetch: refetchAirdrop } = useQuery<{
    participant: any;
    referralCount: number;
    referralLink: string;
  }>({
    queryKey: ['/api/airdrop/status', walletAddress],
    enabled: !!walletAddress,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const participant = airdropData?.participant;
  const emailVerified = participant?.emailVerified || false;
  const tasksCompleted = {
    telegram_group: participant?.telegramGroupCompleted || false,
    telegram_channel: participant?.telegramChannelCompleted || false,
    twitter: participant?.twitterCompleted || false,
    youtube: participant?.youtubeCompleted || false
  };
  const airdropTokens = participant?.airdropTokens || 0;
  const referralCount = airdropData?.referralCount || 0;
  const referralTokens = participant?.referralTokens || 0;
  
  // Check if all tasks are completed
  const allTasksCompleted = emailVerified && Object.values(tasksCompleted).every(Boolean);

  // Earnings data - calculated from state
  const stakingEarnings = pendingStakingRewards;
  const totalEarnings = stakingEarnings + referralEarnings;
  const claimableAmount = totalEarnings;

  const TOKEN_PRICE = 0.0001; // $0.0001 per token
  const MIN_PURCHASE_USD = 50;

  const referralLink = walletAddress ? `${window.location.origin}/dashboard?ref=${walletAddress}` : '';

  // Auto-apply referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
      setShowReferralInput(true); // Show input if code exists in URL
    }
  }, []);

  // Initialize airdrop participant when wallet is connected
  useEffect(() => {
    if (walletAddress && !initAirdropMutation.isPending) {
      initAirdropMutation.mutate({ 
        walletAddress, 
        referralCode: referralCode || undefined 
      });
    }
  }, [walletAddress]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "✅ Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (data: { email: string; walletAddress: string }) => {
      const res = await apiRequest('POST', '/api/airdrop/send-otp', data);
      return await res.json();
    },
    onSuccess: () => {
      setShowOtpInput(true);
      toast({
        title: "📧 OTP Sent!",
        description: `Verification code sent to ${email}. Check console for OTP (dev mode)`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed to Send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string; walletAddress: string }) => {
      const res = await apiRequest('POST', '/api/airdrop/verify-otp', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status', walletAddress] });
      toast({
        title: "✅ Email Verified!",
        description: "You can now complete social tasks",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    }
  });

  // Skip verification mutation
  const skipVerificationMutation = useMutation({
    mutationFn: async (walletAddress: string) => {
      const res = await apiRequest('POST', '/api/airdrop/skip-verification', { walletAddress });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status', walletAddress] });
      toast({
        title: "⏭️ Skipped",
        description: "Email verification skipped",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; taskId: string }) => {
      const res = await apiRequest('POST', '/api/airdrop/complete-task', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status', walletAddress] });
      toast({
        title: "✅ Task Completed!",
        description: "You earned 250 MEMES tokens",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  // Airdrop claim handlers
  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "❌ Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    sendOtpMutation.mutate({ email, walletAddress });
    setResendCooldown(60); // Start 60 second cooldown
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    sendOtpMutation.mutate({ email, walletAddress });
    setResendCooldown(60);
    toast({
      title: "📧 OTP Resent",
      description: "Check your email for the new verification code",
    });
  };

  const handleVerifyOTP = () => {
    if (!otp || otp.length < 4) {
      toast({
        title: "❌ Invalid OTP",
        description: "Please enter the verification code",
      });
      return;
    }
    
    verifyOtpMutation.mutate({ email, otp, walletAddress });
  };

  const handleSkipVerification = () => {
    skipVerificationMutation.mutate(walletAddress);
  };

  const handleCompleteTask = (taskName: string) => {
    if (!emailVerified) {
      toast({
        title: "🔒 Locked",
        description: "Verify your email first to unlock tasks",
      });
      return;
    }

    // Set task to pending first
    setTasksPending(prev => ({ ...prev, [taskName]: true }));
    
    // Complete task after a delay
    setTimeout(() => {
      completeTaskMutation.mutate({ walletAddress, taskId: taskName });
      setTasksPending(prev => ({ ...prev, [taskName]: false }));
    }, 1500);
  };

  // Mock smart contract claim function
  const handleClaimAirdrop = async () => {
    if (!walletAddress) {
      toast({
        title: "❌ No Wallet",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsClaimingAirdrop(true);
    
    // Simulate smart contract call claimTokens(walletAddress)
    setTimeout(() => {
      // Generate mock transaction hash
      const mockTxHash = '0x' + Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      
      setAirdropTxHash(mockTxHash);
      setAirdropClaimed(true);
      setIsClaimingAirdrop(false);
      
      toast({
        title: "🎉 Airdrop Claimed!",
        description: "1000 MEMES tokens have been sent to your wallet",
      });
    }, 2000);
  };

  // Fetch wallet balance from smart contract
  const handleFetchWalletBalance = async () => {
    if (!walletAddress) {
      toast({
        title: "❌ No Wallet",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setIsFetchingBalance(true);
    
    try {
      // Check if window.ethereum is available
      if (typeof window.ethereum !== 'undefined') {
        const provider = window.ethereum;
        
        // Create the contract call data for balanceOf function
        const data = '0x70a08231' + walletAddress.slice(2).padStart(64, '0');
        
        // Call the contract
        const result = await provider.request({
          method: 'eth_call',
          params: [{
            to: CONTRACTS.MEMES_TOKEN.address,
            data: data
          }, 'latest']
        });
        
        // Convert result from hex to decimal and format
        const balance = parseInt(result, 16);
        const formattedBalance = (balance / 1e18).toFixed(2); // Assuming 18 decimals
        
        setContractWalletBalance(formattedBalance);
        
        toast({
          title: "✅ Balance Retrieved",
          description: `Your MEMES token balance: ${formattedBalance}`,
        });
        
        // After successful fetch, hide airdrop section after 3 seconds
        setTimeout(() => {
          setShowAirdropClaim(false);
        }, 3000);
      } else {
        throw new Error('MetaMask not found');
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to fetch wallet balance",
        variant: "destructive"
      });
    } finally {
      setIsFetchingBalance(false);
    }
  };

  // Calculate conversions
  const calculateTokensFromUSD = (usd: number) => usd / TOKEN_PRICE;
  const calculateUSDFromTokens = (tokens: number) => tokens * TOKEN_PRICE;

  const tokensToGet = estimatedTokens;

  // Calculate actual USD amount based on payment method
  const usdAmount = paymentMethod === 'bnb'
    ? (parseFloat(buyAmount) || 0) * bnbPrice
    : parseFloat(buyAmount) || 0;

  const handleBuyTokens = () => {
    if (usdAmount < MIN_PURCHASE_USD) {
      toast({
        title: "❌ Minimum Purchase Required",
        description: paymentMethod === 'bnb' 
          ? `Minimum purchase is $${MIN_PURCHASE_USD}. You entered ${parseFloat(buyAmount || '0').toFixed(4)} BNB (~$${usdAmount.toFixed(2)})`
          : `Minimum purchase is $${MIN_PURCHASE_USD}. You entered $${usdAmount.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    setShowBuyPreview(true);
  };

  const confirmPurchase = async () => {
    if (!walletAddress) {
      toast({
        title: "❌ No Wallet Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    setShowBuyPreview(false);
    setIsPurchasing(true);

    try {
      // Check if ethereum is available
      if (!window.ethereum) {
        throw new Error('No wallet found. Please install MetaMask or another Web3 wallet.');
      }

      // Create public client for checking balances
      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      // Check if Presale contract has enough MEMES tokens
      const presaleMemesBalance = await publicClient.readContract({
        address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
        abi: CONTRACTS.MEMES_TOKEN.abi,
        functionName: 'balanceOf',
        args: [CONTRACTS.MEMES_PRESALE.address as `0x${string}`]
      }) as bigint;

      const presaleMemesBalanceInTokens = Number(presaleMemesBalance) / 1e18;

      // Check if presale contract has enough tokens for this purchase
      if (presaleMemesBalanceInTokens < estimatedTokens) {
        setIsPurchasing(false);
        setShowBuyPreview(false);
        toast({
          title: "❌ Insufficient Presale Tokens",
          description: `Presale contract only has ${presaleMemesBalanceInTokens.toLocaleString()} MEMES tokens available. You're trying to buy ${estimatedTokens.toLocaleString()} tokens.`,
          variant: "destructive"
        });
        return;
      }

      // Create wallet client
      const walletClient = createWalletClient({
        chain: bscTestnet,
        transport: custom(window.ethereum)
      });

      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
      
      if (paymentMethod === 'bnb') {
        // BNB Payment Flow
        toast({
          title: "⏳ Processing BNB Payment",
          description: "Please confirm the transaction in your wallet..."
        });

        const bnbAmount = parseFloat(buyAmount);
        const bnbValueInWei = parseEther(bnbAmount.toString());

        // Call buy function with BNB
        const hash = await walletClient.writeContract({
          address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_PRESALE.abi,
          functionName: 'buy',
          args: [
            ZERO_ADDRESS as `0x${string}`, // tokenToPay = 0x0 for BNB
            BigInt(0), // tokenAmount = 0 for BNB
            sponsorAddress as `0x${string}` // referrer
          ],
          value: bnbValueInWei,
          account: walletAddress as `0x${string}`
        });

        setTxHash(hash);
        setPurchasedTokens(tokensToGet);

        toast({
          title: "✅ Purchase Successful!",
          description: `Transaction submitted. Hash: ${hash.slice(0, 10)}...`,
        });

        // Wait a bit then show success modal and refresh balances
        setTimeout(() => {
          setIsPurchasing(false);
          setShowSuccessModal(true);
          setBuyAmount('');
          // Refresh balance data after purchase
          fetchBalances();
        }, 2000);

      } else {
        // USDT Payment Flow
        const usdtAmount = parseFloat(buyAmount);
        const usdtAmountInWei = parseUnits(usdtAmount.toString(), 18); // Assuming 18 decimals

        // Check USDT balance first
        const usdtBalance = await publicClient.readContract({
          address: CONTRACTS.USDT_TOKEN.address as `0x${string}`,
          abi: CONTRACTS.USDT_TOKEN.abi,
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`]
        }) as bigint;

        // Verify sufficient USDT balance
        if (usdtBalance < usdtAmountInWei) {
          const balanceInUsdt = Number(usdtBalance) / 1e18;
          throw new Error(`Insufficient USDT balance. You have ${balanceInUsdt.toFixed(2)} USDT but need ${usdtAmount.toFixed(2)} USDT`);
        }

        // Check allowance
        const allowance = await publicClient.readContract({
          address: CONTRACTS.USDT_TOKEN.address as `0x${string}`,
          abi: CONTRACTS.USDT_TOKEN.abi,
          functionName: 'allowance',
          args: [walletAddress as `0x${string}`, CONTRACTS.MEMES_PRESALE.address as `0x${string}`]
        }) as bigint;

        // If allowance is insufficient, approve first
        if (allowance < usdtAmountInWei) {
          toast({
            title: "⏳ Approval Required",
            description: "Please approve USDT spending in your wallet..."
          });

          const approveHash = await walletClient.writeContract({
            address: CONTRACTS.USDT_TOKEN.address as `0x${string}`,
            abi: CONTRACTS.USDT_TOKEN.abi,
            functionName: 'approve',
            args: [
              CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
              usdtAmountInWei
            ],
            account: walletAddress as `0x${string}`
          });

          toast({
            title: "✅ Approval Confirmed",
            description: "USDT approved. Now processing purchase..."
          });

          // Wait for approval transaction
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Now execute buy with USDT
        toast({
          title: "⏳ Processing USDT Payment",
          description: "Please confirm the purchase transaction..."
        });

        const hash = await walletClient.writeContract({
          address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_PRESALE.abi,
          functionName: 'buy',
          args: [
            CONTRACTS.USDT_TOKEN.address as `0x${string}`, // tokenToPay = USDT address
            usdtAmountInWei, // tokenAmount in wei
            sponsorAddress as `0x${string}` // referrer
          ],
          account: walletAddress as `0x${string}`
        });

        setTxHash(hash);
        setPurchasedTokens(tokensToGet);

        toast({
          title: "✅ Purchase Successful!",
          description: `Transaction submitted. Hash: ${hash.slice(0, 10)}...`,
        });

        // Wait a bit then show success modal and refresh balances
        setTimeout(() => {
          setIsPurchasing(false);
          setShowSuccessModal(true);
          setBuyAmount('');
          // Refresh balance data after purchase
          fetchBalances();
        }, 2000);
      }

    } catch (error: any) {
      console.error('Purchase error:', error);
      setIsPurchasing(false);
      
      let errorMessage = error.message || 'Failed to complete purchase';
      
      // Handle specific error codes
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      }
      
      toast({
        title: "❌ Purchase Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleClaimEarnings = async () => {
    if (claimableAmount <= 0) {
      toast({
        title: "❌ No Earnings",
        description: "You don't have any earnings to claim",
        variant: "destructive"
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsClaiming(true);

      // Get wallet client based on wallet type
      let walletClient;
      if (walletType === 'metamask' && window.ethereum) {
        walletClient = createWalletClient({
          account: walletAddress as `0x${string}`,
          chain: bscTestnet,
          transport: custom(window.ethereum)
        });
      } else if (walletType === 'trust' && (window as any).trustwallet) {
        walletClient = createWalletClient({
          account: walletAddress as `0x${string}`,
          chain: bscTestnet,
          transport: custom((window as any).trustwallet)
        });
      } else if (walletType === 'safepal' && (window as any).safepalProvider) {
        walletClient = createWalletClient({
          account: walletAddress as `0x${string}`,
          chain: bscTestnet,
          transport: custom((window as any).safepalProvider)
        });
      } else {
        throw new Error('Wallet not available');
      }

      // Call claimRewards function from staking contract
      const hash = await walletClient.writeContract({
        address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_STAKE.abi,
        functionName: 'claimRewards',
        args: []
      });

      toast({
        title: "⏳ Transaction Submitted",
        description: "Claiming your rewards...",
      });

      // Wait for transaction confirmation
      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      await publicClient.waitForTransactionReceipt({ hash });

      toast({
        title: "🎉 Rewards Claimed!",
        description: `Successfully claimed ${claimableAmount.toLocaleString()} $MEMES to your wallet`,
      });

      // Refresh balances after successful claim
      setTimeout(() => {
        fetchBalances();
      }, 2000);

    } catch (error: any) {
      console.error('Claim error:', error);
      
      let errorMessage = error.message || 'Failed to claim rewards';
      
      // Handle specific error codes
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient BNB for gas fees';
      }
      
      toast({
        title: "❌ Claim Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsClaiming(false);
    }
  };

  // Check current network and update state
  const checkCurrentNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentChainId(chainId);
      return chainId;
    } catch (error) {
      console.error('Error checking network:', error);
      return null;
    }
  };

  // Switch to BSC Testnet with better error handling
  const switchToBscTestnet = async () => {
    if (!window.ethereum) {
      toast({
        title: "❌ No Wallet Found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive"
      });
      return false;
    }

    setIsCheckingNetwork(true);

    try {
      // First try to switch
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET_CHAIN_ID }],
      });
      
      setCurrentChainId(BSC_TESTNET_CHAIN_ID);
      toast({
        title: "✅ Network Switched",
        description: "Successfully switched to BSC Testnet",
      });
      
      setIsCheckingNetwork(false);
      return true;
    } catch (switchError: any) {
      // If the chain hasn't been added to the wallet, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: BSC_TESTNET_CHAIN_ID,
              chainName: 'BNB Smart Chain Testnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'tBNB',
                decimals: 18,
              },
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              blockExplorerUrls: ['https://testnet.bscscan.com/'],
            }],
          });
          
          setCurrentChainId(BSC_TESTNET_CHAIN_ID);
          toast({
            title: "✅ Network Added",
            description: "BSC Testnet added and switched successfully",
          });
          
          setIsCheckingNetwork(false);
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast({
            title: "❌ Network Setup Failed",
            description: "Could not add BSC Testnet. Please add it manually in your wallet settings.",
            variant: "destructive"
          });
          setIsCheckingNetwork(false);
          return false;
        }
      } else if (switchError.code === 4001) {
        // User rejected the request
        toast({
          title: "❌ Request Rejected",
          description: "You need to switch to BSC Testnet to use this app",
          variant: "destructive"
        });
        setIsCheckingNetwork(false);
        return false;
      } else {
        console.error('Network switch error:', switchError);
        toast({
          title: "⚠️ Network Switch Issue",
          description: "Please manually switch to BSC Testnet in your wallet",
          variant: "destructive"
        });
        setIsCheckingNetwork(false);
        return false;
      }
    }
  };

  // Load wallet address and type from localStorage
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    const storedWalletType = localStorage.getItem('walletType');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
    if (storedWalletType) {
      setWalletType(storedWalletType);
    }
  }, []);

  // Check network on load and periodically
  useEffect(() => {
    if (!walletAddress || !window.ethereum) return;

    // Initial check
    checkCurrentNetwork();

    // Check every 3 seconds for mobile wallet issues
    const interval = setInterval(() => {
      checkCurrentNetwork();
    }, 3000);

    return () => clearInterval(interval);
  }, [walletAddress]);

  // Calculate estimated MEMES tokens based on payment method and amount
  useEffect(() => {
    const calculateEstimatedTokens = async () => {
      if (!buyAmount || parseFloat(buyAmount) <= 0) {
        setEstimatedTokens(0);
        return;
      }

      const amount = parseFloat(buyAmount);

      if (paymentMethod === 'usdt') {
        try {
          // Create public client for reading contract
          const publicClient = createPublicClient({
            chain: bscTestnet,
            transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
          });

          // Convert amount to wei (assuming 18 decimals for USDT)
          const amountInWei = BigInt(Math.floor(amount * 1e18));

          // Call calculateMemesTokens from contract
          const memesTokens = await publicClient.readContract({
            address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_PRESALE.abi,
            functionName: 'calculateMemesTokens',
            args: [CONTRACTS.USDT_TOKEN.address as `0x${string}`, amountInWei]
          });

          // Convert from wei to tokens (assuming 18 decimals)
          const tokensEstimated = Number(memesTokens) / 1e18;
          setEstimatedTokens(tokensEstimated);
        } catch (error) {
          console.error('Error calculating MEMES tokens:', error);
          // Fallback to simple calculation if contract call fails
          setEstimatedTokens(amount / TOKEN_PRICE);
        }
      } else {
        // For BNB, use simple calculation
        setEstimatedTokens(amount / TOKEN_PRICE);
      }
    };

    calculateEstimatedTokens();
  }, [buyAmount, paymentMethod]);

  // Fetch sponsor address from contract
  useEffect(() => {
    const fetchSponsorAddress = async () => {
      if (!walletAddress) return;

      const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

      try {
        // Create public client for reading contract
        const publicClient = createPublicClient({
          chain: bscTestnet,
          transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
        });

        // 1. Check referrerOf[connectedWallet] from contract
        try {
          const referrer = await publicClient.readContract({
            address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_PRESALE.abi,
            functionName: 'referrerOf',
            args: [walletAddress as `0x${string}`]
          });

          // If referrer is found and not zero address, use it
          if (referrer && referrer !== ZERO_ADDRESS) {
            setSponsorAddress(referrer as string);
            return;
          }
        } catch (err) {
          console.error('Error reading referrerOf:', err);
        }

        // 2. Check URL parameter ?ref={walletAddress}
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get('ref');
        
        if (refParam && refParam !== ZERO_ADDRESS) {
          setSponsorAddress(refParam);
          return;
        }

        // 3. Get defaultReferrer from contract
        try {
          const defaultRef = await publicClient.readContract({
            address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_PRESALE.abi,
            functionName: 'defaultReferrer'
          });          
          if (defaultRef && defaultRef !== ZERO_ADDRESS) {
            setSponsorAddress(defaultRef as string);
            return;
          }
        } catch (err) {
          console.error('Error reading defaultReferrer:', err);
        }

        // 4. Final fallback - use a demo sponsor address
        setSponsorAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
      } catch (error) {
        console.error('Error fetching sponsor address:', error);
        // Fallback to a demo address
        setSponsorAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
      }
    };

    fetchSponsorAddress();
  }, [walletAddress]);

  // Fetch real token balance and referral rewards
  const fetchBalances = async () => {
    if (!walletAddress) return;

    setIsLoadingBalances(true);

    try {
      // Create public client for reading contract
      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      // Fetch MEME token balance
      const balance = await publicClient.readContract({
        address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
        abi: CONTRACTS.MEMES_TOKEN.abi,
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`]
      }) as bigint;

      // Convert from wei to tokens (assuming 18 decimals)
      const balanceInTokens = Number(balance) / 1e18;
      setTokenBalance(balanceInTokens);

      // Fetch referral rewards from all 3 levels
      let totalRewards = 0;
      for (let level = 0; level < 3; level++) {
        const reward = await publicClient.readContract({
          address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_PRESALE.abi,
          functionName: 'referralRewardByLevel',
          args: [walletAddress as `0x${string}`, BigInt(level)]
        }) as bigint;

        totalRewards += Number(reward) / 1e18;
      }

      setStakingRewards(totalRewards);

      // Fetch total staked amount from staking contract
      try {
        console.log('Fetching stakes for wallet:', walletAddress);
        console.log('Staking contract address:', CONTRACTS.MEMES_STAKE.address);
        
        const userStakes = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getUserStakes',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        console.log('User stakes received:', userStakes);
        console.log('Number of stakes:', userStakes?.length || 0);

        // Sum up all active stakes (where capitalWithdrawn is false)
        let totalStaked = 0;
        for (const stake of userStakes) {
          console.log('Stake:', stake);
          if (!stake.capitalWithdrawn) {
            const stakeAmount = Number(stake.stakedAmount) / 1e18;
            console.log('Active stake amount:', stakeAmount);
            totalStaked += stakeAmount;
          }
        }
        
        console.log('Total staked amount:', totalStaked);
        setTotalStakedAmount(totalStaked);

        // Calculate Accrued Today: 1% of active stakes whose lastClaim is < 24 hours
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        const twentyFourHoursAgo = currentTime - (24 * 60 * 60);
        let todayAccrued = 0;
        
        for (const stake of userStakes) {
          if (!stake.capitalWithdrawn) {
            const lastClaimTime = Number(stake.lastClaim);
            // If lastClaim is within the last 24 hours
            if (lastClaimTime >= twentyFourHoursAgo) {
              todayAccrued += (Number(stake.stakedAmount) / 1e18) * 0.01; // 1% of stake
            }
          }
        }
        
        console.log('Accrued today:', todayAccrued);
        setAccruedToday(todayAccrued);
      } catch (stakeError) {
        console.error('Error fetching staked amount:', stakeError);
        setTotalStakedAmount(0);
        setAccruedToday(0);
      }

      // Fetch staked amounts by referral level
      try {
        const stakedByLevel = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getTotalStakedByReferralLevel',
          args: [walletAddress as `0x${string}`]
        }) as any;

        const level1Staked = Number(stakedByLevel.level1Total || 0) / 1e18;
        const level2Staked = Number(stakedByLevel.level2Total || 0) / 1e18;
        const level3Staked = Number(stakedByLevel.level3Total || 0) / 1e18;

        setLevel1StakingRewards(level1Staked);
        setLevel2StakingRewards(level2Staked);
        setLevel3StakingRewards(level3Staked);
      } catch (stakedError) {
        console.error('Error fetching staked by referral level:', stakedError);
        setLevel1StakingRewards(0);
        setLevel2StakingRewards(0);
        setLevel3StakingRewards(0);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [walletAddress]);

  // Handle disconnect wallet
  const handleDisconnectWallet = () => {
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    toast({
      title: "👋 Wallet Disconnected",
      description: "You have been disconnected from your wallet",
    });
    setTimeout(() => {
      setLocation('/');
    }, 1000);
  };

  // Airdrop countdown timer
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30); // 30 days from now
    targetDate.setHours(15, 0, 0, 0); // 3 PM
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance > 0) {
        setAirdropTime({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setAirdropTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleStakeTokens = () => {
    setLocation('/staking');
  };

  return (
    <div className="min-h-screen text-foreground" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1421 100%)'}} data-testid="dashboard-page">
      
      {/* Live Join Notifications */}
      <LiveJoinNotification />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md" style={{background: 'rgba(15, 10, 35, 0.95)'}} data-testid="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={memeStakeLogo} 
                alt="Memes Everywhere Logo" 
                className="w-14 h-14 rounded-lg cursor-pointer transition-transform hover:scale-105"
                style={{filter: 'drop-shadow(0 4px 20px rgba(255, 215, 0, 0.4))'}}
                onClick={() => setLocation('/')}
                data-testid="logo-memestake"
              />
              <span className="text-xl font-bold hidden sm:block" style={{color: '#ffd700'}}>Memes Everywhere</span>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setLocation('/dashboard')}
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-[#ffd700]"
                style={{color: location === '/dashboard' ? '#ffd700' : '#ffffff'}}
                data-testid="nav-dashboard"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setLocation('/')}
                className="flex items-center space-x-2 text-sm font-medium text-white transition-colors hover:text-[#ffd700]"
                data-testid="nav-about"
              >
                <BookOpen className="w-4 h-4" />
                <span>About</span>
              </button>
              
              <button
                onClick={() => {
                  setLocation('/');
                  setTimeout(() => {
                    const element = document.getElementById('tokenomics');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="flex items-center space-x-2 text-sm font-medium text-white transition-colors hover:text-[#ffd700]"
                data-testid="nav-tokenomics"
              >
                <Coins className="w-4 h-4" />
                <span>Tokenomics</span>
              </button>
              
              <a
                href="https://t.me/memestakegroup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm font-medium text-white transition-colors hover:text-[#00bfff] px-3 py-1.5 rounded-lg"
                style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}
                data-testid="nav-telegram"
              >
                <SiTelegram className="w-4 h-4" style={{color: '#00bfff'}} />
                <span>Join Telegram</span>
              </a>
            </nav>

            {/* Wallet Info & Disconnect */}
            <div className="flex items-center space-x-3">
              {/* Telegram Link */}
              <a
                href="https://t.me/memestakegroup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-lg transition-all duration-300 hover:scale-110"
                style={{background: 'rgba(0, 191, 255, 0.15)', border: '1px solid rgba(0, 191, 255, 0.4)'}}
                title="Join our Telegram"
                data-testid="header-telegram-link"
              >
                <SiTelegram className="w-5 h-5" style={{color: '#00bfff'}} />
              </a>
              
              {walletAddress ? (
                <>
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                    <div className="text-xs text-gray-400">{walletType || 'Wallet'}</div>
                    <div className="text-sm font-mono font-bold" style={{color: '#ffd700'}}>
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDisconnectWallet}
                    className="text-xs sm:text-sm"
                    style={{borderColor: 'rgba(255, 215, 0, 0.3)', color: '#ffd700'}}
                    data-testid="button-disconnect-wallet"
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => setLocation('/')}
                  className="text-xs sm:text-sm"
                  style={{background: '#ffd700', color: '#000'}}
                  data-testid="button-connect-wallet"
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* Welcome & Airdrop Timer */}
        <Card className="p-6 glass-card">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4" style={{color: '#ffd700'}}>
              🎉 Welcome to Your Memes Everywhere Dashboard!
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your wallet is connected and ready for staking rewards
            </p>
            
            {/* Airdrop Countdown */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-6 border border-primary/20">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl mr-2">⏰</span>
                <span className="text-lg font-semibold" style={{color: '#00bfff'}}>AIRDROP ENDS IN</span>
              </div>
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.days).padStart(2, '0')}</div>
                  <div className="text-sm text-muted-foreground">DAYS</div>
                </div>
                <div className="text-xl font-bold" style={{color: '#ffd700'}}>:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.hours).padStart(2, '0')}</div>
                  <div className="text-sm text-muted-foreground">HOURS</div>
                </div>
                <div className="text-xl font-bold" style={{color: '#ffd700'}}>:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.minutes).padStart(2, '0')}</div>
                  <div className="text-sm text-muted-foreground">MINUTES</div>
                </div>
                <div className="text-xl font-bold" style={{color: '#ffd700'}}>:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.seconds).padStart(2, '0')}</div>
                  <div className="text-sm text-muted-foreground">SECONDS</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Wrong Network Warning Banner */}
        {walletAddress && currentChainId && currentChainId !== BSC_TESTNET_CHAIN_ID && (
          <Card className="p-6 border-2 animate-pulse" style={{
            borderColor: 'rgba(255, 0, 0, 0.5)',
            background: 'rgba(255, 0, 0, 0.1)'
          }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8" style={{color: '#ff4444'}} />
                <div>
                  <h3 className="font-bold text-lg" style={{color: '#ff4444'}}>Wrong Network Detected</h3>
                  <p className="text-sm text-muted-foreground">
                    You're connected to chain ID: {parseInt(currentChainId, 16)}. 
                    Please switch to BSC Testnet (Chain ID: 97) to use this app.
                  </p>
                </div>
              </div>
              <Button 
                onClick={switchToBscTestnet}
                disabled={isCheckingNetwork}
                className="whitespace-nowrap"
                style={{
                  background: '#ff4444',
                  color: '#fff'
                }}
                data-testid="button-switch-network-banner"
              >
                {isCheckingNetwork ? '⏳ Switching Network...' : '🔄 Switch to BSC Testnet'}
              </Button>
            </div>
          </Card>
        )}
        
        <Card className="p-6 glass-card">
          <div className="text-center">
            {/* Claim Your Airdrop Now Button */}
            <div className="mt-6 relative group">
              <button
                onClick={() => setShowAirdropClaim(!showAirdropClaim)}
                className="w-full py-5 px-8 rounded-2xl font-extrabold text-2xl relative overflow-hidden transition-all duration-500 transform hover:scale-105 hover:rotate-1"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #ffd700 50%, #ffed4e 75%, #ffd700 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gradientShift 3s ease infinite',
                  color: '#000',
                  boxShadow: '0 8px 32px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)',
                  border: '2px solid rgba(255, 237, 78, 0.8)'
                }}
                data-testid="button-toggle-airdrop-claim"
              >
                {/* Animated shine effect */}
                <span 
                  className="absolute inset-0 w-full h-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    animation: 'shine 2s infinite',
                    transform: 'skewX(-20deg)'
                  }}
                />
                
                {/* Pulsing glow effect */}
                <span 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                />
                
                {/* Button content */}
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <span className="text-3xl animate-bounce">🎁</span>
                  <span className="tracking-wider">
                    CLAIM YOUR AIRDROP NOW!
                  </span>
                  <span 
                    className="text-2xl transition-transform duration-300"
                    style={{
                      transform: showAirdropClaim ? 'rotate(180deg)' : 'rotate(0deg)',
                      display: 'inline-block'
                    }}
                  >
                    ▼
                  </span>
                </span>
              </button>
              
              {/* Decorative particles */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-ping" style={{animationDuration: '2s'}} />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-ping" style={{animationDuration: '2.5s'}} />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-ping" style={{animationDuration: '3s'}} />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full opacity-60 animate-ping" style={{animationDuration: '2.2s'}} />
            </div>

            {/* Airdrop Claim Section - Dropdown */}
            {showAirdropClaim && (
              <div 
                className="mt-6 p-8 rounded-2xl relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.98), rgba(30, 15, 60, 0.98), rgba(15, 10, 35, 0.98))',
                  border: '2px solid rgba(255, 215, 0, 0.4)',
                  boxShadow: '0 20px 60px rgba(255, 215, 0, 0.2), inset 0 0 60px rgba(255, 215, 0, 0.05)',
                  animation: 'slideDown 0.5s ease-out'
                }}
              >
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" 
                     style={{background: 'radial-gradient(circle, #ffd700 0%, transparent 70%)', animation: 'pulse 3s ease-in-out infinite'}} />
                <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-20" 
                     style={{background: 'radial-gradient(circle, #00bfff 0%, transparent 70%)', animation: 'pulse 4s ease-in-out infinite'}} />
                
                {/* Header with animated gradient text */}
                <div className="relative z-10 mb-8 text-center">
                  <h2 
                    className="text-4xl font-extrabold mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'gradientShift 3s ease infinite'
                    }}
                  >
                    🎁 Claim Your MEMES Airdrop
                  </h2>
                  <p className="text-center text-gray-300 max-w-2xl mx-auto">
                    Complete the verification steps below to claim your exclusive MEMES tokens from our <span className="font-bold" style={{color: '#ffd700'}}>decentralized airdrop direct in your wallet</span> and join our growing community.
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mt-6 max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{color: '#00bfff'}}>Overall Progress</span>
                      <span className="text-sm font-bold" style={{color: '#ffd700'}}>
                        {Math.round(((emailVerified ? 1 : 0) + Object.values(tasksCompleted).filter(Boolean).length) / 5 * 100)}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)'}}>
                      <div 
                        className="h-full transition-all duration-700 ease-out"
                        style={{
                          width: `${((emailVerified ? 1 : 0) + Object.values(tasksCompleted).filter(Boolean).length) / 5 * 100}%`,
                          background: 'linear-gradient(90deg, #ffd700 0%, #00bfff 50%, #00ff88 100%)',
                          boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* If already claimed, show permanent message */}
                {airdropClaimed ? (
                  <div className="p-8 rounded-xl text-center" style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.05))',
                    border: '2px solid rgba(0, 255, 136, 0.4)',
                    boxShadow: '0 8px 24px rgba(0, 255, 136, 0.3)'
                  }}>
                    <div className="mb-4 text-5xl">✅</div>
                    <h3 className="text-2xl font-bold mb-3" style={{color: '#00ff88'}}>
                      You have already received your airdrop.
                    </h3>
                    <p className="text-gray-300 mb-4">Transaction Hash:</p>
                    <a
                      href={`https://bscscan.com/tx/${airdropTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 rounded-xl font-mono text-sm transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: 'rgba(0, 255, 136, 0.2)',
                        color: '#00ff88',
                        border: '2px solid rgba(0, 255, 136, 0.4)'
                      }}
                    >
                      {airdropTxHash.slice(0, 10)}...{airdropTxHash.slice(-8)}
                    </a>
                  </div>
                ) : allTasksCompleted ? (
                  /* Step 4: Show eligibility and claim button when all tasks complete */
                  <div className="space-y-6">
                    <div className="text-center py-6">
                      <div className="mb-4 text-6xl animate-bounce">💰</div>
                      <h3 className="text-3xl font-bold mb-3" style={{
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
                        backgroundSize: '200% 200%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'gradientShift 3s ease infinite'
                      }}>
                        You are eligible for 1000 MEMES Token Reward!
                      </h3>
                      <p className="text-gray-300 text-lg">
                        Click the button below to claim your tokens
                      </p>
                    </div>
                    
                    <button
                      onClick={handleClaimAirdrop}
                      disabled={isClaimingAirdrop}
                      className="w-full px-8 py-5 rounded-xl font-bold text-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1"
                      style={{
                        background: isClaimingAirdrop 
                          ? 'rgba(100, 100, 100, 0.3)' 
                          : 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
                        backgroundSize: '200% 200%',
                        animation: isClaimingAirdrop ? 'none' : 'gradientShift 3s ease infinite',
                        color: '#000',
                        boxShadow: isClaimingAirdrop ? 'none' : '0 8px 24px rgba(255, 215, 0, 0.5)',
                        cursor: isClaimingAirdrop ? 'not-allowed' : 'pointer'
                      }}
                      data-testid="button-claim-airdrop"
                    >
                      {isClaimingAirdrop ? '⏳ Claiming...' : '🎁 Claim Now'}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 1. Email Verification */}
                    <div className="mb-6 relative z-10">
                  <div 
                    className="p-6 rounded-xl transition-all duration-300"
                    style={{
                      background: emailVerified 
                        ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05))' 
                        : 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))',
                      border: emailVerified 
                        ? '2px solid rgba(0, 255, 136, 0.4)' 
                        : '2px solid rgba(255, 215, 0, 0.4)',
                      boxShadow: emailVerified 
                        ? '0 8px 24px rgba(0, 255, 136, 0.2)' 
                        : '0 8px 24px rgba(255, 215, 0, 0.2)'
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-300"
                        style={{
                          background: emailVerified ? '#00ff88' : '#ffd700',
                          color: '#000',
                          boxShadow: emailVerified ? '0 4px 15px rgba(0, 255, 136, 0.4)' : '0 4px 15px rgba(255, 215, 0, 0.4)'
                        }}
                      >
                        {emailVerified ? '✓' : '1'}
                      </div>
                      <h3 className="text-xl font-bold text-white">Email Verification</h3>
                    </div>
                  
                    {!emailVerified ? (
                      <div>
                        {!showOtpInput ? (
                          <div className="space-y-3">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email address"
                              className="w-full px-5 py-4 rounded-xl text-white placeholder-gray-400 transition-all duration-200 focus:ring-2 focus:ring-yellow-500"
                              style={{
                                background: 'rgba(0, 0, 0, 0.4)', 
                                border: '2px solid rgba(255, 215, 0, 0.3)'
                              }}
                              data-testid="input-email"
                            />
                            <div className="flex gap-3">
                              <button
                                onClick={handleSendOTP}
                                className="flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                style={{
                                  background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)', 
                                  color: '#000',
                                  boxShadow: '0 4px 15px rgba(0, 191, 255, 0.4)'
                                }}
                                data-testid="button-send-otp"
                              >
                                📧 Send OTP
                              </button>
                              <button
                                onClick={handleSkipVerification}
                                className="px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                style={{
                                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', 
                                  color: '#000',
                                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
                                }}
                                data-testid="button-skip-verification"
                              >
                                🚀 Skip
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                className="flex-1 px-5 py-4 rounded-xl text-white placeholder-gray-400 text-center text-2xl tracking-widest transition-all duration-200 focus:ring-2 focus:ring-green-500"
                                style={{
                                  background: 'rgba(0, 0, 0, 0.4)', 
                                  border: '2px solid rgba(0, 255, 136, 0.3)'
                                }}
                                maxLength={6}
                                data-testid="input-otp"
                              />
                              <button
                                onClick={handleVerifyOTP}
                                className="px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                style={{
                                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)', 
                                  color: '#000',
                                  boxShadow: '0 4px 15px rgba(0, 255, 136, 0.4)'
                                }}
                                data-testid="button-verify-otp"
                              >
                                ✅ Verify
                              </button>
                            </div>
                            <div className="text-center">
                              <button
                                onClick={handleResendOTP}
                                disabled={resendCooldown > 0}
                                className="text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                                style={{
                                  background: resendCooldown > 0 ? 'rgba(100, 100, 100, 0.3)' : 'rgba(0, 191, 255, 0.2)',
                                  color: resendCooldown > 0 ? '#666' : '#00bfff',
                                  border: `2px solid ${resendCooldown > 0 ? 'rgba(100, 100, 100, 0.3)' : 'rgba(0, 191, 255, 0.3)'}`,
                                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                                }}
                                data-testid="button-resend-otp"
                              >
                                {resendCooldown > 0 
                                  ? `🕐 Resend in ${resendCooldown}s` 
                                  : '🔄 Resend OTP'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg animate-bounce" style={{
                          background: 'rgba(0, 255, 136, 0.2)',
                          color: '#00ff88',
                          border: '2px solid rgba(0, 255, 136, 0.4)'
                        }}>
                          ✅ Email Verified Successfully!
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Social Media Tasks */}
                <div className="mb-6 relative z-10">
                  <div 
                    className="p-6 rounded-xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.15), rgba(0, 191, 255, 0.05))',
                      border: '2px solid rgba(0, 191, 255, 0.4)',
                      boxShadow: '0 8px 24px rgba(0, 191, 255, 0.2)',
                      opacity: emailVerified ? 1 : 0.6
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold"
                        style={{
                          background: emailVerified ? '#00bfff' : '#666',
                          color: '#000',
                          boxShadow: emailVerified ? '0 4px 15px rgba(0, 191, 255, 0.4)' : 'none'
                        }}
                      >
                        2
                      </div>
                      <h3 className="text-xl font-bold text-white">Social Media Tasks</h3>
                      <div className="ml-auto px-4 py-1 rounded-full text-sm font-bold" style={{
                        background: 'rgba(0, 191, 255, 0.2)',
                        color: '#00bfff',
                        border: '1px solid rgba(0, 191, 255, 0.3)'
                      }}>
                        {Object.values(tasksCompleted).filter(Boolean).length}/4
                      </div>
                    </div>
                  
                    {!emailVerified && (
                      <div className="mb-4 p-4 rounded-xl text-center animate-pulse" style={{
                        background: 'rgba(255, 215, 0, 0.15)', 
                        border: '2px solid rgba(255, 215, 0, 0.3)'
                      }}>
                        <span className="font-bold" style={{color: '#ffd700'}}>🔒 Verify your email first to unlock tasks</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      {[
                        { id: 'telegram_group', label: 'Join Telegram Group', icon: '💬', reward: '250 $MEMES', url: 'https://t.me/memestakegroup' },
                        { id: 'telegram_channel', label: 'Join Telegram Channel', icon: '📢', reward: '250 $MEMES', url: 'https://t.me/memstakeofficial' },
                        { id: 'twitter', label: 'Follow on Twitter/X', icon: '🐦', reward: '250 $MEMES', url: 'https://twitter.com/memestake_official' },
                        { id: 'youtube', label: 'Subscribe YouTube', icon: '📺', reward: '250 $MEMES', url: 'https://youtube.com/@memestake' }
                      ].map((task, index) => {
                        const isCompleted = tasksCompleted[task.id as keyof typeof tasksCompleted];
                        return (
                          <div 
                            key={task.id} 
                            className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 transform hover:scale-102"
                            style={{
                              background: isCompleted 
                                ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.05))' 
                                : 'rgba(0, 0, 0, 0.4)', 
                              border: isCompleted 
                                ? '2px solid rgba(0, 255, 136, 0.4)' 
                                : '2px solid rgba(255, 255, 255, 0.1)',
                              boxShadow: isCompleted ? '0 4px 15px rgba(0, 255, 136, 0.2)' : 'none'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{task.icon}</span>
                              <div>
                                <div className="font-semibold" style={{color: isCompleted ? '#00ff88' : '#fff'}}>
                                  {task.label}
                                </div>
                                <div className="text-xs" style={{color: isCompleted ? '#00ff88' : '#ffd700'}}>
                                  Reward: {task.reward}
                                </div>
                              </div>
                            </div>
                            {isCompleted ? (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                                background: 'rgba(0, 255, 136, 0.2)',
                                border: '1px solid rgba(0, 255, 136, 0.4)'
                              }}>
                                <span className="text-sm font-bold" style={{color: '#00ff88'}}>✓ Completed</span>
                              </div>
                            ) : tasksPending[task.id as keyof typeof tasksPending] ? (
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full animate-pulse" style={{
                                background: 'rgba(255, 215, 0, 0.2)',
                                border: '1px solid rgba(255, 215, 0, 0.4)'
                              }}>
                                <span className="text-sm font-bold" style={{color: '#ffd700'}}>⏳ Pending</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (emailVerified) {
                                    window.open(task.url, '_blank');
                                    handleCompleteTask(task.id);
                                  } else {
                                    toast({
                                      title: "🔒 Locked",
                                      description: "Verify your email first",
                                    });
                                  }
                                }}
                                className="px-5 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                                style={{
                                  background: emailVerified 
                                    ? 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)' 
                                    : 'rgba(100, 100, 100, 0.3)',
                                  color: emailVerified ? '#000' : '#666',
                                  cursor: emailVerified ? 'pointer' : 'not-allowed',
                                  boxShadow: emailVerified ? '0 4px 15px rgba(0, 191, 255, 0.4)' : 'none'
                                }}
                                disabled={!emailVerified}
                                data-testid={`button-${task.id}`}
                              >
                                {emailVerified ? '🚀 Start' : '🔒 Locked'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            )}

            {/* Referral & Sponsor Section */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {/* Referral Link */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{color: '#ffd700'}}>🔗 Your Referral Link</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 px-3 py-2 rounded text-xs font-mono bg-black/30 border border-white/10 text-gray-300"
                    data-testid="input-referral-link"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="px-4 py-2 rounded font-semibold text-sm transition-all duration-200 hover:scale-105"
                    style={{background: '#ffd700', color: '#000'}}
                    data-testid="button-copy-referral"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              {/* Sponsor Address */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
                <div className="mb-2">
                  <span className="text-sm font-semibold" style={{color: '#00bfff'}}>👤 Your Sponsor</span>
                </div>
                <div className="flex items-center justify-center p-3 rounded bg-black/30 border border-white/10">
                  <span className="font-mono text-sm font-bold" style={{color: '#00bfff'}}>
                    {sponsorAddress ? `${sponsorAddress.slice(0, 6)}...${sponsorAddress.slice(-4)}` : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Buy MEMES Tokens Section - Clean & Attractive */}
        <Card className="p-6 glass-card" style={{border: '2px solid #ffd700', boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)'}}>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2" style={{color: '#ffd700'}}>🛒 Buy $MEMES Tokens</h3>
            
            {/* Live Price Display */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="px-4 py-2 rounded-lg backdrop-blur-sm" style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-gray-400">BNB Price:</span>
                  <span className="text-sm font-bold" style={{color: '#ffd700'}}>
                    ${bnbPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </div>
              </div>
              
              <div className="px-4 py-2 rounded-lg backdrop-blur-sm" style={{
                background: 'rgba(0, 191, 255, 0.15)',
                border: '1px solid rgba(0, 191, 255, 0.3)'
              }}>
                <div className="flex items-center gap-2">
                  <Coins className="w-3 h-3" style={{color: '#00bfff'}} />
                  <span className="text-xs font-semibold text-gray-400">MEMES Price:</span>
                  <span className="text-sm font-bold" style={{color: '#00bfff'}}>
                    $0.0001
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">Minimum $50 • Auto-updates every 5 minutes</p>
          </div>
          
          <div className="space-y-5">
            {/* Payment Method Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('bnb')}
                className={`p-4 rounded-lg font-semibold text-sm transition-all ${paymentMethod === 'bnb' ? 'transform scale-105' : ''}`}
                style={{
                  background: paymentMethod === 'bnb' ? '#ffd700' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${paymentMethod === 'bnb' ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: paymentMethod === 'bnb' ? '#000' : '#999'
                }}
                data-testid="toggle-bnb"
              >
                <div className="text-xl mb-1">💎</div>
                <div>Pay with BNB</div>
              </button>
              <button
                onClick={() => setPaymentMethod('usdt')}
                className={`p-4 rounded-lg font-semibold text-sm transition-all ${paymentMethod === 'usdt' ? 'transform scale-105' : ''}`}
                style={{
                  background: paymentMethod === 'usdt' ? '#00bfff' : 'rgba(255, 255, 255, 0.05)',
                  border: `2px solid ${paymentMethod === 'usdt' ? '#00bfff' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: paymentMethod === 'usdt' ? '#000' : '#999'
                }}
                data-testid="toggle-usdt"
              >
                <div className="text-xl mb-1">💵</div>
                <div>Pay with USDT</div>
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Amount ({paymentMethod.toUpperCase()})
              </label>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || parseFloat(value) >= 0) {
                    setBuyAmount(value);
                  }
                }}
                min="0"
                placeholder={paymentMethod === 'bnb' ? '0.1' : '50'}
                className="w-full px-4 py-4 rounded-lg text-xl font-bold text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  outline: 'none'
                }}
                data-testid="input-buy-amount"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Min: {paymentMethod === 'bnb' ? '0.1 BNB' : '50 USDT'}</span>
                <span>No Max Limit</span>
              </div>
              {buyAmount && parseFloat(buyAmount) > 0 && usdAmount < MIN_PURCHASE_USD && (
                <div className="mt-2 p-2 rounded text-xs font-semibold text-center" style={{
                  background: 'rgba(255, 0, 0, 0.15)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  color: '#ff6b6b'
                }}>
                  ⚠️ Minimum purchase is $50
                </div>
              )}
            </div>

            {/* You Will Receive */}
            <div className="p-5 rounded-lg text-center" style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '2px solid rgba(0, 255, 136, 0.3)'
            }}>
              <div className="text-xs text-gray-400 mb-1">You Will Receive</div>
              <div className="text-3xl font-black mb-1" style={{color: '#00ff88'}}>
                {tokensToGet.toLocaleString()}
              </div>
              <div className="text-lg font-bold" style={{color: '#ffd700'}}>$MEMES</div>
              <div className="text-xs text-gray-500 mt-1">
                ≈ ${usdAmount.toFixed(2)} USD
              </div>
            </div>

            {/* Buy Button */}
            <Button 
              onClick={handleBuyTokens}
              disabled={!buyAmount || parseFloat(buyAmount) <= 0 || usdAmount < MIN_PURCHASE_USD || isPurchasing}
              className="w-full py-6 text-lg font-bold rounded-lg transition-all hover:opacity-90"
              style={{
                background: '#ffd700',
                color: '#000'
              }}
              data-testid="button-buy-tokens"
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Processing...
                </span>
              ) : tokensToGet > 0 ? (
                `🚀 Buy Now - $${usdAmount.toFixed(2)}`
              ) : (
                'Enter Amount'
              )}
            </Button>

            {/* Security Info */}
            <div className="flex items-center justify-center gap-4 pt-3 text-xs text-gray-500">
              <span>🔒 Secure</span>
              <span>•</span>
              <span>⚡ Instant</span>
              <span>•</span>
              <span>✓ Verified</span>
            </div>
          </div>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Wallet Balance - Redesigned */}
          <Card className="p-0 overflow-hidden relative" style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            {/* Header with gradient */}
            <div className="p-6 pb-4 relative" style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 191, 255, 0.15) 100%)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
                  }}>
                    <span className="text-xl">💰</span>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
                    My Wallet
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold" style={{color: '#00ff88'}}>LIVE</span>
                </div>
              </div>
              
              {/* Wallet Address Badge */}
              {walletAddress && (
                <div className="mt-3 p-3 rounded-lg backdrop-blur-sm" style={{
                  background: 'rgba(0, 191, 255, 0.2)',
                  border: '1px solid rgba(0, 191, 255, 0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold mb-1" style={{color: '#00bfff'}}>Connected Wallet</div>
                      <div className="text-sm font-mono font-bold text-white">
                        {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                      </div>
                    </div>
                    <Coins className="w-5 h-5" style={{color: '#00bfff'}} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Wallet Stats Grid */}
            <div className="p-6 pt-4 space-y-3">
              {/* Main Balance - Featured */}
              <div className="p-5 rounded-xl relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
              }}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Coins className="w-full h-full" style={{color: '#ffd700'}} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" style={{color: '#ffd700'}} />
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#ffd700'}}>
                      Token Balance
                    </div>
                  </div>
                  <div className="text-3xl font-black" style={{
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${tokenBalance.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-3">
                {/* Total Rewards */}
                <div className="p-4 rounded-lg backdrop-blur-sm" style={{
                  background: 'rgba(0, 191, 255, 0.15)',
                  border: '1px solid rgba(0, 191, 255, 0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" style={{color: '#00bfff'}} />
                      <span className="text-sm text-gray-300">Total Rewards</span>
                    </div>
                    <div className="text-lg font-bold" style={{color: '#00bfff'}}>
                      {isLoadingBalances ? (
                        <span className="animate-pulse text-sm">...</span>
                      ) : (
                        `${stakingRewards.toLocaleString()} $MEMES`
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Airdrop Tokens */}
                <div className="p-4 rounded-lg backdrop-blur-sm" style={{
                  background: 'rgba(0, 255, 136, 0.15)',
                  border: '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" style={{color: '#00ff88'}} />
                      <span className="text-sm text-gray-300">Airdrop Tokens</span>
                    </div>
                    <div className="text-lg font-bold" style={{color: '#00ff88'}}>
                      {airdropTokens.toLocaleString()} $MEMES
                    </div>
                  </div>
                </div>
                
                {/* Referral Tokens */}
                <div className="p-4 rounded-lg backdrop-blur-sm" style={{
                  background: 'rgba(255, 215, 0, 0.15)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" style={{color: '#ffd700'}} />
                      <span className="text-sm text-gray-300">Referral Tokens</span>
                    </div>
                    <div className="text-lg font-bold" style={{color: '#ffd700'}}>
                      {isLoadingBalances ? (
                        <span className="animate-pulse text-sm">...</span>
                      ) : (
                        `${(level1AirdropRewards + level2AirdropRewards + level3AirdropRewards).toLocaleString()} $MEMES`
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Staking Overview - Redesigned */}
          <Card className="p-0 overflow-hidden relative" style={{
            background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%)',
            border: '1px solid rgba(0, 191, 255, 0.3)'
          }}>
            {/* Header with gradient */}
            <div className="p-6 pb-4 relative" style={{
              background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.15) 0%, rgba(0, 255, 136, 0.15) 100%)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #00bfff 0%, #00ff88 100%)',
                    boxShadow: '0 4px 15px rgba(0, 191, 255, 0.4)'
                  }}>
                    <span className="text-xl">📈</span>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                    Staking Overview
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)',
                  boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)'
                }}>
                  <span className="text-xs font-bold text-black">ACTIVE</span>
                </div>
              </div>
            </div>
            
            {/* APY Highlight */}
            <div className="px-6 pb-4">
              <div className="p-5 rounded-xl relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 100%)',
                border: '2px solid rgba(0, 255, 136, 0.4)',
                boxShadow: '0 8px 25px rgba(0, 255, 136, 0.2)'
              }}>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <TrendingUp className="w-full h-full" style={{color: '#00ff88'}} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4" style={{color: '#00ff88'}} />
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#00ff88'}}>
                      Annual Percentage Yield
                    </div>
                  </div>
                  <div className="text-4xl font-black" style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00ffaa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    365% APY
                  </div>
                  <div className="text-xs mt-1" style={{color: '#00ff88'}}>
                    🔥 1% Daily Returns
                  </div>
                </div>
              </div>
            </div>
            
            {/* Staking Stats */}
            <div className="px-6 pb-6 space-y-3">
              {/* Staked Amount */}
              <div className="p-4 rounded-lg backdrop-blur-sm" style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" style={{color: '#ffd700'}} />
                    <span className="text-sm text-gray-300">Staked Amount</span>
                  </div>
                  <div className="text-lg font-bold" style={{color: '#ffd700'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-sm">...</span>
                    ) : (
                      `${totalStakedAmount.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
              </div>
              
              {/* Lock Period */}
              <div className="p-4 rounded-lg backdrop-blur-sm" style={{
                background: 'rgba(0, 191, 255, 0.15)',
                border: '1px solid rgba(0, 191, 255, 0.3)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{color: '#00bfff'}} />
                    <span className="text-sm text-gray-300">Lock Period</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    50 Days
                  </div>
                </div>
              </div>
              
              {/* Daily Rewards */}
              <div className="p-4 rounded-lg backdrop-blur-sm" style={{
                background: 'rgba(0, 255, 136, 0.15)',
                border: '1px solid rgba(0, 255, 136, 0.3)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" style={{color: '#00ff88'}} />
                    <span className="text-sm text-gray-300">Today's Rewards</span>
                  </div>
                  <div className="text-lg font-bold" style={{color: '#00ff88'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-sm">...</span>
                    ) : (
                      `${accruedToday.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
              </div>
              
              {/* Stake Button */}
              <Button 
                size="lg"
                className="w-full mt-4 text-base font-bold py-6 transition-all hover:scale-105" 
                onClick={handleStakeTokens}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#000',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                  border: 'none'
                }}
                data-testid="button-stake-more"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Stake More Tokens
              </Button>
            </div>
          </Card>
        </div>

        {/* Earnings Section */}
        <Card className="p-6 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">💰 My Earnings</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/income-history')}
              data-testid="button-view-history"
            >
              📊 View History
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Staking Earnings */}
            <div className="p-4 rounded-lg text-center" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
              <div className="text-xs text-muted-foreground mb-2">Staking Rewards</div>
              <div className="text-xl font-bold" style={{color: '#00bfff'}}>
                {stakingEarnings.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
            </div>

            {/* Referral Earnings */}
            <div className="p-4 rounded-lg text-center" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
              <div className="text-xs text-muted-foreground mb-2">Referral Rewards</div>
              <div className="text-xl font-bold" style={{color: '#ffd700'}}>
                {referralEarnings.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
            </div>

            {/* Total Earnings */}
            <div className="p-4 rounded-lg text-center" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
              <div className="text-xs text-muted-foreground mb-2">Total Earnings</div>
              <div className="text-xl font-bold" style={{color: '#00ff88'}}>
                {totalEarnings.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
            </div>
          </div>

          {/* Claim Section - Highlighted */}
          <div className="relative p-6 rounded-xl overflow-hidden animate-pulse" style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.25) 0%, rgba(0, 255, 136, 0.15) 100%)',
            border: '3px solid rgba(0, 255, 136, 0.6)',
            boxShadow: '0 10px 40px rgba(0, 255, 136, 0.3), inset 0 0 60px rgba(0, 255, 136, 0.1)'
          }}>
            <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
              <Gift className="w-full h-full" style={{color: '#00ff88'}} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)',
                  boxShadow: '0 4px 15px rgba(0, 255, 136, 0.5)'
                }}>
                  <Gift className="w-4 h-4 text-black" />
                </div>
                <div className="text-sm font-bold uppercase tracking-wide" style={{color: '#00ff88'}}>
                  ⚡ CLAIMABLE AMOUNT
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-black mb-1" style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00ffaa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {claimableAmount.toLocaleString()} $MEMES
                  </div>
                  <div className="text-xs" style={{color: '#00ff88'}}>
                    💰 ${(claimableAmount * 0.0001).toFixed(2)} USD Value
                  </div>
                </div>
                <Button 
                  onClick={handleClaimEarnings}
                  disabled={isClaiming || claimableAmount <= 0}
                  className="text-base font-bold px-6 py-6"
                  style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)',
                    color: '#000',
                    boxShadow: '0 8px 25px rgba(0, 255, 136, 0.4)',
                    border: 'none'
                  }}
                  data-testid="button-claim-earnings"
                >
                  {isClaiming ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Claiming...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Gift className="w-5 h-5" /> Claim Now
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* My Airdrop/Staking Earning - 3 Levels */}
        <Card className="p-6 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">👥 My Airdrop/Staking Earning</h3>
            <div className="text-xs px-3 py-1 rounded-full" style={{background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700'}}>
              3-Level System
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Level 1 - Direct */}
            <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: '#ffd700', color: '#000'}}>
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <span className="text-sm font-semibold">Level 1 - Direct</span>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700'}}>5% Rewards</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Airdrop Token</div>
                  <div className="text-xl font-bold" style={{color: '#ffd700'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${level1AirdropRewards.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Staking Token</div>
                  <div className="text-xl font-bold" style={{color: '#ffd700'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${level1StakingRewards.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Level 2 */}
            <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: '#00bfff', color: '#000'}}>
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <span className="text-sm font-semibold">Level 2</span>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{background: 'rgba(0, 191, 255, 0.2)', color: '#00bfff'}}>3% Rewards</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Airdrop Token</div>
                  <div className="text-xl font-bold" style={{color: '#00bfff'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${level2AirdropRewards.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Staking Token</div>
                  <div className="text-xl font-bold" style={{color: '#00bfff'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${level2StakingRewards.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Level 3 */}
            <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: '#00ff88', color: '#000'}}>
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <span className="text-sm font-semibold">Level 3</span>
                </div>
                <span className="text-xs px-2 py-1 rounded" style={{background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88'}}>2% Rewards</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Airdrop Token</div>
                  <div className="text-xl font-bold" style={{color: '#00ff88'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${level3AirdropRewards.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Staking Token</div>
                  <div className="text-xl font-bold" style={{color: '#00ff88'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${level3StakingRewards.toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            {/*<div className="p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Airdrop Earning</div>
                  <div className="text-2xl font-bold" style={{color: '#ffd700'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${(level1AirdropRewards + level2AirdropRewards + level3AirdropRewards).toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Staking Earning</div>
                  <div className="text-2xl font-bold" style={{color: '#00ff88'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${(level1StakingRewards + level2StakingRewards + level3StakingRewards).toLocaleString()} $MEMES`
                    )}
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </Card>

        {/* How It Works - Process Steps */}
        <Card className="p-8 glass-card" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 191, 255, 0.05))', border: '2px solid rgba(0, 191, 255, 0.3)'}}>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-it-works" style={{borderColor: 'rgba(0, 191, 255, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#00bfff]">
                <h2 className="text-3xl font-bold text-center" style={{color: '#00bfff'}}>🚀 How It Works</h2>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p className="text-center text-gray-400 mb-8">Follow these simple steps to maximize your rewards</p>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1" style={{borderColor: 'rgba(0, 191, 255, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#00bfff]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(0, 255, 136, 0.2)', border: '2px solid #00ff88'}}>
                    <span className="text-lg font-bold" style={{color: '#00ff88'}}>1</span>
                  </div>
                  <span className="text-lg font-semibold">Claim Your Airdrop</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pt-4">
                <div className="pl-14 space-y-3">
                  <p>Start earning free $MEMES tokens through our airdrop program:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00ff88'}} />
                      <span>Connect your wallet (MetaMask, Trust Wallet, or SafePal)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00ff88'}} />
                      <span>Verify your email address with OTP code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00ff88'}} />
                      <span>Complete social tasks (Follow, Like, Retweet) - Earn 250 $MEMES per task</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00ff88'}} />
                      <span>3-level referral system (Level 1: 5%, Level 2: 3%, Level 3: 2%)</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
                    <div className="text-sm font-bold mb-1" style={{color: '#00ff88'}}>💎 Max Airdrop Rewards: 1,000 $MEMES</div>
                    <div className="text-xs text-gray-500">Complete all 4 social tasks to unlock maximum rewards</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" style={{borderColor: 'rgba(0, 191, 255, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#00bfff]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(255, 215, 0, 0.2)', border: '2px solid #ffd700'}}>
                    <span className="text-lg font-bold" style={{color: '#ffd700'}}>2</span>
                  </div>
                  <span className="text-lg font-semibold">Buy MEMES Tokens</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pt-4">
                <div className="pl-14 space-y-3">
                  <p>Purchase $MEMES tokens during our public sale:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#ffd700'}} />
                      <span>Token Price: <strong style={{color: '#ffd700'}}>$0.0001</strong> per $MEMES</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#ffd700'}} />
                      <span>Minimum Purchase: <strong style={{color: '#ffd700'}}>$50</strong> (500,000 $MEMES)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#ffd700'}} />
                      <span>No maximum limit - buy as much as you want</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#ffd700'}} />
                      <span>Network: BSC (BEP-20) - Low gas fees</span>
                    </li>
                  </ul>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                      <div className="text-xs text-gray-500 mb-1">Example 1</div>
                      <div className="text-sm font-bold" style={{color: '#ffd700'}}>$100 = 1M $MEMES</div>
                    </div>
                    <div className="p-3 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                      <div className="text-xs text-gray-500 mb-1">Example 2</div>
                      <div className="text-sm font-bold" style={{color: '#ffd700'}}>$1,000 = 10M $MEMES</div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" style={{borderColor: 'rgba(0, 191, 255, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#00bfff]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(0, 191, 255, 0.2)', border: '2px solid #00bfff'}}>
                    <span className="text-lg font-bold" style={{color: '#00bfff'}}>3</span>
                  </div>
                  <span className="text-lg font-semibold">Stake MEMES Tokens</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pt-4">
                <div className="pl-14 space-y-3">
                  <p>Maximize your earnings with high-yield staking:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00bfff'}} />
                      <span>Earn up to <strong style={{color: '#00bfff'}}>365% APY</strong> (1% daily rewards)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00bfff'}} />
                      <span>Minimum staking period: <strong style={{color: '#00bfff'}}>90 days</strong> for penalty-free unstake</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00bfff'}} />
                      <span>Claim rewards anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00bfff'}} />
                      <span>Early unstake warning: All rewards deducted from principal</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
                    <div className="text-sm font-bold mb-2" style={{color: '#00bfff'}}>💰 Staking Reward Example:</div>
                    <div className="text-xs text-gray-400">Stake 1M $MEMES → Earn ~10,000 $MEMES daily → 900,000 $MEMES in 90 days</div>
                  </div>
                  <div className="mt-3">
                    <Button 
                      size="lg" 
                      className="w-full" 
                      onClick={() => setLocation('/staking')}
                      style={{background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)', color: '#000'}} 
                      data-testid="button-goto-staking"
                    >
                      Go to Staking Page →
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-6 p-4 rounded-lg text-center" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
            <div className="text-sm font-bold mb-2" style={{color: '#00bfff'}}>🎯 Complete All 3 Steps to Maximize Your Earnings!</div>
            <div className="text-xs text-gray-400">Airdrop + Purchase + Staking = Maximum Profit Potential</div>
          </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* FAQ Section */}
        <Card className="p-6 glass-card">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#ffd700]">
                <h3 className="text-xl font-bold" style={{color: '#ffd700'}}>Frequently Asked Questions</h3>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p className="text-center text-gray-400 mb-6">Everything you need to know about Memes Everywhere</p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">What is Memes Everywhere?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      Memes Everywhere is a decentralized airdrop and staking platform for the MEMES token. We deliver tokens direct in your wallet while building the strongest meme community in crypto.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">How do I earn rewards?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      You can earn rewards through airdrops by completing social tasks, staking your MEMES tokens for up to 250% APY, and referring friends through our 3-level referral program.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">Is my investment safe?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      Yes, our smart contracts are audited and deployed on BNB Chain. We use industry-standard security practices and transparent tokenomics to ensure the safety of your investment.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">When can I withdraw my tokens?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      Airdrop tokens are immediately claimable to your wallet. Staked tokens can be withdrawn after the lock period ends, with flexible options from 1 month to 1 year.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">What are the tokenomics?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      Total supply: 1B MEMES tokens. Distribution: 50% Public Sale & Airdrops, 30% Staking Rewards, 20% Team & Development, 10% Marketing & Partnerships. Fixed supply with no inflation.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">How does staking work?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      Stake your MEMES tokens for flexible periods (1 month to 1 year) and earn up to 250% APY. Rewards are distributed daily and can be claimed anytime. The longer you stake, the higher the APY.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-8 p-6 rounded-xl text-center" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.15), rgba(0, 191, 255, 0.05))', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
                  <h4 className="text-lg font-bold mb-2" style={{color: '#00bfff'}}>💬 Still need help?</h4>
                  <p className="text-sm text-gray-400 mb-4">Our community team is here to help you get started with Memes Everywhere</p>
                  <a
                    href="https://t.me/memestakegroup"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" style={{background: '#00bfff', color: '#000'}} data-testid="button-faq-telegram">
                      💬 Join Telegram Group
                    </Button>
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* About Memes Everywhere */}
        <Card className="p-8 glass-card">
          <h2 className="text-3xl font-bold text-center mb-2" style={{color: '#ffd700'}}>About Memes Everywhere</h2>
          <p className="text-center text-gray-400 mb-4">Learn more about our platform and mission</p>
          
          <div className="text-center mb-8">
            <Button
              onClick={() => setLocation('/whitepaper')}
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                color: '#000',
                fontWeight: 'bold'
              }}
              data-testid="button-view-whitepaper"
            >
              📄 Read Our Whitepaper
            </Button>
          </div>
          
          <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1" style={{borderColor: 'rgba(0, 191, 255, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#00bfff]">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🚀</div>
                  <span className="text-lg font-semibold">Our Mission</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pt-4">
                <div className="pl-11">
                  <p>
                    Memes Everywhere is revolutionizing the meme coin ecosystem by combining decentralized airdrops with innovative staking mechanisms. We deliver tokens direct in your wallet while building the strongest meme community in crypto.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" style={{borderColor: 'rgba(0, 255, 136, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#00ff88]">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💎</div>
                  <span className="text-lg font-semibold">Why Choose Us?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 pt-4">
                <div className="pl-11 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{color: '#00ff88'}} />
                    <span>True decentralized rewards system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{color: '#00ff88'}} />
                    <span>Community-driven governance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{color: '#00ff88'}} />
                    <span>High-yield staking opportunities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" style={{color: '#00ff88'}} />
                    <span>Transparent tokenomics</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Join Our Community */}
        <Card className="p-8 glass-card text-center" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95), rgba(30, 15, 60, 0.95))', border: '2px solid rgba(0, 191, 255, 0.3)'}}>
          <h2 className="text-3xl font-bold mb-4" style={{color: '#00bfff'}}>Join Our Community</h2>
          <p className="text-gray-400 mb-8">Connect with 47,000+ members in our vibrant community! Get real-time updates, share strategies, and never miss an opportunity.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://t.me/memestakegroup"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl transition-all hover:scale-105"
              style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}
              data-testid="link-telegram-group"
            >
              <SiTelegram className="w-12 h-12 mx-auto mb-3" style={{color: '#00bfff'}} />
              <div className="font-bold mb-1" style={{color: '#00bfff'}}>Telegram Group</div>
              <div className="text-xs text-gray-400">Chat & Discussion</div>
            </a>

            <a
              href="https://t.me/memstakeofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl transition-all hover:scale-105"
              style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}
              data-testid="link-telegram-official"
            >
              <SiTelegram className="w-12 h-12 mx-auto mb-3" style={{color: '#ffd700'}} />
              <div className="font-bold mb-1" style={{color: '#ffd700'}}>Official Channel</div>
              <div className="text-xs text-gray-400">News & Updates</div>
            </a>

            <a
              href="https://twitter.com/memestake_official"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl transition-all hover:scale-105"
              style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)'}}
              data-testid="link-twitter"
            >
              <SiX className="w-12 h-12 mx-auto mb-3" style={{color: '#00ff88'}} />
              <div className="font-bold mb-1" style={{color: '#00ff88'}}>Twitter/X</div>
              <div className="text-xs text-gray-400">Follow Updates</div>
            </a>
          </div>
        </Card>

      </div>

      {/* Transaction Preview Modal */}
      {showBuyPreview && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowBuyPreview(false)}
          data-testid="modal-preview-overlay"
        >
          <div 
            className="rounded-2xl p-6 max-w-md w-full mx-auto backdrop-blur-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.98) 0%, rgba(30, 15, 60, 0.98) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-preview-content"
          >
            <h3 className="text-xl font-bold mb-4 text-center" style={{color: '#ffd700'}}>
              📋 Transaction Preview
            </h3>

            <div className="space-y-3">
              {/* Tokens to Receive */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
                <div className="text-sm text-muted-foreground mb-1">You will receive</div>
                <div className="text-2xl font-bold" style={{color: '#00bfff'}}>
                  {tokensToGet.toLocaleString()} $MEMES
                </div>
              </div>

              {/* Payment Amount */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/30">
                <span className="text-sm text-muted-foreground">Payment Amount</span>
                <span className="font-bold" style={{color: '#ffd700'}}>${usdAmount.toFixed(2)} USD</span>
              </div>

              {/* Estimated Gas */}
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/30">
                <span className="text-sm text-muted-foreground">Estimated Gas Fee</span>
                <span className="font-bold" style={{color: '#00bfff'}}>~0.0015 BNB</span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button 
                  variant="outline"
                  onClick={() => setShowBuyPreview(false)}
                  data-testid="button-cancel-purchase"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmPurchase}
                  style={{background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', color: '#000'}}
                  data-testid="button-confirm-purchase"
                >
                  Confirm Purchase
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setShowSuccessModal(false)}
          data-testid="modal-success-overlay"
        >
          <div 
            className="rounded-2xl p-8 max-w-md w-full mx-auto backdrop-blur-xl border text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.98) 0%, rgba(30, 15, 60, 0.98) 100%)',
              border: '2px solid rgba(0, 255, 136, 0.3)',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-success-content"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-3" style={{color: '#00ff88'}}>
              Purchase Successful!
            </h3>
            
            <div className="space-y-4 mb-6">
              {/* Tokens Purchased */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
                <div className="text-sm text-muted-foreground mb-1">Tokens Purchased</div>
                <div className="text-3xl font-bold" style={{color: '#00ff88'}}>
                  {purchasedTokens.toLocaleString()} $MEMES
                </div>
              </div>

              {/* Transaction Hash */}
              <div className="p-3 rounded-lg bg-black/30">
                <div className="text-xs text-muted-foreground mb-2">Transaction Hash</div>
                <div className="font-mono text-xs break-all" style={{color: '#00bfff'}}>
                  {txHash.slice(0, 20)}...{txHash.slice(-10)}
                </div>
              </div>
            </div>

            {/* Share Referral Link Button */}
            <Button 
              onClick={() => {
                copyReferralLink();
                setShowSuccessModal(false);
              }}
              className="w-full mb-3"
              style={{background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', color: '#000'}}
              data-testid="button-share-referral"
            >
              📤 Share Your Referral Link
            </Button>

            <Button 
              variant="outline"
              onClick={() => setShowSuccessModal(false)}
              className="w-full"
              data-testid="button-close-success"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}