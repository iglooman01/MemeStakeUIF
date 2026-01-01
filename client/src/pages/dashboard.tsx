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
import { SiTelegram, SiX, SiYoutube } from "react-icons/si";
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
  const [airdropRewards, setAirdropRewards] = useState(0);
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
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [tasksPending, setTasksPending] = useState<Record<string, boolean>>({
    telegram_group: false,
    telegram_channel: false,
    twitter: false,
    youtube: false
  });
  const [airdropClaimed, setAirdropClaimed] = useState(false);
  const [userClaimableAmount, setUserClaimableAmount] = useState(0);
  const [userClaimedAmount, setUserClaimedAmount] = useState(0);
  const [airdropTxHash, setAirdropTxHash] = useState<string>('');
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [contractWalletBalance, setContractWalletBalance] = useState<string>('');
  const [totalStakedAmount, setTotalStakedAmount] = useState(0);
  const [showAirdropContent, setShowAirdropContent] = useState(false);
  const [isLoadingStakes, setIsLoadingStakes] = useState(false);
  const [pendingStakingRewards, setPendingStakingRewards] = useState(0);
  const [accruedToday, setAccruedToday] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [presaleReferralRewards, setPresaleReferralRewards] = useState(0); // From MEMES_PRESALE contract
  const [level1AirdropRewards, setLevel1AirdropRewards] = useState(0);
  const [level1StakingRewards, setLevel1StakingRewards] = useState(0);
  const [level2AirdropRewards, setLevel2AirdropRewards] = useState(0);
  const [level2StakingRewards, setLevel2StakingRewards] = useState(0);
  const [level3AirdropRewards, setLevel3AirdropRewards] = useState(0);
  const [level3StakingRewards, setLevel3StakingRewards] = useState(0);
  const [level1ReferralCount, setLevel1ReferralCount] = useState(0);
  const [level2ReferralCount, setLevel2ReferralCount] = useState(0);
  const [level3ReferralCount, setLevel3ReferralCount] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(600); // Default BNB price in USD
  const [currentChainId, setCurrentChainId] = useState<string | null>(null);
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
  const [bnbWalletBalance, setBnbWalletBalance] = useState<number>(0);
  
  const { toast } = useToast();
  
  // Minimum BNB required for gas fees (0.001 BNB)
  const MIN_GAS_FEE_BNB = 0.001;
  
  const BSC_TESTNET_CHAIN_ID = '0x61'; // 97 in decimal

  // Helper function to validate Ethereum address
  const isValidEthereumAddress = (address: string): boolean => {
    if (!address) return false;
    // Check if it's a valid hex address (0x followed by 40 hex characters)
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
  };

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

  // Fetch total tokens purchased from transactions
  const { data: totalPurchasedTokens = 0 } = useQuery<number>({
    queryKey: ['/api/transactions', walletAddress, 'Token Purchase'],
    enabled: !!walletAddress,
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${walletAddress}/type/Token Purchase`);
      if (!response.ok) return 0;
      const transactions = await response.json();
      
      // Sum up all token purchase amounts
      const total = transactions.reduce((sum: number, tx: any) => {
        return sum + parseFloat(tx.amount || 0);
      }, 0);
      
      return total;
    },
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
  const isExported = participant?.exported || false; // Check if user has been exported to smart contract
  
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

  // Resend OTP cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "✅ Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  // Send OTP mutation
  const sendOtpMutation = useMutation({
    mutationFn: async (data: { email: string; walletAddress: string; sponsorCode?: string }) => {
      const res = await apiRequest('POST', '/api/airdrop/send-otp', data);
      return await res.json();
    },
    onSuccess: () => {
      setShowOtpInput(true);
      setIsSendingOtp(false);
      toast({
        title: "📧 OTP Sent!",
        description: `Verification code sent to ${email}`,
      });
    },
    onError: (error: any) => {
      setIsSendingOtp(false);
      toast({
        title: "❌ Failed to Send OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string; walletAddress: string; sponsorCode?: string }) => {
      const res = await apiRequest('POST', '/api/airdrop/verify-otp', data);
      return await res.json();
    },
    onSuccess: () => {
      setIsVerifyingOtp(false);
      queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status', walletAddress] });
      toast({
        title: "✅ Email Verified!",
        description: "You can now claim your airdrop tokens",
      });
    },
    onError: (error: any) => {
      setIsVerifyingOtp(false);
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
    
    setIsSendingOtp(true);
    sendOtpMutation.mutate({ 
      email, 
      walletAddress, 
      sponsorCode: sponsorAddress || referralCode 
    });
    setResendCooldown(60); // Start 60 second cooldown
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "❌ Invalid OTP",
        description: "Please enter the 6-digit verification code",
      });
      return;
    }
    
    setIsVerifyingOtp(true);
    verifyOtpMutation.mutate({ 
      email, 
      otp, 
      walletAddress,
      sponsorCode: sponsorAddress || referralCode 
    });
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setIsSendingOtp(true);
    sendOtpMutation.mutate({ 
      email, 
      walletAddress,
      sponsorCode: sponsorAddress || referralCode
    });
    setResendCooldown(60);
    toast({
      title: "📧 OTP Resent",
      description: "Check your email for the new verification code",
    });
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

  // Claim airdrop from smart contract
  const handleClaimAirdrop = async () => {
    if (!walletAddress) {
      toast({
        title: "❌ No Wallet",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    // Check if user has already claimed
    if (airdropClaimed) {
      toast({
        title: "🎉 You've already claimed your airdrop!",
        description: (
          <div className="space-y-2 mt-2">
            <p className="text-sm">✅ {userClaimableAmount.toLocaleString()} MEMES tokens have been sent to your wallet.</p>
            <p className="text-sm">💰 Want to earn more MEMES tokens?</p>
            <p className="text-xs text-muted-foreground">Invite your friends using your referral link and build your team to earn extra rewards</p>
          </div>
        ),
      });
      return;
    }

    // Check if all tasks are completed
    if (!allTasksCompleted) {
      toast({
        title: "❌ Tasks Incomplete",
        description: "Complete all social media tasks before claiming your airdrop",
        variant: "destructive"
      });
      return;
    }

    // Check if user has claimable amount (allow if exported even if contract amount is 0)
    if (!isExported && userClaimableAmount <= 0) {
      toast({
        title: "❌ No Claimable Tokens",
        description: "You don't have any tokens to claim",
        variant: "destructive"
      });
      return;
    }

    // Check BNB balance for gas fees
    if (bnbWalletBalance < MIN_GAS_FEE_BNB) {
      toast({
        title: "⚠️ Insufficient Gas Fee",
        description: "Please add BNB to claim your airdrop. Minimum 0.001 BNB required for gas fees.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsClaimingAirdrop(true);

      // Check if airdrop contract has enough MEMES tokens
      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      const airdropContractBalance = await publicClient.readContract({
        address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
        abi: CONTRACTS.MEMES_TOKEN.abi,
        functionName: 'balanceOf',
        args: [CONTRACTS.MEMES_AIRDROP.address]
      }) as bigint;

      // Convert userClaimableAmount to wei (18 decimals)
      const claimableInWei = BigInt(Math.floor(userClaimableAmount)) * BigInt('1000000000000000000');

      if (airdropContractBalance < claimableInWei) {
        toast({
          title: "⚠️ Insufficient Contract Balance",
          description: (
            <div className="space-y-2 mt-2">
              <p className="text-sm">The airdrop contract doesn't have enough MEMES tokens right now.</p>
              <p className="text-xs text-muted-foreground">Please contact support or try again later.</p>
            </div>
          ),
          variant: "destructive"
        });
        setIsClaimingAirdrop(false);
        return;
      }

      // Get wallet client based on wallet type
      let walletClient;
      const normalizedWalletType = walletType.toLowerCase().replace(/\s+/g, '');
      
      if (normalizedWalletType === 'metamask' && window.ethereum) {
        walletClient = createWalletClient({
          account: walletAddress as `0x${string}`,
          chain: bscTestnet,
          transport: custom(window.ethereum)
        });
      } else if (normalizedWalletType === 'trustwallet' && (window as any).trustwallet) {
        walletClient = createWalletClient({
          account: walletAddress as `0x${string}`,
          chain: bscTestnet,
          transport: custom((window as any).trustwallet)
        });
      } else if (normalizedWalletType === 'safepal' && (window as any).safepalProvider) {
        walletClient = createWalletClient({
          account: walletAddress as `0x${string}`,
          chain: bscTestnet,
          transport: custom((window as any).safepalProvider)
        });
      } else {
        throw new Error('Wallet not available');
      }

      // Call claimAirdrop function from airdrop contract
      const hash = await walletClient.writeContract({
        address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
        abi: CONTRACTS.MEMES_AIRDROP.abi,
        functionName: 'claimAirdrop',
        args: []
      });

      toast({
        title: "⏳ Transaction Submitted",
        description: "Claiming your airdrop...",
      });

      // Wait for transaction confirmation (reuse publicClient from balance check)
      await publicClient.waitForTransactionReceipt({ hash });

      setAirdropTxHash(hash);
      setAirdropClaimed(true);

      toast({
        title: "🎉 Airdrop Claimed!",
        description: `${userClaimableAmount.toLocaleString()} MEMES tokens have been sent to your wallet`,
      });

      // Refresh all page data after successful claim
      setTimeout(async () => {
        await fetchBalances(); // Refresh balances, staking data, and airdrop claim status
        refetchAirdrop(); // Refresh airdrop backend data
      }, 2000);

    } catch (error: any) {
      console.error('Airdrop claim error:', error);
      
      let errorMessage = error.message || 'Failed to claim airdrop';
      
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
      setIsClaimingAirdrop(false);
    }
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
            BigInt(0) // tokenAmount = 0 for BNB            
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

        // Save transaction to database
        try {
          await apiRequest('POST', '/api/transactions', {
            walletAddress: walletAddress.toLowerCase(),
            transactionType: 'Token Purchase',
            amount: tokensToGet.toString(),
            tokenSymbol: 'MEMES',
            transactionHash: hash,
            status: 'confirmed'
          });
        } catch (err) {
          console.error('Failed to save transaction:', err);
        }

        // Wait a bit then show success modal and refresh balances
        setTimeout(() => {
          setIsPurchasing(false);
          setShowSuccessModal(true);
          setBuyAmount('');
          
          // Invalidate all queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status'] });
          queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
          
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
            usdtAmountInWei // tokenAmount in wei            
          ],
          account: walletAddress as `0x${string}`
        });

        setTxHash(hash);
        setPurchasedTokens(tokensToGet);

        toast({
          title: "✅ Purchase Successful!",
          description: `Transaction submitted. Hash: ${hash.slice(0, 10)}...`,
        });

        // Save transaction to database
        try {
          await apiRequest('POST', '/api/transactions', {
            walletAddress: walletAddress.toLowerCase(),
            transactionType: 'Token Purchase',
            amount: tokensToGet.toString(),
            tokenSymbol: 'MEMES',
            transactionHash: hash,
            status: 'confirmed'
          });
        } catch (err) {
          console.error('Failed to save transaction:', err);
        }

        // Wait a bit then show success modal and refresh balances
        setTimeout(() => {
          setIsPurchasing(false);
          setShowSuccessModal(true);
          setBuyAmount('');
          
          // Invalidate all queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status'] });
          queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
          
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
      const normalizedWalletType = walletType.toLowerCase().replace(/\s+/g, '');
      
      if (normalizedWalletType === 'metamask' && window.ethereum) {
        walletClient = createWalletClient({
          account: walletAddress as `0x${string}`,
          chain: bscTestnet,
          transport: custom(window.ethereum)
        });
      } else if (normalizedWalletType === 'trustwallet' && (window as any).trustwallet) {
        walletClient = createWalletClient({
          account: walletAddress as `0x${string}`,
          chain: bscTestnet,
          transport: custom((window as any).trustwallet)
        });
      } else if (normalizedWalletType === 'safepal' && (window as any).safepalProvider) {
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

      // Save transaction records to database
      try {
        // 1. Save staking rewards transaction if there are staking rewards
        if (pendingStakingRewards > 0) {
          console.log('Saving claim staking rewards transaction:', pendingStakingRewards);
          
          const stakingResponse = await apiRequest('POST', '/api/transactions', {
            walletAddress: walletAddress,
            transactionType: 'Claim Staking Rewards',
            amount: pendingStakingRewards.toString(),
            tokenSymbol: 'MEMES',
            transactionHash: hash,
            status: 'pending'
          });
          const stakingTransaction = await stakingResponse.json();
          console.log('✅ Claim staking rewards transaction saved:', stakingTransaction);
        }

        // 2. Save referral rewards transaction if there are referral rewards
        if (referralEarnings > 0) {
          console.log('Saving claim referral rewards transaction:', referralEarnings);
          
          const referralResponse = await apiRequest('POST', '/api/transactions', {
            walletAddress: walletAddress,
            transactionType: 'Claim Referral Rewards',
            amount: referralEarnings.toString(),
            tokenSymbol: 'MEMES',
            transactionHash: hash,
            status: 'pending'
          });
          const referralTransaction = await referralResponse.json();
          console.log('✅ Claim referral rewards transaction saved:', referralTransaction);
        }
      } catch (dbError) {
        console.error('❌ Error saving claim transactions:', dbError);
        // Don't stop the process, just log the error
      }

      // Wait for transaction confirmation
      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      await publicClient.waitForTransactionReceipt({ hash });

      // Update transaction status to confirmed
      try {
        await apiRequest('PUT', `/api/transactions/${hash}/status`, {
          status: 'confirmed'
        });
        console.log('✅ Transaction status updated to confirmed');
      } catch (dbError) {
        console.error('Error updating transaction status:', dbError);
      }

      toast({
        title: "🎉 Rewards Claimed!",
        description: `Successfully claimed ${claimableAmount.toLocaleString()} $MEMES to your wallet`,
      });

      // Invalidate transactions query to refresh income history
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });

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
    
    // Validate stored wallet address
    if (storedAddress && isValidEthereumAddress(storedAddress)) {
      setWalletAddress(storedAddress);
      if (storedWalletType) {
        setWalletType(storedWalletType);
      }
    } else if (storedAddress && !isValidEthereumAddress(storedAddress)) {
      // Clear invalid wallet data
      console.warn('Invalid wallet address found in localStorage, clearing...');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('walletType');
      localStorage.removeItem('walletConnected');
      sessionStorage.removeItem('walletSession');
      
      toast({
        title: "⚠️ Invalid Wallet Detected",
        description: "Please reconnect your wallet to continue",
        variant: "destructive"
      });
      
      // Redirect to home page
      setTimeout(() => {
        setLocation('/');
      }, 2000);
    }
  }, []);

  // Listen for wallet account changes
  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('Wallet account changed:', accounts);
      
      if (accounts.length === 0) {
        // User disconnected their wallet
        console.log('No accounts connected');
        handleDisconnectWallet();
      } else {
        const newAddress = accounts[0].toLowerCase(); // Normalize to lowercase
        
        // Validate the new address
        if (isValidEthereumAddress(newAddress)) {
          console.log('Switching to new wallet:', newAddress);
          
          // Update state and localStorage
          setWalletAddress(newAddress);
          localStorage.setItem('walletAddress', newAddress);
          
          // Invalidate all queries to fetch fresh data for new wallet
          queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status'] });
          queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
          
          // Reset all state values to trigger refetch
          setTokenBalance(0);
          setTotalStakedAmount(0);
          setPendingStakingRewards(0);
          setAccruedToday(0);
          setReferralEarnings(0);
          setPresaleReferralRewards(0);
          setLevel1AirdropRewards(0);
          setLevel2AirdropRewards(0);
          setLevel3AirdropRewards(0);
          setLevel1StakingRewards(0);
          setLevel2StakingRewards(0);
          setLevel3StakingRewards(0);
          setLevel1ReferralCount(0);
          setLevel2ReferralCount(0);
          setLevel3ReferralCount(0);
          
          // Show notification to user
          toast({
            title: "🔄 Wallet Changed",
            description: `Switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}. Refreshing data...`,
          });
          
          // Force immediate refresh by waiting a tiny bit for state to update
          setTimeout(() => {
            // Manually fetch all data for the new wallet using the new address
            const fetchNewWalletData = async () => {
              try {
                const publicClient = createPublicClient({
                  chain: bscTestnet,
                  transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
                });

                // Fetch balance
                const balance = await publicClient.readContract({
                  address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
                  abi: CONTRACTS.MEMES_TOKEN.abi,
                  functionName: 'balanceOf',
                  args: [newAddress as `0x${string}`]
                }) as bigint;
                setTokenBalance(Number(balance) / 1e18);

                // Fetch staked data
                const activeStakes = await publicClient.readContract({
                  address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
                  abi: CONTRACTS.MEMES_STAKE.abi,
                  functionName: 'getActiveStakesWithId',
                  args: [newAddress as `0x${string}`]
                }) as any[];

                let totalStaked = 0;
                for (const stakeWithId of activeStakes) {
                  totalStaked += Number(stakeWithId.details.amount) / 1e18;
                }
                setTotalStakedAmount(totalStaked);

                // Fetch pending rewards
                const pendingRewards = await publicClient.readContract({
                  address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
                  abi: CONTRACTS.MEMES_STAKE.abi,
                  functionName: 'getPendingRewards',
                  args: [newAddress as `0x${string}`]
                }) as bigint;
                setPendingStakingRewards(Number(pendingRewards) / 1e18);

                // Calculate accrued today
                const currentTime = Math.floor(Date.now() / 1000);
                let todayAccrued = 0;
                for (const stake of activeStakes) {
                  if (stake.details && stake.details.isActive) {
                    const lastClaimTime = Number(stake.details.lastClaimTime);
                    if (lastClaimTime + (24 * 60 * 60) <= currentTime) {
                      todayAccrued += (Number(stake.details.amount) / 1e18) * 0.01;
                    }
                  }
                }
                setAccruedToday(todayAccrued);

                // Fetch referral rewards
                const rewardsByLevel = await publicClient.readContract({
                  address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
                  abi: CONTRACTS.MEMES_STAKE.abi,
                  functionName: 'getTotalRewardsByReferralLevel',
                  args: [newAddress as `0x${string}`]
                }) as any[];
                setReferralEarnings(Number(rewardsByLevel[0] || 0) / 1e18);

                // Fetch airdrop data
                const claimableAmount = await publicClient.readContract({
                  address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
                  abi: CONTRACTS.MEMES_AIRDROP.abi,
                  functionName: 'userClaimableAmount',
                  args: [newAddress as `0x${string}`]
                }) as bigint;
                setUserClaimableAmount(Number(claimableAmount) / 1e18);

                const hasClaimedAirdrop = await publicClient.readContract({
                  address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
                  abi: CONTRACTS.MEMES_AIRDROP.abi,
                  functionName: 'airdropClaimed',
                  args: [newAddress as `0x${string}`]
                }) as boolean;
                setAirdropClaimed(hasClaimedAirdrop);
              } catch (error) {
                console.error('Error fetching new wallet data:', error);
              }
            };
            
            fetchNewWalletData();
          }, 100);
        } else {
          console.warn('Invalid wallet address received:', newAddress);
          toast({
            title: "⚠️ Invalid Wallet",
            description: "The new wallet address is invalid",
            variant: "destructive"
          });
        }
      }
    };

    // Add event listeners for all wallet providers
    const providers = [];
    
    if (window.ethereum) {
      providers.push({ provider: window.ethereum, name: 'MetaMask/Default' });
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    if ((window as any).trustwallet) {
      providers.push({ provider: (window as any).trustwallet, name: 'Trust Wallet' });
      (window as any).trustwallet.on('accountsChanged', handleAccountsChanged);
    }
    
    if ((window as any).safepalProvider) {
      providers.push({ provider: (window as any).safepalProvider, name: 'SafePal' });
      (window as any).safepalProvider.on('accountsChanged', handleAccountsChanged);
    }

    console.log('Wallet change listeners registered for:', providers.map(p => p.name).join(', '));

    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
      if ((window as any).trustwallet?.removeListener) {
        (window as any).trustwallet.removeListener('accountsChanged', handleAccountsChanged);
      }
      if ((window as any).safepalProvider?.removeListener) {
        (window as any).safepalProvider.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Poll for wallet address changes (since event listeners don't work reliably with mobile wallets)
  useEffect(() => {
    if (!walletAddress) return;

    const checkWalletChange = async () => {
      try {
        let currentAddress: string | null = null;
        
        // Try to get current address from the active wallet provider
        if (window.ethereum && typeof window.ethereum.request === 'function') {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            currentAddress = accounts[0].toLowerCase();
          }
        }

        // If we found an address and it's different from the stored one
        if (currentAddress && currentAddress !== walletAddress.toLowerCase()) {
          console.log('🔄 Wallet changed detected via polling:', currentAddress);
          
          // Update state and localStorage
          setWalletAddress(currentAddress);
          localStorage.setItem('walletAddress', currentAddress);
          
          // Reset all state values
          setTokenBalance(0);
          setTotalStakedAmount(0);
          setPendingStakingRewards(0);
          setAccruedToday(0);
          setReferralEarnings(0);
          setPresaleReferralRewards(0);
          //setLevel1AirdropRewards(0);
          //setLevel2AirdropRewards(0);
         // setLevel3AirdropRewards(0);
          //setLevel1StakingRewards(0);
          //setLevel2StakingRewards(0);
          //setLevel3StakingRewards(0);
          //setLevel1ReferralCount(0);
          //setLevel2ReferralCount(0);
          //setLevel3ReferralCount(0);
          
          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['/api/airdrop/status'] });
          queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
          
          // Show notification
          toast({
            title: "🔄 Wallet Changed",
            description: `Switched to ${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}. Refreshing data...`,
          });
          
          // Fetch new wallet data
          setTimeout(async () => {
            try {
              const publicClient = createPublicClient({
                chain: bscTestnet,
                transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
              });

              const balance = await publicClient.readContract({
                address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
                abi: CONTRACTS.MEMES_TOKEN.abi,
                functionName: 'balanceOf',
                args: [currentAddress as `0x${string}`]
              }) as bigint;
              setTokenBalance(Number(balance) / 1e18);

              const activeStakes = await publicClient.readContract({
                address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
                abi: CONTRACTS.MEMES_STAKE.abi,
                functionName: 'getActiveStakesWithId',
                args: [currentAddress as `0x${string}`]
              }) as any[];

              let totalStaked = 0;
              for (const stakeWithId of activeStakes) {
                totalStaked += Number(stakeWithId.details.amount) / 1e18;
              }
              setTotalStakedAmount(totalStaked);

              const pendingRewards = await publicClient.readContract({
                address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
                abi: CONTRACTS.MEMES_STAKE.abi,
                functionName: 'getPendingRewards',
                args: [currentAddress as `0x${string}`]
              }) as bigint;
              setPendingStakingRewards(Number(pendingRewards) / 1e18);

              const currentTime = Math.floor(Date.now() / 1000);
              let todayAccrued = 0;
              for (const stake of activeStakes) {
                if (stake.details && stake.details.isActive) {
                  const lastClaimTime = Number(stake.details.lastClaimTime);
                  if (lastClaimTime + (24 * 60 * 60) <= currentTime) {
                    todayAccrued += (Number(stake.details.amount) / 1e18) * 0.01;
                  }
                }
              }
              setAccruedToday(todayAccrued);

              const rewardsByLevel = await publicClient.readContract({
                address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
                abi: CONTRACTS.MEMES_STAKE.abi,
                functionName: 'getTotalRewardsByReferralLevel',
                args: [currentAddress as `0x${string}`]
              }) as any[];
              setReferralEarnings(Number(rewardsByLevel[0] || 0) / 1e18);

              const claimableAmount = await publicClient.readContract({
                address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
                abi: CONTRACTS.MEMES_AIRDROP.abi,
                functionName: 'userClaimableAmount',
                args: [currentAddress as `0x${string}`]
              }) as bigint;
              setUserClaimableAmount(Number(claimableAmount) / 1e18);

              const hasClaimedAirdrop = await publicClient.readContract({
                address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
                abi: CONTRACTS.MEMES_AIRDROP.abi,
                functionName: 'airdropClaimed',
                args: [currentAddress as `0x${string}`]
              }) as boolean;
              setAirdropClaimed(hasClaimedAirdrop);
            } catch (error) {
              console.error('Error fetching new wallet data:', error);
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error checking wallet change:', error);
      }
    };

    // Check every 3 seconds
    const walletCheckInterval = setInterval(checkWalletChange, 3000);

    return () => clearInterval(walletCheckInterval);
  }, [walletAddress]);

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

          // Call calculatememesTokens from contract (lowercase function name)
          const memesTokens = await publicClient.readContract({
            address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_PRESALE.abi,
            functionName: 'calculatememesTokens',
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
        // For BNB, first convert to USD then to MEME tokens
        const usdValue = amount * bnbPrice;
        setEstimatedTokens(usdValue / TOKEN_PRICE);
      }
    };

    calculateEstimatedTokens();
  }, [buyAmount, paymentMethod, bnbPrice]);

  // Fetch sponsor address from contract
  useEffect(() => {
    const fetchSponsorAddress = async () => {
      if (!walletAddress || !isValidEthereumAddress(walletAddress)) {
        console.warn('Invalid wallet address, skipping sponsor fetch');
        return;
      }

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
            address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
            abi: CONTRACTS.MEMES_AIRDROP.abi,
            functionName: 'referrer',
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
    if (!walletAddress || !isValidEthereumAddress(walletAddress)) {
      console.warn('Invalid wallet address, skipping balance fetch');
      setIsLoadingBalances(false);
      return;
    }

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

      // Fetch referral rewards from MEMES_PRESALE contract using referralRewardByLevel (levels 0-2)
      try {
        let totalPresaleRewards = 0;
        for (let level = 0; level < 3; level++) {
          const reward = await publicClient.readContract({
            address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_PRESALE.abi,
            functionName: 'referralRewardByLevel',
            args: [walletAddress as `0x${string}`, BigInt(level)]
          }) as bigint;

          totalPresaleRewards += Number(reward) / 1e18;
        }
        
        console.log('Total presale referral rewards (levels 0-2):', totalPresaleRewards);
        setPresaleReferralRewards(totalPresaleRewards);
      } catch (presaleError) {
        console.error('Error fetching presale referral rewards:', presaleError);
        setPresaleReferralRewards(0);
      }

      // Fetch referral rewards from airdrop contract using getTotalRewardsByReferralLevel
      try {
        const rewardsByLevel = await publicClient.readContract({
          address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
          abi: CONTRACTS.MEMES_AIRDROP.abi,
          functionName: 'getTotalRewardsByReferralLevel',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        console.log('Rewards by referral level raw response:', rewardsByLevel);

        // Contract returns tuple: [totalRewardsByreferral, level1Total, level2Total, level3Total]
        // Access by index
        const totalRewards = Number(rewardsByLevel[0] || 0) / 1e18;
        const level1Rewards = Number(rewardsByLevel[1] || 0) / 1e18;
        const level2Rewards = Number(rewardsByLevel[2] || 0) / 1e18;
        const level3Rewards = Number(rewardsByLevel[3] || 0) / 1e18;

        console.log('Total referral rewards:', totalRewards);
        console.log('Level 1 rewards:', level1Rewards);
        console.log('Level 2 rewards:', level2Rewards);
        console.log('Level 3 rewards:', level3Rewards);

        setAirdropRewards(totalRewards);
        setReferralEarnings(totalRewards); // Set total referral earnings
        setLevel1AirdropRewards(level1Rewards);
        setLevel2AirdropRewards(level2Rewards);
        setLevel3AirdropRewards(level3Rewards);
      } catch (rewardsError) {
        console.error('Error fetching referral rewards:', rewardsError);
        setAirdropRewards(0);
        setReferralEarnings(0); // Reset referral earnings on error
        setLevel1AirdropRewards(0);
        setLevel2AirdropRewards(0);
        setLevel3AirdropRewards(0);
      }

      // Fetch referral count from airdrop contract using getReferralCounts
      try {
        const referralCountByLevel = await publicClient.readContract({
          address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
          abi: CONTRACTS.MEMES_AIRDROP.abi,
          functionName: 'getReferralCounts',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        console.log('count by referral level raw response:', referralCountByLevel);

        // Contract returns tuple: [level1, level2, level3]
        // Access by index        
        const level1Count = Number(referralCountByLevel[0] || 0) ;
        const level2Count = Number(referralCountByLevel[1] || 0) ;
        const level3Count = Number(referralCountByLevel[2] || 0) ;

        
        console.log('Level 1 count:', level1Count);
        console.log('Level 2 count:', level2Count);
        console.log('Level 3 count:', level3Count);
        
        setLevel1ReferralCount(level1Count);
        setLevel2ReferralCount(level2Count);
        setLevel3ReferralCount(level3Count);
      } catch (countError) {
        console.error('Error fetching referral rewards:', countError);
        
        setLevel1ReferralCount(0);
        setLevel2ReferralCount(0);
        setLevel3ReferralCount(0);
      }
      

      // Fetch total staked amount and pending rewards from staking contract
      try {
        console.log('Fetching stakes for wallet:', walletAddress);
        console.log('Staking contract address:', CONTRACTS.MEMES_STAKE.address);
        
        // Use getActiveStakesWithId to get active stakes
        const activeStakes = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getActiveStakesWithId',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        console.log('Active stakes received:', activeStakes);
        console.log('Number of active stakes:', activeStakes?.length || 0);

        // Sum up all active stake amounts
        let totalStaked = 0;
        for (const stakeWithId of activeStakes) {
          const stakeAmount = Number(stakeWithId.details.amount) / 1e18;
          console.log('Active stake amount:', stakeAmount);
          totalStaked += stakeAmount;
        }
        
        console.log('Total staked amount:', totalStaked);
        setTotalStakedAmount(totalStaked);

        // Use getPendingRewards to get claimable rewards
        const pendingRewards = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getPendingRewards',
          args: [walletAddress as `0x${string}`]
        }) as bigint;

        const claimableAmount = Number(pendingRewards) / 1e18;
        console.log('Pending/Claimable rewards:', claimableAmount);
        setPendingStakingRewards(claimableAmount);

        // Calculate Accrued Today: 1% of active stakes whose lastClaim + 24 hours <= currentTime
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        
        let todayAccrued = 0;
        
        for (const stake of activeStakes) {
          if (stake.details && stake.details.isActive) {
            const lastClaimTime = Number(stake.details.lastClaimTime);
            // If 24 hours have passed since last claim
            if (lastClaimTime + (24 * 60 * 60) <= currentTime) {
              todayAccrued += (Number(stake.details.amount) / 1e18) * 0.01; // 1% of stake
            }
          }
        }
        
        console.log('Accrued today:', todayAccrued);
        setAccruedToday(todayAccrued);
      } catch (stakeError) {
        console.error('Error fetching staked amount:', stakeError);
        setTotalStakedAmount(0);
        setPendingStakingRewards(0);
        setAccruedToday(0);
      }

      // Fetch staked amounts by referral level
      try {
        const stakedByLevel = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getTotalStakedByReferralLevel',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        console.log('Staked by referral level raw response:', stakedByLevel);

        // Contract returns tuple: [level1Total, level2Total, level3Total]
        // Access by index, not property name
        const level1Staked = Number(stakedByLevel[0] || 0) / 1e18;
        const level2Staked = Number(stakedByLevel[1] || 0) / 1e18;
        const level3Staked = Number(stakedByLevel[2] || 0) / 1e18;

        console.log('Level 1 staking rewards:', level1Staked);
        console.log('Level 2 staking rewards:', level2Staked);
        console.log('Level 3 staking rewards:', level3Staked);

        setLevel1StakingRewards(level1Staked);
        setLevel2StakingRewards(level2Staked);
        setLevel3StakingRewards(level3Staked);
      } catch (stakedError) {
        console.error('Error fetching staked by referral level:', stakedError);
        setLevel1StakingRewards(0);
        setLevel2StakingRewards(0);
        setLevel3StakingRewards(0);
      }

      // Check if user has already claimed airdrop from airdrop contract
      try {
        const [claimed, claimableAmount, claimedAmount] = await Promise.all([
          publicClient.readContract({
            address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
            abi: CONTRACTS.MEMES_AIRDROP.abi,
            functionName: 'hasClaimed',
            args: [walletAddress as `0x${string}`]
          }) as Promise<boolean>,
          publicClient.readContract({
            address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
            abi: CONTRACTS.MEMES_AIRDROP.abi,
            functionName: 'userClaimable',
            args: [walletAddress as `0x${string}`]
          }) as Promise<bigint>,
          publicClient.readContract({
            address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
            abi: CONTRACTS.MEMES_AIRDROP.abi,
            functionName: 'userClaimed',
            args: [walletAddress as `0x${string}`]
          }) as Promise<bigint>
        ]);

        console.log('Airdrop claimed status:', claimed);
        console.log('User claimable amount:', Number(claimableAmount) / 1e18);
        
        setAirdropClaimed(claimed);
        setUserClaimedAmount(Number(claimedAmount) / 1e18);
        setUserClaimableAmount(Number(claimableAmount) / 1e18);
      } catch (claimError) {
        console.error('Error checking airdrop claim status:', claimError);
        setAirdropClaimed(false);
        setUserClaimableAmount(0);
        setUserClaimedAmount(0);
      }

      // Fetch BNB balance for gas fee check
      try {
        const bnbBalance = await publicClient.getBalance({
          address: walletAddress as `0x${string}`
        });
        const bnbBalanceInEther = Number(bnbBalance) / 1e18;
        console.log('BNB wallet balance:', bnbBalanceInEther);
        setBnbWalletBalance(bnbBalanceInEther);
      } catch (bnbError) {
        console.error('Error fetching BNB balance:', bnbError);
        setBnbWalletBalance(0);
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

  // Airdrop countdown timer - January 25, 2026 at 09:30:30
  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Target date: January 25, 2026 at 09:30:30
      const targetDate = new Date('2026-01-25T09:30:30');
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setAirdropTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setAirdropTime({ days, hours, minutes, seconds });
    };
    
    // Calculate immediately
    calculateTimeRemaining();
    
    // Update every second
    const timer = setInterval(calculateTimeRemaining, 1000);
    
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
    toast({
      title: "Staking Program Launching Soon!!",
      description: "Stay tuned for our staking program launch.",
    });
  };

  return (
    <div className="min-h-screen text-foreground" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1421 100%)'}} data-testid="dashboard-page">
      
      {/* Live Join Notifications */}
      <LiveJoinNotification />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md" style={{background: 'rgba(15, 10, 35, 0.95)'}} data-testid="dashboard-header">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img 
                src={memeStakeLogo} 
                alt="MEMES STAKE Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg cursor-pointer transition-transform hover:scale-105"
                style={{filter: 'drop-shadow(0 4px 20px rgba(255, 215, 0, 0.4))'}}
                onClick={() => setLocation('/')}
                data-testid="logo-memestake"
              />
              <span className="text-lg sm:text-xl font-bold hidden sm:block" style={{color: '#ffd700'}}>MEMES STAKE</span>
            </div>
            
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setLocation('/dashboard')}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-[#ffd700] px-2 py-1"
                style={{color: location === '/dashboard' ? '#ffd700' : '#ffffff'}}
                data-testid="nav-dashboard"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Dashboard</span>
              </button>
              
              <button
                onClick={() => setLocation('/')}
                className="flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-[#ffd700] px-2 py-1"
                data-testid="nav-about"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">About</span>
              </button>
              
              <button
                onClick={() => {
                  setLocation('/');
                  setTimeout(() => {
                    const element = document.getElementById('tokenomics');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-[#ffd700] px-2 py-1"
                data-testid="nav-tokenomics"
              >
                <Coins className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Tokenomics</span>
              </button>
              
              <a
                href="https://t.me/memestakegroup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-white transition-colors hover:text-[#00bfff] px-2 py-1 rounded-lg"
                style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}
                data-testid="nav-telegram"
              >
                <SiTelegram className="w-3.5 h-3.5" style={{color: '#00bfff'}} />
                <span className="hidden lg:inline">Telegram</span>
              </a>
            </nav>

            {/* Wallet Info & Disconnect */}
            <div className="flex items-center space-x-3">
              {/* Telegram Channel Link */}
              <a
                href="https://t.me/memstakeofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-lg transition-all duration-300 hover:scale-110"
                style={{background: 'rgba(0, 191, 255, 0.15)', border: '1px solid rgba(0, 191, 255, 0.4)'}}
                title="Official Telegram Channel"
                data-testid="header-telegram-channel-link"
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

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
        
        {/* Welcome & Airdrop Timer - Compact */}
        <Card className="p-3 sm:p-4 glass-card">
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold mb-2" style={{color: '#ffd700'}}>
              🎉 Welcome to $MEMES STAKE Dashboard
            </h1>
            
            {/* Airdrop Countdown - Compact */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-2 sm:p-3 border border-primary/20">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-base sm:text-lg">⏰</span>
                <span className="text-xs sm:text-sm font-semibold" style={{color: '#00bfff'}}>AIRDROP ENDS IN</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.days).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">DAYS</div>
                </div>
                <div className="text-sm font-bold" style={{color: '#ffd700'}}>:</div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">HRS</div>
                </div>
                <div className="text-sm font-bold" style={{color: '#ffd700'}}>:</div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">MIN</div>
                </div>
                <div className="text-sm font-bold" style={{color: '#ffd700'}}>:</div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-muted-foreground">SEC</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Wrong Network Warning - Compact */}
        {walletAddress && currentChainId && currentChainId !== BSC_TESTNET_CHAIN_ID && (
          <Card className="p-3 border-2 animate-pulse" style={{
            borderColor: 'rgba(255, 0, 0, 0.5)',
            background: 'rgba(255, 0, 0, 0.1)'
          }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" style={{color: '#ff4444'}} />
                <div>
                  <h3 className="font-bold text-sm" style={{color: '#ff4444'}}>Wrong Network</h3>
                  <p className="text-xs text-muted-foreground">
                    Switch to BSC Testnet (Chain ID: 97)
                  </p>
                </div>
              </div>
              <Button 
                onClick={switchToBscTestnet}
                disabled={isCheckingNetwork}
                size="sm"
                className="text-xs whitespace-nowrap"
                style={{
                  background: '#ff4444',
                  color: '#fff'
                }}
                data-testid="button-switch-network-banner"
              >
                {isCheckingNetwork ? '⏳ Switching...' : '🔄 Switch Network'}
              </Button>
            </div>
          </Card>
        )}
        
        {/* Airdrop Claim/Success Section */}
        {airdropClaimed ? (
          // FINAL STATE UI - Show ONLY this after successful claim
          <Card className="p-4 sm:p-5 glass-card">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center" style={{
                background: 'rgba(0, 255, 136, 0.2)',
                border: '2px solid #00ff88'
              }}>
                <span className="text-2xl">✅</span>
              </div>
              
              <p className="text-lg sm:text-xl font-bold" style={{color: '#ffd700'}}>
                You got 100,000 $MEMES airdrop rewards.
              </p>
              
              {/* Tx Hash Button - ONLY button shown */}
              <div className="mt-4">
                <button
                  onClick={() => window.open(`https://testnet.bscscan.com/tx/${airdropTxHash}`, '_blank')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: 'rgba(0, 191, 255, 0.15)',
                    border: '1px solid rgba(0, 191, 255, 0.5)',
                    color: '#00bfff'
                  }}
                  data-testid="button-tx-hash"
                >
                  <span>🔗</span>
                  <span>Tx Hash</span>
                </button>
              </div>
            </div>
          </Card>
        ) : (isExported || userClaimableAmount > 0) && allTasksCompleted ? (
          // Show claim button when user is exported OR has claimable amount (bypass email/tasks)
          <>
            {/* Yellow Banner - Clickable - SUPER ATTRACTIVE */}
            <Card 
              className="p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] relative overflow-hidden" 
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 30%, #ffd700 50%, #ffed4e 70%, #ffd700 100%)',
                backgroundSize: '300% 300%',
                animation: 'gradientShift 3s ease infinite',
                border: '3px solid #ffed4e',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 140, 0, 0.5), 0 0 90px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.2)'
              }}
              onClick={() => setShowAirdropContent(!showAirdropContent)}
              data-testid="banner-claim-airdrop"
            >
              {/* Animated sparkle effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-2 left-[10%] text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '1.5s'}}>✨</div>
                <div className="absolute top-3 right-[15%] text-xl animate-bounce" style={{animationDelay: '0.3s', animationDuration: '1.8s'}}>💎</div>
                <div className="absolute bottom-2 left-[20%] text-lg animate-bounce" style={{animationDelay: '0.6s', animationDuration: '1.6s'}}>⭐</div>
                <div className="absolute bottom-3 right-[10%] text-2xl animate-bounce" style={{animationDelay: '0.9s', animationDuration: '1.4s'}}>🔥</div>
                <div className="absolute top-1/2 left-[5%] text-lg animate-ping" style={{animationDuration: '2s'}}>💰</div>
                <div className="absolute top-1/2 right-[5%] text-lg animate-ping" style={{animationDelay: '1s', animationDuration: '2s'}}>🚀</div>
              </div>
              
              {/* Shine sweep effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                  animation: 'shine 2s infinite',
                  transform: 'skewX(-20deg)'
                }}
              />
              
              <div className="flex items-center justify-center gap-3 relative z-10">
                <span className="text-4xl sm:text-5xl animate-bounce" style={{animationDuration: '1s'}}>🎁</span>
                <div className="text-center">
                  <h2 className="text-xl sm:text-3xl font-black tracking-wider" style={{
                    color: '#000',
                    textShadow: '2px 2px 4px rgba(255,255,255,0.5), -1px -1px 2px rgba(255,255,255,0.3)'
                  }}>
                    🎉 CLAIM YOUR FREE AIRDROP! 🎉
                  </h2>
                  <p className="text-sm sm:text-base font-bold mt-1" style={{color: 'rgba(0,0,0,0.7)'}}>
                    💰 FREE MEMES Tokens Waiting For You! 💰
                  </p>
                </div>
                <span className="text-3xl sm:text-4xl" style={{
                  transform: showAirdropContent ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  display: 'inline-block'
                }}>▼</span>
              </div>
              
              {/* Urgency badge */}
              {!showAirdropContent && (
                <div className="mt-4 flex flex-col items-center gap-2 relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-pulse" style={{
                    background: 'rgba(0,0,0,0.8)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}>
                    <span className="text-lg">⚡</span>
                    <span className="text-sm sm:text-base font-bold text-white">LIMITED TIME - CLICK TO CLAIM NOW!</span>
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="w-full max-w-xs h-3 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: '100%',
                        background: 'linear-gradient(90deg, #00ff88, #00bfff, #00ff88)',
                        backgroundSize: '200% 100%',
                        animation: 'gradientShift 1s linear infinite'
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {showAirdropContent && (
              <Card className="p-3 sm:p-4 glass-card">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center justify-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <span style={{ color: '#ffd700' }}>Claim Your MEMES Airdrop</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You have <span className="font-bold text-[#ffd700]">100,000 MEMES</span> tokens ready to claim!
                </p>

                {/* Verification Message - Show when all tasks complete but not exported yet */}
                {!isExported && allTasksCompleted && (
                  <div className="mb-4 p-3 rounded-lg" style={{
                    background: 'rgba(0, 191, 255, 0.15)',
                    border: '1px solid rgba(0, 191, 255, 0.3)'
                  }}>
                    <p className="text-sm text-cyan-400 flex items-center justify-center gap-2">
                      <span className="animate-pulse">⏳</span>
                      <span>We are verifying your completed task. Please wait some time to claim airdrop</span>
                    </p>
                  </div>
                )}

                {/* Gas Fee Warning */}
                {bnbWalletBalance < MIN_GAS_FEE_BNB && (
                  <div className="mb-4 p-3 rounded-lg" style={{
                    background: 'rgba(255, 68, 68, 0.15)',
                    border: '1px solid rgba(255, 68, 68, 0.5)'
                  }}>
                    <p className="text-sm flex items-center justify-center gap-2" style={{color: '#ff4444'}}>
                      <span>⚠️</span>
                      <span>Insufficient gas fee. Please add BNB to claim your airdrop.</span>
                    </p>
                  </div>
                )}

                {/* Direct Claim Button */}
                <button
                  onClick={handleClaimAirdrop}
                  disabled={isClaimingAirdrop || bnbWalletBalance < MIN_GAS_FEE_BNB}
                  className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg relative overflow-hidden transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: bnbWalletBalance < MIN_GAS_FEE_BNB 
                      ? 'linear-gradient(135deg, #666 0%, #888 50%, #666 100%)'
                      : 'linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #ffd700 50%, #ffed4e 75%, #ffd700 100%)',
                    backgroundSize: '200% 200%',
                    animation: bnbWalletBalance >= MIN_GAS_FEE_BNB ? 'gradientShift 3s ease infinite' : 'none',
                    color: bnbWalletBalance < MIN_GAS_FEE_BNB ? '#fff' : '#000',
                    boxShadow: bnbWalletBalance >= MIN_GAS_FEE_BNB 
                      ? '0 8px 32px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)'
                      : 'none',
                    border: bnbWalletBalance >= MIN_GAS_FEE_BNB 
                      ? '2px solid rgba(255, 237, 78, 0.8)'
                      : '2px solid rgba(255, 68, 68, 0.5)'
                  }}
                  data-testid="button-claim-airdrop"
                >
                  {/* Animated shine effect - only when enabled */}
                  {bnbWalletBalance >= MIN_GAS_FEE_BNB && (
                    <span 
                      className="absolute inset-0 w-full h-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        animation: 'shine 2s infinite',
                        transform: 'skewX(-20deg)'
                      }}
                    />
                  )}
                  
                  {/* Pulsing glow effect - only when enabled */}
                  {bnbWalletBalance >= MIN_GAS_FEE_BNB && (
                    <span 
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
                        animation: 'pulse 2s ease-in-out infinite'
                      }}
                    />
                  )}
                  
                  {/* Button content */}
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    {isClaimingAirdrop ? (
                      <>
                        <span className="text-2xl">⏳</span>
                        <span className="tracking-wider">CLAIMING...</span>
                      </>
                    ) : bnbWalletBalance < MIN_GAS_FEE_BNB ? (
                      <>
                        <span className="text-2xl">⚠️</span>
                        <span className="tracking-wider">ADD BNB FOR GAS</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl">🎁</span>
                        <span className="tracking-wider">CLAIM NOW</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </Card>
            )}
          </>
        ) : (
          // Show email verification and task completion process when userClaimableAmount <= 0
          <>
            {/* Yellow Banner - Clickable - SUPER ATTRACTIVE */}
            <Card 
              className="p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] relative overflow-hidden" 
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 30%, #ffd700 50%, #ffed4e 70%, #ffd700 100%)',
                backgroundSize: '300% 300%',
                animation: 'gradientShift 3s ease infinite',
                border: '3px solid #ffed4e',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 140, 0, 0.5), 0 0 90px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.2)'
              }}
              onClick={() => setShowAirdropContent(!showAirdropContent)}
              data-testid="banner-claim-airdrop"
            >
              {/* Animated sparkle effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-2 left-[10%] text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '1.5s'}}>✨</div>
                <div className="absolute top-3 right-[15%] text-xl animate-bounce" style={{animationDelay: '0.3s', animationDuration: '1.8s'}}>💎</div>
                <div className="absolute bottom-2 left-[20%] text-lg animate-bounce" style={{animationDelay: '0.6s', animationDuration: '1.6s'}}>⭐</div>
                <div className="absolute bottom-3 right-[10%] text-2xl animate-bounce" style={{animationDelay: '0.9s', animationDuration: '1.4s'}}>🔥</div>
                <div className="absolute top-1/2 left-[5%] text-lg animate-ping" style={{animationDuration: '2s'}}>💰</div>
                <div className="absolute top-1/2 right-[5%] text-lg animate-ping" style={{animationDelay: '1s', animationDuration: '2s'}}>🚀</div>
              </div>
              
              {/* Shine sweep effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                  animation: 'shine 2s infinite',
                  transform: 'skewX(-20deg)'
                }}
              />
              
              <div className="flex items-center justify-center gap-3 relative z-10">
                <span className="text-4xl sm:text-5xl animate-bounce" style={{animationDuration: '1s'}}>🎁</span>
                <div className="text-center">
                  <h2 className="text-xl sm:text-3xl font-black tracking-wider" style={{
                    color: '#000',
                    textShadow: '2px 2px 4px rgba(255,255,255,0.5), -1px -1px 2px rgba(255,255,255,0.3)'
                  }}>
                    🎉 CLAIM YOUR FREE AIRDROP! 🎉
                  </h2>
                  <p className="text-sm sm:text-base font-bold mt-1" style={{color: 'rgba(0,0,0,0.7)'}}>
                    💰 FREE MEMES Tokens Waiting For You! 💰
                  </p>
                </div>
                <span className="text-3xl sm:text-4xl" style={{
                  transform: showAirdropContent ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  display: 'inline-block'
                }}>▼</span>
              </div>
              
              {/* Progress Bar with urgency */}
              {!showAirdropContent && (
                <div className="mt-4 flex flex-col items-center gap-2 relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-pulse" style={{
                    background: 'rgba(0,0,0,0.8)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}>
                    <span className="text-lg">⚡</span>
                    <span className="text-sm sm:text-base font-bold text-white">
                      {Math.round(((emailVerified ? 1 : 0) + Object.values(tasksCompleted).filter(Boolean).length) / 5 * 100)}% Complete - CLICK TO CONTINUE!
                    </span>
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="w-full max-w-xs h-3 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.round(((emailVerified ? 1 : 0) + Object.values(tasksCompleted).filter(Boolean).length) / 5 * 100)}%`,
                        background: 'linear-gradient(90deg, #00ff88, #00bfff, #00ff88)',
                        backgroundSize: '200% 100%',
                        animation: 'gradientShift 1s linear infinite'
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {showAirdropContent && (
              <Card className="p-3 sm:p-4 glass-card">
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center justify-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <span style={{ color: '#ffd700' }}>Claim Your MEMES Airdrop</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Complete the verification steps below to claim your exclusive MEMES tokens from our
                </p>
                <p className="text-sm font-bold mb-4" style={{color: '#ffd700'}}>
                  decentralized airdrop direct in your wallet <span className="text-muted-foreground">and join our growing community.</span>
                </p>

                {/* Overall Progress */}
                <div className="flex items-center justify-between mb-6 px-4">
                  <span className="text-sm font-semibold" style={{color: '#00bfff'}}>Overall Progress</span>
                  <span className="text-sm font-bold" style={{color: '#ffd700'}}>
                    {Math.round(((emailVerified ? 1 : 0) + Object.values(tasksCompleted).filter(Boolean).length) / 5 * 100)}%
                  </span>
                </div>

                {/* Email Verification Section */}
                <div className="p-4 rounded-lg mb-4" style={{
                  background: 'rgba(0, 191, 255, 0.1)',
                  border: '1px solid rgba(0, 191, 255, 0.3)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">1️⃣</span>
                      <h4 className="text-base font-bold" style={{color: '#fff'}}>Email Verification</h4>
                    </div>
                    {emailVerified && (
                      <span className="text-sm font-bold" style={{color: '#00ff88'}}>✅ Verified</span>
                    )}
                  </div>

                  {!emailVerified ? (
                    <div className="space-y-3">
                      <p className="text-sm mb-3" style={{ color: '#00bfff' }}>
                        📧 Verify your email to unlock tasks
                      </p>
                      
                      {/* Email Input */}
                      <div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full px-3 py-2 rounded bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
                          disabled={showOtpInput}
                          data-testid="input-email"
                        />
                      </div>

                      {/* Sponsor Code Input (if not already set) */}
                      {!sponsorAddress && !referralCode && (
                        <div>
                          <input
                            type="text"
                            value={sponsorAddress}
                            onChange={(e) => setSponsorAddress(e.target.value)}
                            placeholder="Sponsor code (optional)"
                            className="w-full px-3 py-2 rounded bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none"
                            disabled={showOtpInput}
                            data-testid="input-sponsor-code"
                          />
                        </div>
                      )}

                      {/* OTP Input (shown after OTP sent) */}
                      {showOtpInput && (
                        <div>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="w-full px-3 py-2 rounded bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none text-center text-lg tracking-widest"
                            data-testid="input-otp"
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!showOtpInput ? (
                          <Button
                            onClick={handleSendOTP}
                            disabled={isSendingOtp || !email}
                            className="w-full"
                            style={{ background: '#00bfff', color: '#000' }}
                            data-testid="button-send-otp"
                          >
                            {isSendingOtp ? '⏳ Sending...' : '📧 Send OTP'}
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={handleVerifyOTP}
                              disabled={isVerifyingOtp || !otp}
                              className="flex-1"
                              style={{ background: '#00ff88', color: '#000' }}
                              data-testid="button-verify-otp"
                            >
                              {isVerifyingOtp ? '⏳ Verifying...' : '✅ Verify'}
                            </Button>
                            <Button
                              onClick={handleResendOTP}
                              disabled={resendCooldown > 0}
                              variant="outline"
                              className="flex-1"
                              data-testid="button-resend-otp"
                            >
                              {resendCooldown > 0 ? `⏰ ${resendCooldown}s` : '🔄 Resend'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Your email has been verified successfully!</p>
                  )}
                </div>

                {/* Social Media Tasks Section */}
                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(0, 191, 255, 0.1)',
                  border: '1px solid rgba(0, 191, 255, 0.3)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">2️⃣</span>
                      <h4 className="text-base font-bold" style={{color: '#fff'}}>Social Media Tasks</h4>
                    </div>
                    <span className="text-sm font-bold" style={{color: '#00bfff'}}>
                      {Object.values(tasksCompleted).filter(Boolean).length}/4
                    </span>
                  </div>

                  {!emailVerified ? (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 mx-auto mb-3 opacity-50" style={{color: '#ffd700'}} />
                      <p className="text-sm" style={{color: '#ffd700'}}>
                        🔒 Verify your email first to unlock tasks
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Telegram Group Task */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
                        <div className="flex items-center gap-3">
                          <SiTelegram className="w-5 h-5" style={{color: '#00bfff'}} />
                          <span className="text-sm">Join Telegram Group</span>
                        </div>
                        <Button
                          onClick={() => {
                            window.open('https://t.me/memestakegroup', '_blank');
                            handleCompleteTask('telegram_group');
                          }}
                          disabled={tasksCompleted.telegram_group || tasksPending.telegram_group}
                          size="sm"
                          style={{
                            background: tasksCompleted.telegram_group ? '#00ff88' : '#00bfff',
                            color: '#000'
                          }}
                          data-testid="button-task-telegram-group"
                        >
                          {tasksCompleted.telegram_group ? '✅ Done' : tasksPending.telegram_group ? '⏳...' : 'Join'}
                        </Button>
                      </div>

                      {/* Telegram Channel Task */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
                        <div className="flex items-center gap-3">
                          <SiTelegram className="w-5 h-5" style={{color: '#00bfff'}} />
                          <span className="text-sm">Join Telegram Channel</span>
                        </div>
                        <Button
                          onClick={() => {
                            window.open('https://t.me/memstakeofficial', '_blank');
                            handleCompleteTask('telegram_channel');
                          }}
                          disabled={tasksCompleted.telegram_channel || tasksPending.telegram_channel}
                          size="sm"
                          style={{
                            background: tasksCompleted.telegram_channel ? '#00ff88' : '#00bfff',
                            color: '#000'
                          }}
                          data-testid="button-task-telegram-channel"
                        >
                          {tasksCompleted.telegram_channel ? '✅ Done' : tasksPending.telegram_channel ? '⏳...' : 'Join'}
                        </Button>
                      </div>

                      {/* Twitter Task */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
                        <div className="flex items-center gap-3">
                          <SiX className="w-5 h-5" style={{color: '#00bfff'}} />
                          <span className="text-sm">Follow on X (Twitter)</span>
                        </div>
                        <Button
                          onClick={() => {
                            window.open('https://x.com/memestake86', '_blank');
                            handleCompleteTask('twitter');
                          }}
                          disabled={tasksCompleted.twitter || tasksPending.twitter}
                          size="sm"
                          style={{
                            background: tasksCompleted.twitter ? '#00ff88' : '#00bfff',
                            color: '#000'
                          }}
                          data-testid="button-task-twitter"
                        >
                          {tasksCompleted.twitter ? '✅ Done' : tasksPending.twitter ? '⏳...' : 'Follow'}
                        </Button>
                      </div>

                      {/* YouTube Task */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5" style={{color: '#00bfff'}} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span className="text-sm">Subscribe YouTube</span>
                        </div>
                        <Button
                          onClick={() => {
                            window.open('https://youtube.com/@memestake86?si=0bljj-3rnPz9IPh1', '_blank');
                            handleCompleteTask('youtube');
                          }}
                          disabled={tasksCompleted.youtube || tasksPending.youtube}
                          size="sm"
                          style={{
                            background: tasksCompleted.youtube ? '#00ff88' : '#00bfff',
                            color: '#000'
                          }}
                          data-testid="button-task-youtube"
                        >
                          {tasksCompleted.youtube ? '✅ Done' : tasksPending.youtube ? '⏳...' : 'Subscribe'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Congratulations + Claim Button (shown when all tasks completed) */}
                {allTasksCompleted && (
                  <div className="mt-6">
                    {/* Congratulations Message */}
                    <div className="text-center p-4 rounded-xl mb-4" style={{
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 191, 255, 0.15) 100%)',
                      border: '2px solid rgba(0, 255, 136, 0.5)',
                      boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)'
                    }}>
                      <div className="text-4xl mb-2">🎉</div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{color: '#00ff88'}}>
                        Congratulations!
                      </h3>
                      <p className="text-sm sm:text-base mb-2" style={{color: '#00ff88'}}>
                        Task completed successfully.
                      </p>
                      <p className="text-base sm:text-lg font-bold" style={{color: '#ffd700'}}>
                        You are eligible for 100,000 MEMES tokens airdrop.
                      </p>
                    </div>

                    {/* Claim Button */}
                    <button
                      onClick={handleClaimAirdrop}
                      disabled={isClaimingAirdrop}
                      className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg relative overflow-hidden transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 25%, #ffd700 50%, #ffed4e 75%, #ffd700 100%)',
                        backgroundSize: '200% 200%',
                        animation: 'gradientShift 3s ease infinite',
                        color: '#000',
                        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)',
                        border: '2px solid rgba(255, 237, 78, 0.8)'
                      }}
                      data-testid="button-claim-airdrop-tasks"
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
                        {isClaimingAirdrop ? (
                          <>
                            <span className="text-2xl">⏳</span>
                            <span className="tracking-wider">CLAIMING...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl">🎁</span>
                            <span className="tracking-wider">Claim your airdrop reward now!</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </Card>
            )}
          </>
        )}

        {/* Referral & Sponsor Section */}
        <Card className="p-3 sm:p-4 glass-card" style={{border: '2px solid #00bfff', boxShadow: '0 4px 20px rgba(0, 191, 255, 0.2)'}}>
          <div className="grid md:grid-cols-2 gap-4">
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
        </Card>

        {/* Main Dashboard Grid - Compact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          
          {/* Wallet Balance - Compact */}
          <Card className="p-0 overflow-hidden relative" style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.3)'
          }}>
            {/* Header - Compact */}
            <div className="p-3 pb-2 relative" style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 191, 255, 0.15) 100%)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)'
                  }}>
                    <span className="text-base">💰</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
                    My Wallet
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold" style={{color: '#00ff88'}}>LIVE</span>
                </div>
              </div>
              
              {/* Total Tokens Purchased Badge - Compact */}
              {walletAddress && (
                <div className="mt-2 p-2 rounded-lg backdrop-blur-sm" style={{
                  background: 'rgba(0, 191, 255, 0.2)',
                  border: '1px solid rgba(0, 191, 255, 0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold mb-0.5" style={{color: '#00bfff'}}>Total Purchased</div>
                      <div className="text-sm font-bold text-white">
                        {totalPurchasedTokens.toLocaleString()} $MEMES
                      </div>
                    </div>
                    <Coins className="w-4 h-4" style={{color: '#00bfff'}} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Wallet Stats - Compact */}
            <div className="p-3 pt-2 space-y-2">
              {/* Main Balance - Compact */}
              <div className="p-3 rounded-xl relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.05) 100%)',
                border: '2px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
              }}>
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <Coins className="w-full h-full" style={{color: '#ffd700'}} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5" style={{color: '#ffd700'}} />
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#ffd700'}}>
                      Token Balance
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-black" style={{
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
              
              {/* Stats Grid - Compact */}
              <div className="grid grid-cols-1 gap-2">
                {/* Total Rewards */}
                <div className="p-2.5 rounded-lg backdrop-blur-sm" style={{
                  background: 'rgba(0, 191, 255, 0.15)',
                  border: '1px solid rgba(0, 191, 255, 0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5" style={{color: '#00bfff'}} />
                      <span className="text-xs text-gray-300">Total Rewards</span>
                    </div>
                    <div className="text-sm font-bold" style={{color: '#00bfff'}}>
                      {isLoadingBalances ? (
                        <span className="animate-pulse text-xs">...</span>
                      ) : (
                        `${pendingStakingRewards.toLocaleString()}`
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Airdrop Tokens */}
                <div className="p-2.5 rounded-lg backdrop-blur-sm" style={{
                  background: 'rgba(0, 255, 136, 0.15)',
                  border: '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" style={{color: '#00ff88'}} />
                      <span className="text-xs text-gray-300">Airdrop Tokens</span>
                    </div>
                    <div className="text-sm font-bold" style={{color: '#00ff88'}}>
                      {userClaimedAmount.toLocaleString()}
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
                        `${presaleReferralRewards.toLocaleString()} $MEMES`
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Staking Overview - Compact */}
          <Card className="p-0 overflow-hidden relative" style={{
            background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%)',
            border: '1px solid rgba(0, 191, 255, 0.3)'
          }}>
            {/* Header - Compact */}
            <div className="p-3 pb-2 relative" style={{
              background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.15) 0%, rgba(0, 255, 136, 0.15) 100%)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #00bfff 0%, #00ff88 100%)',
                    boxShadow: '0 4px 15px rgba(0, 191, 255, 0.4)'
                  }}>
                    <span className="text-base">📈</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                    Staking Overview
                  </h3>
                </div>
                <div className="px-2 py-0.5 rounded-full" style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)',
                  boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)'
                }}>
                  <span className="text-xs font-bold text-black">ACTIVE</span>
                </div>
              </div>
            </div>
            
            {/* APY Highlight - Compact */}
            <div className="px-3 pb-2">
              <div className="p-3 rounded-xl relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 255, 136, 0.05) 100%)',
                border: '2px solid rgba(0, 255, 136, 0.4)',
                boxShadow: '0 8px 25px rgba(0, 255, 136, 0.2)'
              }}>
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <TrendingUp className="w-full h-full" style={{color: '#00ff88'}} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Rocket className="w-3.5 h-3.5" style={{color: '#00ff88'}} />
                    <div className="text-xs font-semibold uppercase tracking-wide" style={{color: '#00ff88'}}>
                      APY
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black" style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00ffaa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    365%
                  </div>
                  <div className="text-xs mt-0.5" style={{color: '#00ff88'}}>
                    🔥 1% Daily
                  </div>
                </div>
              </div>
            </div>
            
            {/* Staking Stats - Compact */}
            <div className="px-3 pb-3 space-y-2">
              {/* Staked Amount */}
              <div className="p-2.5 rounded-lg backdrop-blur-sm" style={{
                background: 'rgba(255, 215, 0, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" style={{color: '#ffd700'}} />
                    <span className="text-xs text-gray-300">Staked</span>
                  </div>
                  <div className="text-sm font-bold" style={{color: '#ffd700'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-xs">...</span>
                    ) : (
                      `${totalStakedAmount.toLocaleString()}`
                    )}
                  </div>
                </div>
              </div>
              
              {/* Lock Period */}
              <div className="p-2.5 rounded-lg backdrop-blur-sm" style={{
                background: 'rgba(0, 191, 255, 0.15)',
                border: '1px solid rgba(0, 191, 255, 0.3)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" style={{color: '#00bfff'}} />
                    <span className="text-xs text-gray-300">Lock Period</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    90 Days
                  </div>
                </div>
              </div>
              
              {/* Daily Rewards */}
              <div className="p-2.5 rounded-lg backdrop-blur-sm" style={{
                background: 'rgba(0, 255, 136, 0.15)',
                border: '1px solid rgba(0, 255, 136, 0.3)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" style={{color: '#00ff88'}} />
                    <span className="text-xs text-gray-300">Today's Rewards</span>
                  </div>
                  <div className="text-sm font-bold" style={{color: '#00ff88'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-xs">...</span>
                    ) : (
                      `${accruedToday.toLocaleString()}`
                    )}
                  </div>
                </div>
              </div>
              
              {/* Stake Button - Compact */}
              <Button 
                size="sm"
                className="w-full mt-2 text-sm font-bold py-3 transition-all hover:scale-105" 
                onClick={handleStakeTokens}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#000',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                  border: 'none'
                }}
                data-testid="button-stake-more"
              >
                <Rocket className="w-4 h-4 mr-1.5" />
                Stake More
              </Button>
            </div>
          </Card>
        </div>

        {/* Earnings Section - Compact */}
        <Card className="p-3 sm:p-4 glass-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">💰 My Earnings</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/income-history')}
              className="text-xs py-1 px-2 h-auto"
              data-testid="button-view-history"
            >
              📊 History
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3">
            {/* Staking Earnings */}
            <div className="p-2 sm:p-3 rounded-lg text-center" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
              <div className="text-xs text-muted-foreground mb-1">Staking</div>
              <div className="text-sm sm:text-base font-bold" style={{color: '#00bfff'}}>
                {stakingEarnings.toLocaleString()}
              </div>
            </div>

            {/* Referral Earnings */}
            <div className="p-2 sm:p-3 rounded-lg text-center" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
              <div className="text-xs text-muted-foreground mb-1">Referral</div>
              <div className="text-sm sm:text-base font-bold" style={{color: '#ffd700'}}>
                {referralEarnings.toLocaleString()}
              </div>
            </div>

            {/* Total Earnings */}
            <div className="p-2 sm:p-3 rounded-lg text-center" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
              <div className="text-xs text-muted-foreground mb-1">Total</div>
              <div className="text-sm sm:text-base font-bold" style={{color: '#00ff88'}}>
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

        {/* My Airdrop/Staking Earning - Compact */}
        <Card className="p-3 sm:p-4 glass-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">👥 3-Level Referrals (100K each level)</h3>
          </div>
          
          <div className="space-y-2">
            {/* Level 1 - Direct - Compact */}
            <div className="p-2.5 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{background: '#ffd700', color: '#000'}}>
                    <span className="text-xs font-bold">1</span>
                  </div>
                  <span className="text-xs font-semibold">Level 1</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700'}}>👥    {isLoadingBalances ? (
                    <span className="animate-pulse text-xs">...</span>
                  ) : (
                    level1ReferralCount.toLocaleString()
                  )} Members</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Referral Rewards</div>
                  <div className="text-sm font-bold" style={{color: '#ffd700'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-xs">...</span>
                    ) : (
                      `${level1AirdropRewards.toLocaleString()}`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Referral Staking</div>
                  <div className="text-sm font-bold" style={{color: '#ffd700'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-xs">...</span>
                    ) : (
                      `${level1StakingRewards.toLocaleString()}`
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Level 2 - Compact */}
            <div className="p-2.5 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{background: '#00bfff', color: '#000'}}>
                    <span className="text-xs font-bold">2</span>
                  </div>
                  <span className="text-xs font-semibold">Level 2</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{background: 'rgba(0, 191, 255, 0.2)', color: '#00bfff'}}>👥 {isLoadingBalances ? (
                    <span className="animate-pulse text-xs">...</span>
                  ) : (
                    level2ReferralCount.toLocaleString()
                  )} Members</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Referral Rewards</div>
                  <div className="text-sm font-bold" style={{color: '#00bfff'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-xs">...</span>
                    ) : (
                      `${level2AirdropRewards.toLocaleString()}`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Referral Staking</div>
                  <div className="text-sm font-bold" style={{color: '#00bfff'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-xs">...</span>
                    ) : (
                      `${level2StakingRewards.toLocaleString()}`
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Level 3 - Compact */}
            <div className="p-2.5 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{background: '#00ff88', color: '#000'}}>
                    <span className="text-xs font-bold">3</span>
                  </div>
                  <span className="text-xs font-semibold">Level 3</span>
                </div>
                <span className="text-xs px-1.5 py-0.5 rounded" style={{background: 'rgba(0, 255, 136, 0.2)', color: '#00ff88'}}>👥 {isLoadingBalances ? (
                    <span className="animate-pulse text-xs">...</span>
                  ) : (
                    level3ReferralCount.toLocaleString()
                  )} Members</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Referral Rewards</div>
                  <div className="text-sm font-bold" style={{color: '#00ff88'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-xs">...</span>
                    ) : (
                      `${level3AirdropRewards.toLocaleString()}`
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Referral Staking</div>
                  <div className="text-sm font-bold" style={{color: '#00ff88'}}>
                    {isLoadingBalances ? (
                      <span className="animate-pulse text-xs">...</span>
                    ) : (
                      `${level3StakingRewards.toLocaleString()}`
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

        {/* How It Works - Compact */}
        <Card className="p-3 sm:p-4 glass-card" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 191, 255, 0.05))', border: '2px solid rgba(0, 191, 255, 0.3)'}}>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-it-works" style={{borderColor: 'rgba(0, 191, 255, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#00bfff] text-sm">
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
                      <span>Complete social tasks (Follow, Like, Retweet) - Earn 25,000 $MEMES per task</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#00ff88'}} />
                      <span>3-level referral system (Level 1: 10K, Level 2: 10K, Level 3: 10K tokens)</span>
                    </li>
                  </ul>
                  <div className="mt-4 p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
                    <div className="text-sm font-bold mb-1" style={{color: '#00ff88'}}>💎 Max Airdrop Rewards: 100,000 $MEMES</div>
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

        {/* FAQ Section - Compact */}
        <Card className="p-3 sm:p-4 glass-card">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
              <AccordionTrigger className="text-white hover:text-[#ffd700] text-sm">
                <h3 className="text-base sm:text-lg font-bold" style={{color: '#ffd700'}}>Frequently Asked Questions</h3>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p className="text-center text-gray-400 mb-6">Everything you need to know about memes</p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">What is memes?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      memes is a decentralized airdrop and staking platform for the MEMES token. We deliver tokens direct in your wallet while building the strongest meme community in crypto.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">How do I earn rewards?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      You can earn rewards through airdrops by completing social tasks, staking your MEMES tokens for up to 365% APY, and referring friends through our 3-level referral program (10,000 $MEMES per level).
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
                  <p className="text-sm text-gray-400 mb-4">Our community team is here to help you get started with memes</p>
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

        {/* About memes - Compact */}
        <Card className="p-3 sm:p-4 glass-card">
          <h2 className="text-lg sm:text-xl font-bold text-center mb-2" style={{color: '#ffd700'}}>About memes</h2>
          <p className="text-center text-gray-400 mb-3 text-xs sm:text-sm">Learn more about our platform</p>
          
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
                    memes is revolutionizing the meme coin ecosystem by combining decentralized airdrops with innovative staking mechanisms. We deliver tokens direct in your wallet while building the strongest meme community in crypto.
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

        {/* Join Our Community - Compact */}
        <Card className="p-3 sm:p-4 glass-card text-center" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95), rgba(30, 15, 60, 0.95))', border: '2px solid rgba(0, 191, 255, 0.3)'}}>
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{color: '#00bfff'}}>Join Our Community</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
            <a
              href="https://t.me/memestakegroup"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-4 rounded-xl transition-all hover:scale-105"
              style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}
              data-testid="link-telegram-group"
            >
              <SiTelegram className="w-8 h-8 mx-auto mb-2" style={{color: '#00bfff'}} />
              <div className="font-bold mb-1 text-sm" style={{color: '#00bfff'}}>Telegram</div>
              <div className="text-xs text-gray-400">Chat</div>
            </a>

            <a
              href="https://t.me/memstakeofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-4 rounded-xl transition-all hover:scale-105"
              style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}
              data-testid="link-telegram-official"
            >
              <SiTelegram className="w-8 h-8 mx-auto mb-2" style={{color: '#ffd700'}} />
              <div className="font-bold mb-1 text-sm" style={{color: '#ffd700'}}>Official</div>
              <div className="text-xs text-gray-400">News</div>
            </a>

            <a
              href="https://x.com/memestake86"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-4 rounded-xl transition-all hover:scale-105"
              style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)'}}
              data-testid="link-twitter"
            >
              <SiX className="w-8 h-8 mx-auto mb-2" style={{color: '#00ff88'}} />
              <div className="font-bold mb-1 text-sm" style={{color: '#00ff88'}}>Twitter/X</div>
              <div className="text-xs text-gray-400">Follow</div>
            </a>
          </div>
        </Card>

        {/* Buy MEMES Tokens Section - Coming Soon */}
        <Card className="p-3 sm:p-4 glass-card relative overflow-hidden" style={{border: '2px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'}}>
          {/* Coming Soon Overlay - Clickable */}
          <a 
            href="https://t.me/memstakeofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm cursor-pointer transition-all hover:backdrop-blur-md" 
            style={{background: 'rgba(0, 0, 0, 0.7)'}}
            data-testid="link-coming-soon-buy"
          >
            <div className="text-center transition-transform hover:scale-105">
              <div className="text-4xl mb-3">🚀</div>
              <div className="text-2xl font-bold mb-2" style={{color: '#ffd700'}}>Coming Soon</div>
              <div className="text-sm text-gray-400 max-w-xs px-4">Token sale will be live soon. Stay tuned!</div>
              <div className="mt-3 text-xs font-semibold" style={{color: '#00bfff'}}>Click to join our channel for updates →</div>
            </div>
          </a>
          <div className="text-center mb-3 sm:mb-4 opacity-30 pointer-events-none">
            <h3 className="text-lg sm:text-xl font-bold mb-2" style={{color: '#ffd700'}}>🛒 Buy $MEMES Tokens</h3>
            
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
          
          <div className="space-y-5 opacity-30 pointer-events-none">
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

      {/* Footer */}
      <footer className="relative mt-20 py-12 border-t" style={{
        borderColor: 'rgba(255, 215, 0, 0.2)',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.9) 100%)'
      }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8">
            {/* Logo & Brand */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <img 
                  src={memeStakeLogo} 
                  alt="memes Logo" 
                  className="w-12 h-12 rounded-full"
                  style={{boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'}}
                />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
                  $memes
                </h3>
              </div>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                The ultimate $memes token platform with staking, airdrops, and community rewards
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/memestakegroup"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(0, 136, 204, 0.2)',
                  border: '2px solid rgba(0, 136, 204, 0.3)'
                }}
                data-testid="footer-link-telegram"
              >
                <SiTelegram className="text-2xl transition-colors group-hover:text-[#0088cc]" style={{color: '#00bfff'}} />
              </a>

              <a
                href="https://x.com/memestake86"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(29, 161, 242, 0.2)',
                  border: '2px solid rgba(29, 161, 242, 0.3)'
                }}
                data-testid="footer-link-twitter"
              >
                <SiX className="text-2xl transition-colors group-hover:text-[#1DA1F2]" style={{color: '#1DA1F2'}} />
              </a>

              <a
                href="https://youtube.com/@memestake86?si=0bljj-3rnPz9IPh1"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 0, 0, 0.3)'
                }}
                data-testid="footer-link-youtube"
              >
                <SiYoutube className="text-2xl transition-colors group-hover:text-[#FF0000]" style={{color: '#FF0000'}} />
              </a>
            </div>

            {/* Divider */}
            <div className="w-full max-w-2xl h-px" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.3) 50%, transparent 100%)'
            }}></div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} <span className="font-semibold" style={{color: '#ffd700'}}>$memes</span>. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Built on Binance Smart Chain • Powered by Community
              </p>
            </div>
          </div>
        </div>

        {/* Background glow effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
               style={{background: 'radial-gradient(circle, #ffd700 0%, transparent 70%)'}}></div>
        </div>
      </footer>
    </div>
  );
}