import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import memeStakeLogo from "@assets/6269020538709674998_1759926006311.jpg";

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
  const [emailVerified, setEmailVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [tasksCompleted, setTasksCompleted] = useState({
    telegram_group: false,
    telegram_channel: false,
    twitter: false,
    youtube: false
  });
  const [airdropTokens, setAirdropTokens] = useState(0);
  const [referralCount, setReferralCount] = useState(1);
  const [referralTokens, setReferralTokens] = useState(0);
  
  const { toast } = useToast();

  // Earnings data
  const stakingEarnings = 28475;
  const referralEarnings = 345000;
  const bonusEarnings = 15000;
  const totalEarnings = stakingEarnings + referralEarnings + bonusEarnings;
  const claimableAmount = totalEarnings;

  const TOKEN_PRICE = 0.0001; // $0.0001 per token
  const MIN_PURCHASE_USD = 50;

  const referralLink = walletAddress 
    ? `https://memestake.app/ref/${walletAddress}`
    : 'https://memestake.app/ref/';

  // Auto-apply referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
      setShowReferralInput(true); // Show input if code exists in URL
    }
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "✅ Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  // Airdrop claim handlers
  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "❌ Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    // Simulate OTP sending
    setShowOtpInput(true);
    toast({
      title: "📧 OTP Sent!",
      description: `Verification code sent to ${email}`,
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
    
    setEmailVerified(true);
    toast({
      title: "✅ Email Verified!",
      description: "You can now complete social tasks",
    });
  };

  const handleSkipVerification = () => {
    setEmailVerified(true);
    toast({
      title: "⏭️ Skipped",
      description: "Email verification skipped",
    });
  };

  const handleCompleteTask = (taskName: string) => {
    if (!emailVerified) {
      toast({
        title: "🔒 Locked",
        description: "Verify your email first to unlock tasks",
      });
      return;
    }

    setTasksCompleted(prev => ({ ...prev, [taskName]: true }));
    
    // Calculate airdrop tokens based on completed tasks
    const completedCount = Object.values({ ...tasksCompleted, [taskName]: true }).filter(Boolean).length;
    setAirdropTokens(completedCount * 250); // 250 tokens per task
    
    toast({
      title: "✅ Task Completed!",
      description: "You earned 250 MEMES tokens",
    });
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
              />
              <span className="text-lg font-bold text-white hidden sm:block">MemeStake</span>
            </div>
            

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

            {/* Claim Your Airdrop Now 1 Button */}
            <div className="mt-6">
              <button
                onClick={() => setShowAirdropClaim(!showAirdropClaim)}
                className="w-full py-4 px-6 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00bfff 0%, #0080ff 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(0, 191, 255, 0.4)'
                }}
                data-testid="button-toggle-airdrop-claim"
              >
                <span className="flex items-center justify-center">
                  {showAirdropClaim ? '▲' : '▼'} Claim Your Airdrop Now 1
                </span>
              </button>
            </div>

            {/* Airdrop Claim Section - Dropdown */}
            {showAirdropClaim && (
              <div className="mt-6 p-8 rounded-xl" style={{background: 'rgb(64, 64, 64)', border: 'none'}}>
                <h2 className="text-3xl font-bold mb-4 text-center text-white">
                  Claim Your MEMES Airdrop
                </h2>
                <p className="text-center text-gray-300 mb-8">
                  Complete the verification steps below to claim your exclusive MEMES tokens from our <span style={{color: '#f59e0b'}}>decentralized airdrop direct in your wallet</span> and join our growing community.
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
                            style={{background: 'rgb(45, 45, 45)', border: '1px solid rgb(80, 80, 80)'}}
                            data-testid="input-email"
                          />
                          <button
                            onClick={handleSendOTP}
                            className="px-6 py-3 rounded-lg font-semibold"
                            style={{background: '#f59e0b', color: '#000'}}
                            data-testid="button-send-otp"
                          >
                            📧 Send OTP
                          </button>
                          <button
                            onClick={handleSkipVerification}
                            className="px-6 py-3 rounded-lg font-semibold"
                            style={{background: '#f59e0b', color: '#000'}}
                            data-testid="button-skip-verification"
                          >
                            🚀 Skip
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            className="flex-1 px-4 py-3 rounded-lg text-white placeholder-gray-500"
                            style={{background: 'rgb(45, 45, 45)', border: '1px solid rgb(80, 80, 80)'}}
                            data-testid="input-otp"
                          />
                          <button
                            onClick={handleVerifyOTP}
                            className="px-6 py-3 rounded-lg font-semibold"
                            style={{background: '#f59e0b', color: '#000'}}
                            data-testid="button-verify-otp"
                          >
                            ✅ Verify OTP
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-green-400">
                      ✅ Email Verified
                    </div>
                  )}
                </div>

                {/* 2. Social Media Tasks */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">2. Social Media Tasks</h3>
                  
                  {!emailVerified && (
                    <div className="mb-4 p-4 rounded-lg text-center" style={{background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)'}}>
                      <span style={{color: '#f59e0b'}}>🔒 Verify your email first to unlock tasks</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      { id: 'telegram_group', label: 'Join Telegram Group', icon: '💬', url: 'https://t.me/memestake_group' },
                      { id: 'telegram_channel', label: 'Join Telegram Channel', icon: '📢', url: 'https://t.me/memestake_official' },
                      { id: 'twitter', label: 'Follow on Twitter/X', icon: '🐦', url: 'https://twitter.com/memestake_official' },
                      { id: 'youtube', label: 'Subscribe YouTube', icon: '📺', url: 'https://youtube.com/@memestake' }
                    ].map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 rounded-lg" style={{background: 'rgb(45, 45, 45)', border: '1px solid rgb(80, 80, 80)'}}>
                        <span className="text-sm" style={{color: tasksCompleted[task.id as keyof typeof tasksCompleted] ? '#10b981' : 'rgb(156, 163, 175)'}}>
                          {task.icon} {task.label}
                        </span>
                        {tasksCompleted[task.id as keyof typeof tasksCompleted] ? (
                          <span style={{color: '#10b981'}}>✅</span>
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

                  <div className="mt-4 text-sm text-gray-400">
                    Progress: {Object.values(tasksCompleted).filter(Boolean).length}/4 Tasks
                  </div>
                </div>

                {/* 3. Airdrop Status */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">3. Your Airdrop Status</h3>
                  <div className="p-4 rounded-lg text-center space-y-2" style={{background: 'rgb(45, 45, 45)', border: '1px solid rgb(80, 80, 80)'}}>
                    <p className="text-gray-300 text-sm">
                      Complete your social media tasks and connect your wallet to claim your airdrop tokens
                    </p>
                    <p className="text-xs text-gray-400">
                      🔗 Wallet connection required for token distribution
                    </p>
                  </div>
                </div>

                {/* 4. Token & Referral Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">4. Token & Referal Details</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg" style={{background: 'rgb(45, 45, 45)', border: '1px solid rgb(80, 80, 80)'}}>
                      <div className="text-xs text-gray-400 mb-1">Your Referrals:</div>
                      <div className="text-2xl font-bold text-white">{referralCount}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{background: 'rgb(45, 45, 45)', border: '1px solid rgb(80, 80, 80)'}}>
                      <div className="text-xs text-gray-400 mb-1">Your Referral Tokens:</div>
                      <div className="text-2xl font-bold text-white">{referralTokens}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{background: 'rgb(45, 45, 45)', border: '1px solid rgb(80, 80, 80)'}}>
                      <div className="text-xs text-gray-400 mb-1">Airdrop Tokens:</div>
                      <div className="text-2xl font-bold text-white">{airdropTokens}</div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 text-center mb-4">
                    Referral tokens will be claimed slot by slot after tokens launching
                  </p>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Your Referral Link:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="flex-1 px-4 py-3 rounded-lg text-gray-300 text-sm font-mono"
                        style={{background: 'rgb(45, 45, 45)', border: '1px solid rgb(80, 80, 80)'}}
                        data-testid="input-airdrop-referral-link"
                      />
                      <button
                        onClick={copyReferralLink}
                        className="px-6 py-3 rounded-lg font-semibold"
                        style={{background: '#f59e0b', color: '#000'}}
                        data-testid="button-copy-airdrop-referral"
                      >
                        Copy
                      </button>
                    </div>
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

        {/* Token Sale Information */}
        <Card className="p-6 glass-card">
          <h3 className="text-lg font-semibold mb-4">💎 Token Sale & Economics</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
              <div className="text-sm text-muted-foreground mb-2">Public Sale</div>
              <div className="text-xl font-bold" style={{color: '#ffd700'}}>25B Tokens</div>
              <div className="text-xs text-cyan-400 mt-1">50% of supply</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
              <div className="text-sm text-muted-foreground mb-2">Token Price</div>
              <div className="text-xl font-bold" style={{color: '#00bfff'}}>$0.0001</div>
              <div className="text-xs text-cyan-400 mt-1">BSC (BEP-20)</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 105, 180, 0.1)', border: '1px solid rgba(255, 105, 180, 0.3)'}}>
              <div className="text-sm text-muted-foreground mb-2">Purchase Limits</div>
              <div className="text-xl font-bold" style={{color: '#ff69b4'}}>$50 Min</div>
              <div className="text-xs text-cyan-400 mt-1">No maximum</div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg text-center text-sm" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
            <span style={{color: '#ffd700'}}>💰 Example:</span> $100 = 1,000,000 $MEMES tokens
          </div>
        </Card>

        {/* 🎁 3-Level Referral Program Section */}
        <Card className="p-6 glass-card" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)', border: '2px solid rgba(0, 255, 136, 0.25)', boxShadow: '0 4px 20px rgba(0, 255, 136, 0.1)'}}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-center" style={{color: '#00ff88'}}>
              🎁 3-Level Referral Program
            </h2>
            <p className="text-xs text-center text-gray-400 mt-1">Earn rewards from your network across three levels</p>
          </div>
          
          {/* Landscape Layout - 3 Levels Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Level 1 */}
            <div className="p-4 rounded-lg transition-all hover:scale-[1.02]" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.08))', border: '1px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 2px 10px rgba(255, 215, 0, 0.15)'}}>
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">🥇</div>
                <h3 className="text-base font-bold mb-1" style={{color: '#ffd700'}}>Level 1</h3>
                <div className="text-sm font-semibold" style={{color: '#ffd700'}}>5% Commission</div>
              </div>
              
              <div className="space-y-2">
                <div className="p-2 rounded-md bg-black/30">
                  <div className="text-[10px] text-muted-foreground mb-0.5">Direct Referrals</div>
                  <div className="text-sm font-bold text-white">8 Users</div>
                </div>
                <div className="p-2 rounded-md bg-black/30">
                  <div className="text-[10px] text-muted-foreground mb-0.5">Total Volume</div>
                  <div className="text-sm font-bold" style={{color: '#ffd700'}}>5,000,000 $MEMES</div>
                </div>
                <div className="p-2 rounded-md" style={{background: 'rgba(0, 255, 136, 0.15)', border: '1px solid rgba(0, 255, 136, 0.25)'}}>
                  <div className="text-[10px] text-muted-foreground mb-0.5">You Earned</div>
                  <div className="text-sm font-bold" style={{color: '#00ff88'}}>250,000 $MEMES</div>
                </div>
              </div>
            </div>

            {/* Level 2 */}
            <div className="p-4 rounded-lg transition-all hover:scale-[1.02]" style={{background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(192, 192, 192, 0.08))', border: '1px solid rgba(192, 192, 192, 0.3)', boxShadow: '0 2px 10px rgba(192, 192, 192, 0.15)'}}>
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">🥈</div>
                <h3 className="text-base font-bold mb-1" style={{color: '#c0c0c0'}}>Level 2</h3>
                <div className="text-sm font-semibold" style={{color: '#c0c0c0'}}>3% Commission</div>
              </div>
              
              <div className="space-y-2">
                <div className="p-2 rounded-md bg-black/30">
                  <div className="text-[10px] text-muted-foreground mb-0.5">2nd Tier Referrals</div>
                  <div className="text-sm font-bold text-white">5 Users</div>
                </div>
                <div className="p-2 rounded-md bg-black/30">
                  <div className="text-[10px] text-muted-foreground mb-0.5">Total Volume</div>
                  <div className="text-sm font-bold" style={{color: '#c0c0c0'}}>2,500,000 $MEMES</div>
                </div>
                <div className="p-2 rounded-md" style={{background: 'rgba(0, 255, 136, 0.15)', border: '1px solid rgba(0, 255, 136, 0.25)'}}>
                  <div className="text-[10px] text-muted-foreground mb-0.5">You Earned</div>
                  <div className="text-sm font-bold" style={{color: '#00ff88'}}>75,000 $MEMES</div>
                </div>
              </div>
            </div>

            {/* Level 3 */}
            <div className="p-4 rounded-lg transition-all hover:scale-[1.02]" style={{background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.08))', border: '1px solid rgba(205, 127, 50, 0.3)', boxShadow: '0 2px 10px rgba(205, 127, 50, 0.15)'}}>
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">🥉</div>
                <h3 className="text-base font-bold mb-1" style={{color: '#cd7f32'}}>Level 3</h3>
                <div className="text-sm font-semibold" style={{color: '#cd7f32'}}>2% Commission</div>
              </div>
              
              <div className="space-y-2">
                <div className="p-2 rounded-md bg-black/30">
                  <div className="text-[10px] text-muted-foreground mb-0.5">3rd Tier Referrals</div>
                  <div className="text-sm font-bold text-white">2 Users</div>
                </div>
                <div className="p-2 rounded-md bg-black/30">
                  <div className="text-[10px] text-muted-foreground mb-0.5">Total Volume</div>
                  <div className="text-sm font-bold" style={{color: '#cd7f32'}}>1,000,000 $MEMES</div>
                </div>
                <div className="p-2 rounded-md" style={{background: 'rgba(0, 255, 136, 0.15)', border: '1px solid rgba(0, 255, 136, 0.25)'}}>
                  <div className="text-[10px] text-muted-foreground mb-0.5">You Earned</div>
                  <div className="text-sm font-bold" style={{color: '#00ff88'}}>20,000 $MEMES</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Earnings Banner */}
          <div className="p-4 rounded-lg text-center" style={{background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1))', border: '1px solid rgba(0, 255, 136, 0.4)', boxShadow: '0 3px 15px rgba(0, 255, 136, 0.2)'}}>
            <div className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">Total Referral Earnings</div>
            <div className="text-2xl font-bold mb-1" style={{color: '#00ff88'}}>345,000 $MEMES</div>
            <div className="text-[10px] text-gray-500">From 5B Referral Pool (10% of Total Supply)</div>
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