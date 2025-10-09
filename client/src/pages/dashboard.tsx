import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import memeStakeLogo from "@assets/ChatGPT Image Oct 9, 2025, 11_08_34 AM_1759988345567.png";
import { CONTRACTS } from "@/config/contracts";
import { Home, BookOpen, Coins, Copy, CheckCircle2, Users, TrendingUp, Shield, Rocket, Trophy, Zap, Lock, Gift, AlertTriangle } from "lucide-react";
import { SiTelegram, SiX } from "react-icons/si";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [airdropTime, setAirdropTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [tokenBalance, setTokenBalance] = useState(125000);
  const [stakingRewards, setStakingRewards] = useState(28475);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletType, setWalletType] = useState<string>('');
  const [sponsorAddress] = useState<string>('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
  const [buyAmount, setBuyAmount] = useState<string>('');
  const [inputMode, setInputMode] = useState<'usd' | 'token'>('usd');
  const [referralCode, setReferralCode] = useState<string>('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [showBuyPreview, setShowBuyPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedTokens, setPurchasedTokens] = useState(0);
  const [txHash] = useState('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b');
  const [isClaiming, setIsClaiming] = useState(false);
  
  // Airdrop claim section state
  const [showAirdropClaim, setShowAirdropClaim] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [contractWalletBalance, setContractWalletBalance] = useState<string>('');
  const [showEligibility, setShowEligibility] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  
  const { toast } = useToast();

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

  // Earnings data
  const stakingEarnings = 28475;
  const referralEarnings = 345000;
  const bonusEarnings = 15000;
  const totalEarnings = stakingEarnings + referralEarnings + bonusEarnings;
  const claimableAmount = totalEarnings;

  const TOKEN_PRICE = 0.0001; // $0.0001 per token
  const MIN_PURCHASE_USD = 50;

  const referralLink = airdropData?.referralLink || 
    (walletAddress ? `${window.location.origin}/dashboard?ref=${participant?.referralCode || ''}` : '');

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

    completeTaskMutation.mutate({ walletAddress, taskId: taskName });
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

  const tokensToGet = inputMode === 'usd' 
    ? calculateTokensFromUSD(parseFloat(buyAmount) || 0)
    : parseFloat(buyAmount) || 0;

  const usdAmount = inputMode === 'usd'
    ? parseFloat(buyAmount) || 0
    : calculateUSDFromTokens(parseFloat(buyAmount) || 0);

  const handleBuyTokens = () => {
    if (usdAmount < MIN_PURCHASE_USD) {
      toast({
        title: "❌ Minimum Purchase Required",
        description: `Minimum purchase is $${MIN_PURCHASE_USD}`,
        variant: "destructive"
      });
      return;
    }

    setShowBuyPreview(true);
  };

  const confirmPurchase = () => {
    setShowBuyPreview(false);
    setPurchasedTokens(tokensToGet);
    
    // Simulate transaction
    setTimeout(() => {
      setTokenBalance(prev => prev + tokensToGet);
      setShowSuccessModal(true);
      setBuyAmount('');
    }, 2000);
  };

  const handleClaimEarnings = () => {
    if (claimableAmount <= 0) {
      toast({
        title: "❌ No Earnings",
        description: "You don't have any earnings to claim",
        variant: "destructive"
      });
      return;
    }

    setIsClaiming(true);
    setTimeout(() => {
      setTokenBalance(prev => prev + claimableAmount);
      setIsClaiming(false);
      toast({
        title: "🎉 Earnings Claimed!",
        description: `Successfully claimed ${claimableAmount.toLocaleString()} $MEMES to your wallet`,
      });
    }, 2000);
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
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-md" style={{background: 'rgba(15, 10, 35, 0.95)'}} data-testid="dashboard-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={memeStakeLogo} 
                alt="MemeStake Logo" 
                className="w-10 h-10 rounded-lg cursor-pointer"
                style={{filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.2))'}}
                onClick={() => setLocation('/')}
                data-testid="logo-memestake"
              />
              <span className="text-lg font-bold text-white hidden sm:block">MemeStake</span>
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
                href="https://t.me/memestake_group"
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
              {walletAddress && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                  <div className="text-xs text-gray-400">{walletType || 'Wallet'}</div>
                  <div className="text-sm font-mono font-bold" style={{color: '#ffd700'}}>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                </div>
              )}
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* Welcome & Airdrop Timer */}
        <Card className="p-6 glass-card">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4" style={{color: '#ffd700'}}>
              🎉 Welcome to Your MemeStake Dashboard!
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
                  <div className="text-sm text-muted-foreground">MINS</div>
                </div>
                <div className="text-xl font-bold" style={{color: '#ffd700'}}>:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{color: '#ffd700'}}>{String(airdropTime.seconds).padStart(2, '0')}</div>
                  <div className="text-sm text-muted-foreground">SECS</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-card">
          <div className="text-center">
            {/* Claim Your Airdrop Now Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowAirdropClaim(!showAirdropClaim)}
                className="w-full py-4 px-6 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
                  color: '#000',
                  boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)'
                }}
                data-testid="button-toggle-airdrop-claim"
              >
                <span className="flex items-center justify-center">
                  {showAirdropClaim ? '▲' : '▼'} CLAIM YOUR AIRDROP NOW!
                </span>
              </button>
            </div>

            {/* Airdrop Claim Section - Dropdown */}
            {showAirdropClaim && (
              <div className="mt-6 p-8 rounded-xl" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95), rgba(30, 15, 60, 0.95))', border: '2px solid rgba(255, 215, 0, 0.3)'}}>
                <h2 className="text-3xl font-bold mb-4 text-center" style={{color: '#ffd700'}}>
                  Claim Your MEMES Airdrop
                </h2>
                <p className="text-center text-gray-300 mb-8">
                  Complete the verification steps below to claim your exclusive MEMES tokens from our <span style={{color: '#ffd700'}}>decentralized airdrop direct in your wallet</span> and join our growing community.
                </p>

                {/* 1. Email Verification */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">1. Email Verification</h3>
                  
                  {!emailVerified ? (
                    <div>
                      {!showOtpInput ? (
                        <div className="flex gap-3">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg text-white placeholder-gray-500"
                            style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                            data-testid="input-email"
                          />
                          <button
                            onClick={handleSendOTP}
                            className="px-6 py-3 rounded-lg font-semibold"
                            style={{background: '#00bfff', color: '#000'}}
                            data-testid="button-send-otp"
                          >
                            📧 Send OTP
                          </button>
                          <button
                            onClick={handleSkipVerification}
                            className="px-6 py-3 rounded-lg font-semibold"
                            style={{background: '#ffd700', color: '#000'}}
                            data-testid="button-skip-verification"
                          >
                            🚀 Skip
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="Enter OTP"
                              className="flex-1 px-4 py-3 rounded-lg text-white placeholder-gray-500"
                              style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                              data-testid="input-otp"
                            />
                            <button
                              onClick={handleVerifyOTP}
                              className="px-6 py-3 rounded-lg font-semibold"
                              style={{background: '#00ff88', color: '#000'}}
                              data-testid="button-verify-otp"
                            >
                              ✅ Verify OTP
                            </button>
                          </div>
                          <div className="mt-3 text-center">
                            <button
                              onClick={handleResendOTP}
                              disabled={resendCooldown > 0}
                              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                              style={{
                                background: resendCooldown > 0 ? 'rgba(100, 100, 100, 0.3)' : 'rgba(0, 191, 255, 0.2)',
                                color: resendCooldown > 0 ? '#666' : '#00bfff',
                                border: `1px solid ${resendCooldown > 0 ? 'rgba(100, 100, 100, 0.3)' : 'rgba(0, 191, 255, 0.3)'}`,
                                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                              }}
                              data-testid="button-resend-otp"
                            >
                              {resendCooldown > 0 
                                ? `Resend OTP in ${resendCooldown}s` 
                                : '🔄 Resend OTP'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2" style={{color: '#00ff88'}}>
                      ✅ Email Verified
                    </div>
                  )}
                </div>

                {/* 2. Social Media Tasks */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">2. Social Media Tasks</h3>
                  
                  {!emailVerified && (
                    <div className="mb-4 p-4 rounded-lg text-center" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                      <span style={{color: '#ffd700'}}>🔒 Verify your email first to unlock tasks</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      { id: 'telegram_group', label: 'Join Telegram Group', icon: '💬', url: 'https://t.me/memestake_group' },
                      { id: 'telegram_channel', label: 'Join Telegram Channel', icon: '📢', url: 'https://t.me/memestake_official' },
                      { id: 'twitter', label: 'Follow on Twitter/X', icon: '🐦', url: 'https://twitter.com/memestake_official' },
                      { id: 'youtube', label: 'Subscribe YouTube', icon: '📺', url: 'https://youtube.com/@memestake' }
                    ].map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 rounded-lg" style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                        <span className="text-sm" style={{color: tasksCompleted[task.id as keyof typeof tasksCompleted] ? '#00ff88' : '#fff'}}>
                          {task.icon} {task.label}
                        </span>
                        {tasksCompleted[task.id as keyof typeof tasksCompleted] ? (
                          <span style={{color: '#00ff88'}}>✅</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Locked</span>
                            <button
                              onClick={() => {
                                if (emailVerified) {
                                  window.open(task.url, '_blank');
                                  setTimeout(() => handleCompleteTask(task.id), 2000);
                                } else {
                                  toast({
                                    title: "🔒 Locked",
                                    description: "Verify your email first",
                                  });
                                }
                              }}
                              className="p-1"
                              disabled={!emailVerified}
                              data-testid={`button-${task.id}`}
                            >
                              🔒
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-sm" style={{color: '#00bfff'}}>
                    Progress: {Object.values(tasksCompleted).filter(Boolean).length}/4 Tasks
                  </div>
                </div>

                {/* 3. Airdrop Status */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">3. Your Airdrop Status</h3>
                  <div className="p-4 rounded-lg text-center space-y-4" style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                    {!allTasksCompleted ? (
                      <>
                        <p className="text-gray-300 text-sm">
                          Complete your social media tasks and connect your wallet to claim your airdrop tokens
                        </p>
                        <p className="text-xs text-gray-400">
                          🔗 Wallet connection required for token distribution
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-center py-3">
                          <p className="text-lg font-semibold mb-2" style={{color: '#00ff88'}}>
                            ✅ You are eligible for consolidation address
                          </p>
                        </div>
                        
                        {!contractWalletBalance ? (
                          <button
                            onClick={handleFetchWalletBalance}
                            disabled={isFetchingBalance}
                            className="px-6 py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105"
                            style={{
                              background: isFetchingBalance ? 'rgba(100, 100, 100, 0.3)' : 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
                              color: '#000',
                              boxShadow: isFetchingBalance ? 'none' : '0 4px 15px rgba(255, 215, 0, 0.4)',
                              cursor: isFetchingBalance ? 'not-allowed' : 'pointer'
                            }}
                            data-testid="button-fetch-token-balance"
                          >
                            {isFetchingBalance ? '⏳ Fetching...' : '🎯 Token'}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
                              <p className="text-sm text-gray-400 mb-1">Your Wallet Balance:</p>
                              <p className="text-3xl font-bold" style={{color: '#00ff88'}}>
                                {contractWalletBalance} MEMES
                              </p>
                            </div>
                            <p className="text-sm text-gray-400">
                              ✅ Airdrop section will hide in 3 seconds...
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
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
                    {sponsorAddress.slice(0, 6)}...{sponsorAddress.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Buy MEMES Tokens Section - Simple & Direct */}
        <Card className="p-5 glass-card" style={{border: '2px solid rgba(255, 215, 0, 0.4)'}}>
          <h3 className="text-xl font-bold mb-4 text-center" style={{color: '#ffd700'}}>🛒 Buy $MEMES Tokens</h3>
          
          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Amount</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setInputMode('usd')}
                    className={`px-3 py-1 rounded text-xs font-bold ${inputMode === 'usd' ? 'text-black' : 'text-gray-500'}`}
                    style={{background: inputMode === 'usd' ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'}}
                    data-testid="toggle-usd"
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setInputMode('token')}
                    className={`px-3 py-1 rounded text-xs font-bold ${inputMode === 'token' ? 'text-black' : 'text-gray-500'}`}
                    style={{background: inputMode === 'token' ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'}}
                    data-testid="toggle-token"
                  >
                    TOKEN
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder={inputMode === 'usd' ? '50' : '500000'}
                className="w-full px-4 py-3 rounded-lg text-lg font-bold text-white"
                style={{background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                data-testid="input-buy-amount"
              />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Min: $50</span>
                <span>No Max</span>
              </div>
            </div>

            {/* You Get */}
            <div className="p-3 rounded-lg text-center" style={{background: 'rgba(0, 191, 255, 0.15)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
              <div className="text-xs text-gray-400 mb-1">You Get</div>
              <div className="text-2xl font-bold" style={{color: '#00bfff'}}>
                {tokensToGet.toLocaleString()} $MEMES
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ${usdAmount.toFixed(2)} @ $0.0001/token
              </div>
            </div>

            {/* Referral Code */}
            {showReferralInput && (
              <div>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Referral code (optional)"
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm"
                  data-testid="input-referral-code"
                />
                {referralCode && (
                  <div className="text-xs mt-1" style={{color: '#00ff88'}}>
                    ✅ {referralCode.slice(0, 6)}...{referralCode.slice(-4)}
                  </div>
                )}
              </div>
            )}
            {!showReferralInput && (
              <button
                onClick={() => setShowReferralInput(true)}
                className="text-xs text-gray-500 hover:text-gray-300"
                data-testid="button-toggle-referral"
              >
                + Add referral code
              </button>
            )}

            {/* Buy Button */}
            <Button 
              onClick={handleBuyTokens}
              disabled={!buyAmount || parseFloat(buyAmount) <= 0 || usdAmount < MIN_PURCHASE_USD}
              className="w-full py-5 text-base font-bold"
              style={{background: 'linear-gradient(135deg, #ffd700, #ffed4e)', color: '#000'}}
              data-testid="button-buy-tokens"
            >
              {tokensToGet > 0 ? `Buy Now - $${usdAmount.toFixed(2)}` : 'Enter Amount'}
            </Button>
          </div>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Wallet Balance */}
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">💰 My Wallet</h3>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {/* Wallet Address */}
              {walletAddress && (
                <div className="text-center p-3 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
                  <div className="text-xs text-muted-foreground mb-1">Connected Wallet</div>
                  <div className="text-sm font-mono font-bold" style={{color: '#00bfff'}}>
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                </div>
              )}
              
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                <div className="text-2xl font-bold" style={{color: '#ffd700'}}>
                  {tokenBalance.toLocaleString()} MEME
                </div>
                <div className="text-sm text-muted-foreground">Token Balance</div>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                <div className="text-xl font-bold" style={{color: '#00bfff'}}>
                  {stakingRewards.toLocaleString()} $MEMES
                </div>
                <div className="text-sm text-muted-foreground">Total Rewards Earned</div>
              </div>
            </div>
          </Card>

          {/* Staking Overview */}
          <Card className="p-6 glass-card">
            <h3 className="text-lg font-semibold mb-4">📈 Staking Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">APY Rate:</span>
                <span className="font-bold" style={{color: '#00ff88'}}>365% APY</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Staked Amount:</span>
                <span className="font-bold" style={{color: '#ffd700'}}>100,000 MEME</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Lock Period:</span>
                <span className="font-bold">90 Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Daily Rewards:</span>
                <span className="font-bold" style={{color: '#00bfff'}}>+1,000 MEME (1%)</span>
              </div>
              
              <Button 
                size="lg"
                className="w-full mt-6 text-lg font-bold py-6 transition-all hover:scale-105 animate-pulse" 
                onClick={handleStakeTokens}
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#000',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                  border: '2px solid rgba(255, 215, 0, 0.5)'
                }}
                data-testid="button-stake-more"
              >
                💎 Stake More Tokens
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
          
          <div className="grid md:grid-cols-4 gap-4 mb-4">
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

            {/* Bonus Earnings */}
            <div className="p-4 rounded-lg text-center" style={{background: 'rgba(255, 105, 180, 0.1)', border: '1px solid rgba(255, 105, 180, 0.2)'}}>
              <div className="text-xs text-muted-foreground mb-2">Bonus Rewards</div>
              <div className="text-xl font-bold" style={{color: '#ff69b4'}}>
                {bonusEarnings.toLocaleString()}
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

          {/* Claim Section */}
          <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Claimable Amount</div>
                <div className="text-2xl font-bold" style={{color: '#00ff88'}}>
                  {claimableAmount.toLocaleString()} $MEMES
                </div>
              </div>
              <Button 
                onClick={handleClaimEarnings}
                disabled={isClaiming || claimableAmount <= 0}
                style={{background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)', color: '#000'}}
                data-testid="button-claim-earnings"
              >
                {isClaiming ? '⏳ Claiming...' : '💎 Claim to Wallet'}
              </Button>
            </div>
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
                      <span>Refer friends and earn 100 $MEMES per referral</span>
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
                      <span>Daily rewards auto-compound or claim anytime</span>
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
                    <Button size="lg" className="w-full" style={{background: 'linear-gradient(135deg, #00bfff 0%, #0099cc 100%)', color: '#000'}} data-testid="button-goto-staking">
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
                <p className="text-center text-gray-400 mb-6">Everything you need to know about MemeStake</p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" style={{borderColor: 'rgba(255, 215, 0, 0.3)'}}>
                    <AccordionTrigger className="text-white hover:text-[#ffd700]">What is MemeStake?</AccordionTrigger>
                    <AccordionContent className="text-gray-400">
                      MemeStake is a decentralized airdrop and staking platform for the MEMES token. We deliver tokens direct in your wallet while building the strongest meme community in crypto.
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
                  <p className="text-sm text-gray-400 mb-4">Our community team is here to help you get started with MemeStake</p>
                  <a
                    href="https://t.me/memestake_group"
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

        {/* About MemeStake */}
        <Card className="p-8 glass-card">
          <h2 className="text-3xl font-bold text-center mb-2" style={{color: '#ffd700'}}>About MemeStake</h2>
          <p className="text-center text-gray-400 mb-8">Learn more about our platform and mission</p>
          
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
                    MemeStake is revolutionizing the meme coin ecosystem by combining decentralized airdrops with innovative staking mechanisms. We deliver tokens direct in your wallet while building the strongest meme community in crypto.
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
              href="https://t.me/memestake_group"
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
              href="https://t.me/memestake_official"
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

              {/* Referral Distribution */}
              {referralCode && (
                <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
                  <div className="text-sm font-semibold mb-2" style={{color: '#00ff88'}}>
                    🎁 Referral Distribution
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level 1 (5%):</span>
                      <span className="font-semibold text-white">{(tokensToGet * 0.05).toLocaleString()} $MEMES</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level 2 (3%):</span>
                      <span className="font-semibold text-white">{(tokensToGet * 0.03).toLocaleString()} $MEMES</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level 3 (2%):</span>
                      <span className="font-semibold text-white">{(tokensToGet * 0.02).toLocaleString()} $MEMES</span>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Referrer Code:</span>
                        <span className="font-mono text-xs" style={{color: '#00ff88'}}>
                          {referralCode.slice(0, 6)}...{referralCode.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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