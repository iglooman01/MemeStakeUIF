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
  const [showBuyPreview, setShowBuyPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [purchasedTokens, setPurchasedTokens] = useState(0);
  const [txHash] = useState('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b');
  const [isClaiming, setIsClaiming] = useState(false);
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
    }
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "✅ Copied!",
      description: "Referral link copied to clipboard",
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
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <a 
                href="#about" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  const aboutSection = document.getElementById('about-section');
                  aboutSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                About us
              </a>
              <a 
                href="#tokenomics" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  const tokenomicsSection = document.getElementById('tokenomics-section');
                  tokenomicsSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Tokenomics
              </a>
              <a 
                href="#roadmap" 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  const roadmapSection = document.getElementById('roadmap-section');
                  roadmapSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Roadmap
              </a>
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

              {/* Claim Airdrop Button */}
              <div className="mt-6">
                <a
                  href="https://mems-ui-server-dashbaord.replit.app/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                  data-testid="link-claim-airdrop"
                >
                  <button
                    className="w-full py-5 px-8 rounded-xl font-bold text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
                      color: '#000',
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4)',
                      animation: 'pulse-glow 2s ease-in-out infinite'
                    }}
                    data-testid="button-claim-airdrop"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      🎁 CLAIM YOUR AIRDROP NOW! 🚀
                    </span>
                  </button>
                </a>
              </div>
            </div>

            <style>{`
              @keyframes pulse-glow {
                0%, 100% {
                  box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4);
                  transform: scale(1);
                }
                50% {
                  box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 215, 0, 0.6);
                  transform: scale(1.02);
                }
              }
            `}</style>

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

        {/* Buy MEMES Tokens Section */}
        <Card className="p-6 glass-card">
          <h3 className="text-xl font-semibold mb-4">🛒 Buy $MEMES Tokens</h3>
          
          <div className="space-y-4">
            {/* Amount Input with Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-muted-foreground">Purchase Amount</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setInputMode('usd')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      inputMode === 'usd' ? 'text-black' : 'text-gray-400'
                    }`}
                    style={{background: inputMode === 'usd' ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'}}
                    data-testid="toggle-usd"
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setInputMode('token')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      inputMode === 'token' ? 'text-black' : 'text-gray-400'
                    }`}
                    style={{background: inputMode === 'token' ? '#ffd700' : 'rgba(255, 255, 255, 0.1)'}}
                    data-testid="toggle-token"
                  >
                    TOKEN
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                  {inputMode === 'usd' ? '$' : ''}
                </span>
                <input
                  type="number"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  placeholder={inputMode === 'usd' ? '50.00' : '500000'}
                  className="w-full pl-8 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white font-semibold"
                  data-testid="input-buy-amount"
                />
              </div>
            </div>

            {/* Live Conversion Display */}
            <div className="p-3 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">You will receive</div>
                <div className="text-2xl font-bold" style={{color: '#00bfff'}}>
                  {tokensToGet.toLocaleString()} $MEMES
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ≈ ${usdAmount.toFixed(2)} USD @ $0.0001 per token
                </div>
              </div>
            </div>

            {/* Purchase Info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                <div className="text-muted-foreground">Min Purchase</div>
                <div className="font-bold" style={{color: '#ffd700'}}>$50 USD</div>
              </div>
              <div className="p-2 rounded" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
                <div className="text-muted-foreground">Max Purchase</div>
                <div className="font-bold" style={{color: '#00ff88'}}>No Limit</div>
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Referral Code (Optional)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code or use from URL"
                className="w-full px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm"
                data-testid="input-referral-code"
              />
              {referralCode && (
                <div className="mt-2 text-xs" style={{color: '#00ff88'}}>
                  ✅ Referral code applied: {referralCode.slice(0, 6)}...{referralCode.slice(-4)}
                </div>
              )}
            </div>

            {/* Buy Button */}
            <Button 
              onClick={handleBuyTokens}
              disabled={!buyAmount || parseFloat(buyAmount) <= 0}
              className="w-full"
              style={{background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', color: '#000'}}
              data-testid="button-buy-tokens"
            >
              🛒 Buy {tokensToGet > 0 ? tokensToGet.toLocaleString() : ''} $MEMES Tokens
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
        <Card className="p-8 glass-card" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)', border: '2px solid rgba(0, 255, 136, 0.3)', boxShadow: '0 8px 32px rgba(0, 255, 136, 0.15)'}}>
          <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#00ff88'}}>
            🎁 3-Level Referral Program
          </h2>
          
          {/* Landscape Layout - 3 Levels Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Level 1 */}
            <div className="p-6 rounded-xl transition-all hover:scale-105 hover:shadow-2xl" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))', border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)'}}>
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">🥇</div>
                <h3 className="text-2xl font-bold mb-2" style={{color: '#ffd700'}}>Level 1</h3>
                <div className="text-lg font-semibold" style={{color: '#ffd700'}}>5% Commission</div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/30">
                  <div className="text-xs text-muted-foreground mb-1">Direct Referrals</div>
                  <div className="text-xl font-bold text-white">8 Users</div>
                </div>
                <div className="p-3 rounded-lg bg-black/30">
                  <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
                  <div className="text-lg font-bold" style={{color: '#ffd700'}}>5,000,000 $MEMES</div>
                </div>
                <div className="p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.2)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
                  <div className="text-xs text-muted-foreground mb-1">You Earned</div>
                  <div className="text-xl font-bold" style={{color: '#00ff88'}}>250,000 $MEMES</div>
                </div>
              </div>
            </div>

            {/* Level 2 */}
            <div className="p-6 rounded-xl transition-all hover:scale-105 hover:shadow-2xl" style={{background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(192, 192, 192, 0.1))', border: '2px solid rgba(192, 192, 192, 0.4)', boxShadow: '0 4px 20px rgba(192, 192, 192, 0.2)'}}>
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">🥈</div>
                <h3 className="text-2xl font-bold mb-2" style={{color: '#c0c0c0'}}>Level 2</h3>
                <div className="text-lg font-semibold" style={{color: '#c0c0c0'}}>3% Commission</div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/30">
                  <div className="text-xs text-muted-foreground mb-1">2nd Tier Referrals</div>
                  <div className="text-xl font-bold text-white">5 Users</div>
                </div>
                <div className="p-3 rounded-lg bg-black/30">
                  <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
                  <div className="text-lg font-bold" style={{color: '#c0c0c0'}}>2,500,000 $MEMES</div>
                </div>
                <div className="p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.2)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
                  <div className="text-xs text-muted-foreground mb-1">You Earned</div>
                  <div className="text-xl font-bold" style={{color: '#00ff88'}}>75,000 $MEMES</div>
                </div>
              </div>
            </div>

            {/* Level 3 */}
            <div className="p-6 rounded-xl transition-all hover:scale-105 hover:shadow-2xl" style={{background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(205, 127, 50, 0.1))', border: '2px solid rgba(205, 127, 50, 0.4)', boxShadow: '0 4px 20px rgba(205, 127, 50, 0.2)'}}>
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">🥉</div>
                <h3 className="text-2xl font-bold mb-2" style={{color: '#cd7f32'}}>Level 3</h3>
                <div className="text-lg font-semibold" style={{color: '#cd7f32'}}>2% Commission</div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-black/30">
                  <div className="text-xs text-muted-foreground mb-1">3rd Tier Referrals</div>
                  <div className="text-xl font-bold text-white">2 Users</div>
                </div>
                <div className="p-3 rounded-lg bg-black/30">
                  <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
                  <div className="text-lg font-bold" style={{color: '#cd7f32'}}>1,000,000 $MEMES</div>
                </div>
                <div className="p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.2)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
                  <div className="text-xs text-muted-foreground mb-1">You Earned</div>
                  <div className="text-xl font-bold" style={{color: '#00ff88'}}>20,000 $MEMES</div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Earnings Banner */}
          <div className="p-6 rounded-xl text-center" style={{background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.3), rgba(0, 255, 136, 0.15))', border: '2px solid rgba(0, 255, 136, 0.5)', boxShadow: '0 6px 30px rgba(0, 255, 136, 0.3)'}}>
            <div className="text-sm text-gray-300 mb-2 font-semibold">💰 TOTAL REFERRAL EARNINGS</div>
            <div className="text-4xl font-bold" style={{color: '#00ff88'}}>345,000 $MEMES</div>
            <div className="text-sm text-gray-400 mt-2">From 5B Referral Pool (10% of Total Supply)</div>
          </div>
        </Card>

        {/* Main Information Sections */}
        <div className="space-y-6">
          {/* 1. Platform & Token Details */}
          <Card className="p-8 glass-card" id="tokenomics-section" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)', border: '2px solid rgba(255, 215, 0, 0.2)'}}>
            <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#ffd700'}}>
              💎 Platform & Token Details
            </h2>
            
            <div className="space-y-8">
              {/* Token Contract */}
              <div className="p-6 rounded-xl" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 191, 255, 0.15) 100%)', border: '2px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 4px 20px rgba(255, 215, 0, 0.1)'}}>
                <h3 className="text-2xl font-bold mb-4 text-center" style={{color: '#ffd700'}}>📄 Contract Information</h3>
                
                <div className="p-4 rounded-lg mb-4" style={{background: 'rgba(0, 0, 0, 0.4)', border: '2px solid rgba(255, 215, 0, 0.3)'}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-300">Contract Address</span>
                    <button className="px-4 py-2 rounded-md text-xs font-bold transition-all hover:scale-110" style={{background: 'linear-gradient(135deg, #ffd700, #ffed4e)', color: '#000', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'}}>
                      📋 Copy
                    </button>
                  </div>
                  <div className="font-mono text-base font-bold break-all" style={{color: '#ffd700'}}>
                    0x90950A338595dD5438F71839f01a882632a54587
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl text-center transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.2), rgba(0, 191, 255, 0.1))', border: '2px solid rgba(0, 191, 255, 0.4)'}}>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Token Name</div>
                    <div className="text-base font-bold" style={{color: '#00bfff'}}>MemeStake</div>
                  </div>
                  <div className="p-4 rounded-xl text-center transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1))', border: '2px solid rgba(0, 255, 136, 0.4)'}}>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Symbol</div>
                    <div className="text-base font-bold" style={{color: '#00ff88'}}>MEMES</div>
                  </div>
                  <div className="p-4 rounded-xl text-center transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.2), rgba(255, 105, 180, 0.1))', border: '2px solid rgba(255, 105, 180, 0.4)'}}>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Decimals</div>
                    <div className="text-base font-bold" style={{color: '#ff69b4'}}>18</div>
                  </div>
                  <div className="p-4 rounded-xl text-center transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))', border: '2px solid rgba(255, 215, 0, 0.4)'}}>
                    <div className="text-xs font-semibold text-gray-400 mb-1">Network</div>
                    <div className="text-base font-bold" style={{color: '#ffd700'}}>BNB Chain</div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <a
                    href="https://bscscan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 p-3 rounded-xl text-center text-sm font-bold transition-all hover:scale-105"
                    style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.2))', border: '2px solid rgba(255, 215, 0, 0.4)', color: '#ffd700', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'}}
                  >
                    📄 View on BscScan
                  </a>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 p-3 rounded-xl text-center text-sm font-bold transition-all hover:scale-105"
                    style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.3), rgba(0, 191, 255, 0.2))', border: '2px solid rgba(0, 191, 255, 0.4)', color: '#00bfff', boxShadow: '0 4px 15px rgba(0, 191, 255, 0.2)'}}
                  >
                    📥 Whitepaper
                  </a>
                </div>
              </div>

              {/* Tokenomics */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#00bfff'}}>📊 Tokenomics Overview</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))', border: '2px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.1)'}}>
                    <div className="text-sm font-semibold text-gray-400 mb-2">Total Supply</div>
                    <div className="text-2xl font-bold" style={{color: '#ffd700'}}>50,000,000,000 $MEMES</div>
                  </div>
                  <div className="p-5 rounded-xl transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.15), rgba(0, 191, 255, 0.05))', border: '2px solid rgba(0, 191, 255, 0.3)', boxShadow: '0 4px 15px rgba(0, 191, 255, 0.1)'}}>
                    <div className="text-sm font-semibold text-gray-400 mb-2">Token Price</div>
                    <div className="text-2xl font-bold" style={{color: '#00bfff'}}>$0.0001</div>
                  </div>
                  <div className="p-5 rounded-xl transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05))', border: '2px solid rgba(0, 255, 136, 0.3)', boxShadow: '0 4px 15px rgba(0, 255, 136, 0.1)'}}>
                    <div className="text-sm font-semibold text-gray-400 mb-2">Public Sale</div>
                    <div className="text-2xl font-bold" style={{color: '#00ff88'}}>25B Tokens (50%)</div>
                  </div>
                  <div className="p-5 rounded-xl transition-all hover:scale-105" style={{background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.15), rgba(255, 105, 180, 0.05))', border: '2px solid rgba(255, 105, 180, 0.3)', boxShadow: '0 4px 15px rgba(255, 105, 180, 0.1)'}}>
                    <div className="text-sm font-semibold text-gray-400 mb-2">Blockchain</div>
                    <div className="text-2xl font-bold" style={{color: '#ff69b4'}}>BNB Chain (BEP-20)</div>
                  </div>
                </div>
              </div>

              {/* Staking Features */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-center" style={{color: '#00ff88'}}>💰 Staking Features</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-6 rounded-xl transition-all hover:scale-105 cursor-pointer" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))', border: '2px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.1)'}}>
                    <div className="text-4xl mb-3">💰</div>
                    <div className="text-lg font-bold mb-2" style={{color: '#ffd700'}}>High APY</div>
                    <div className="text-sm font-semibold text-gray-400">Up to 365% APY</div>
                  </div>
                  <div className="text-center p-6 rounded-xl transition-all hover:scale-105 cursor-pointer" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.15), rgba(0, 191, 255, 0.05))', border: '2px solid rgba(0, 191, 255, 0.3)', boxShadow: '0 4px 15px rgba(0, 191, 255, 0.1)'}}>
                    <div className="text-4xl mb-3">🔒</div>
                    <div className="text-lg font-bold mb-2" style={{color: '#00bfff'}}>Flexible Periods</div>
                    <div className="text-sm font-semibold text-gray-400">anytime unstake</div>
                  </div>
                  <div className="text-center p-6 rounded-xl transition-all hover:scale-105 cursor-pointer" style={{background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05))', border: '2px solid rgba(0, 255, 136, 0.3)', boxShadow: '0 4px 15px rgba(0, 255, 136, 0.1)'}}>
                    <div className="text-4xl mb-3">⚡</div>
                    <div className="text-lg font-bold mb-2" style={{color: '#00ff88'}}>Daily Rewards</div>
                    <div className="text-sm font-semibold text-gray-400">1% per day</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Roadmap Section */}
          <Card className="p-8 glass-card" id="roadmap-section" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)', border: '2px solid rgba(0, 191, 255, 0.2)'}}>
            <h2 className="text-4xl font-bold mb-4 text-center" style={{color: '#ffd700'}}>
              🗺️ Roadmap
            </h2>
            <p className="text-center text-gray-400 mb-8 text-lg">Our journey to revolutionize the memes ecosystem</p>
            
            <div className="space-y-6">
              {/* Q1 2025 */}
              <div className="p-6 rounded-xl transition-all hover:scale-[1.02]" style={{background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 255, 136, 0.05))', border: '2px solid rgba(0, 255, 136, 0.3)', boxShadow: '0 4px 15px rgba(0, 255, 136, 0.1)'}}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{background: 'rgba(0, 255, 136, 0.3)', border: '3px solid rgba(0, 255, 136, 0.5)'}}>
                    🎉
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold" style={{color: '#00ff88'}}>Q1 2025 - Platform Launch</h3>
                      <span className="px-4 py-1 rounded-full text-xs font-bold" style={{background: 'rgba(0, 255, 136, 0.3)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.5)'}}>✅ COMPLETED</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span className="text-green-500">✅</span>
                        <span>Airdrop system launch</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span className="text-green-500">✅</span>
                        <span>Social media integration</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span className="text-green-500">✅</span>
                        <span>Email verification</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span className="text-green-500">✅</span>
                        <span>Referral program</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span className="text-green-500">✅</span>
                        <span>Community dashboard</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span className="text-green-500">✅</span>
                        <span>Token contract deploy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q2 2025 */}
              <div className="p-6 rounded-xl transition-all hover:scale-[1.02]" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))', border: '2px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.1)'}}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-3xl animate-pulse" style={{background: 'rgba(255, 215, 0, 0.3)', border: '3px solid rgba(255, 215, 0, 0.5)'}}>
                    ⚡
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold" style={{color: '#ffd700'}}>Q2 2025 - Enhanced Features</h3>
                      <span className="px-4 py-1 rounded-full text-xs font-bold animate-pulse" style={{background: 'rgba(255, 215, 0, 0.3)', color: '#ffd700', border: '1px solid rgba(255, 215, 0, 0.5)'}}>🔄 IN PROGRESS</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🎯</span>
                        <span>Advanced staking pools</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🏆</span>
                        <span>Multi-tier rewards</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>📱</span>
                        <span>Mobile app</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🤝</span>
                        <span>Partnership integrations</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🔒</span>
                        <span>Enhanced security</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🛠️</span>
                        <span>Developer API</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q3 2025 */}
              <div className="p-6 rounded-xl transition-all hover:scale-[1.02]" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.15), rgba(0, 191, 255, 0.05))', border: '2px solid rgba(0, 191, 255, 0.3)', boxShadow: '0 4px 15px rgba(0, 191, 255, 0.1)'}}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{background: 'rgba(0, 191, 255, 0.3)', border: '3px solid rgba(0, 191, 255, 0.5)'}}>
                    🚀
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold" style={{color: '#00bfff'}}>Q3 2025 - Ecosystem Expansion</h3>
                      <span className="px-4 py-1 rounded-full text-xs font-bold" style={{background: 'rgba(0, 191, 255, 0.3)', color: '#00bfff', border: '1px solid rgba(0, 191, 255, 0.5)'}}>🔮 UPCOMING</span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🎨</span>
                        <span>NFT marketplace</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🎮</span>
                        <span>Play-to-earn games</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🌐</span>
                        <span>Cross-chain integration</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🗳️</span>
                        <span>DAO governance</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🚜</span>
                        <span>DeFi yield farming</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                        <span>🏆</span>
                        <span>Community tournaments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 p-6 rounded-xl" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 191, 255, 0.1))', border: '2px solid rgba(255, 215, 0, 0.2)'}}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-bold text-gray-300">Overall Progress</span>
                <span className="text-lg font-bold" style={{color: '#ffd700'}}>40%</span>
              </div>
              <div className="w-full rounded-full h-3" style={{background: 'rgba(0, 0, 0, 0.3)'}}>
                <div className="h-3 rounded-full transition-all" style={{width: '40%', background: 'linear-gradient(90deg, #ffd700 0%, #00bfff 50%, #00ff88 100%)', boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)'}}></div>
              </div>
              <p className="text-sm text-gray-400 mt-3 text-center font-semibold">Revolutionizing the memes ecosystem, one milestone at a time</p>
            </div>
          </Card>

          {/* 3. FAQ Section */}
          <Card className="p-8 glass-card" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)', border: '2px solid rgba(255, 105, 180, 0.2)'}}>
            <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#ffd700'}}>
              ❓ Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <details className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))', border: '2px solid rgba(255, 215, 0, 0.2)'}}>
                <summary className="text-lg font-bold" style={{color: '#ffd700'}}>What is MemeStake?</summary>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                  MemeStake is a stake-to-earn meme token project with audited contracts, transparent tokenomics, and community rewards.
                </p>
              </details>
              
              <details className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(0, 191, 255, 0.05))', border: '2px solid rgba(0, 191, 255, 0.2)'}}>
                <summary className="text-lg font-bold" style={{color: '#00bfff'}}>How do I earn rewards?</summary>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                  Stake $MEMES tokens to earn 365% APY (1% daily rewards). Plus earn referral bonuses at 3 levels: 5%, 3%, and 2%.
                </p>
              </details>
              
              <details className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]" style={{background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 255, 136, 0.05))', border: '2px solid rgba(0, 255, 136, 0.2)'}}>
                <summary className="text-lg font-bold" style={{color: '#00ff88'}}>Is my investment safe?</summary>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                  Yes. The contracts are audited and reports will be linked from our whitepaper once final review is complete.
                </p>
              </details>
              
              <details className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]" style={{background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.1), rgba(255, 105, 180, 0.05))', border: '2px solid rgba(255, 105, 180, 0.2)'}}>
                <summary className="text-lg font-bold" style={{color: '#ff69b4'}}>When can I withdraw my tokens?</summary>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                  Minimum staking period is 50 days for penalty-free unstake. Early unstaking incurs a 20% penalty.
                </p>
              </details>
            </div>
          </Card>

          {/* 4. About MemeStake */}
          <Card className="p-8 glass-card" id="about-section" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)', border: '2px solid rgba(0, 255, 136, 0.2)'}}>
            <h2 className="text-4xl font-bold mb-8 text-center" style={{color: '#ffd700'}}>
              🚀 About MemeStake
            </h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-xl" style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.15), rgba(0, 191, 255, 0.05))', border: '2px solid rgba(0, 191, 255, 0.3)'}}>
                <h3 className="text-2xl font-bold mb-4" style={{color: '#00bfff'}}>Our Mission</h3>
                <p className="text-gray-300 leading-relaxed text-base">
                  MemeStake is revolutionizing the meme coin ecosystem by combining decentralized airdrops with innovative staking mechanisms. 
                  We deliver tokens direct to your wallet while building the strongest meme community in crypto.
                </p>
              </div>
              
              <div className="p-6 rounded-xl" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05))', border: '2px solid rgba(255, 215, 0, 0.3)'}}>
                <h3 className="text-2xl font-bold mb-4" style={{color: '#ffd700'}}>Why Choose Us?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
                    <span className="text-xl">✅</span>
                    <span className="text-sm font-semibold text-gray-300">True decentralized rewards system</span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
                    <span className="text-xl">✅</span>
                    <span className="text-sm font-semibold text-gray-300">Community-driven governance</span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
                    <span className="text-xl">✅</span>
                    <span className="text-sm font-semibold text-gray-300">High-yield staking opportunities</span>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
                    <span className="text-xl">✅</span>
                    <span className="text-sm font-semibold text-gray-300">Transparent tokenomics</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 5. Join Our Community */}
          <Card className="p-8 glass-card" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)', border: '2px solid rgba(255, 215, 0, 0.2)'}}>
            <h2 className="text-4xl font-bold mb-4 text-center" style={{color: '#ffd700'}}>
              🌟 Join Our Community
            </h2>
            <p className="text-center text-gray-400 mb-8 text-lg font-semibold">
              Connect with 47,000+ members! Get real-time updates, share strategies, and never miss an opportunity.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <a
                href="https://t.me/memestake_group"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-xl text-center transition-all hover:scale-110 cursor-pointer"
                style={{background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.2), rgba(0, 191, 255, 0.1))', border: '2px solid rgba(0, 191, 255, 0.4)', boxShadow: '0 4px 15px rgba(0, 191, 255, 0.2)'}}
              >
                <div className="text-5xl mb-3">✈️</div>
                <div className="text-lg font-bold mb-2" style={{color: '#00bfff'}}>Telegram Group</div>
                <div className="text-sm text-gray-400 font-semibold">Chat & Discussion</div>
              </a>
              
              <a
                href="https://t.me/memestake_official"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-xl text-center transition-all hover:scale-110 cursor-pointer"
                style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))', border: '2px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'}}
              >
                <div className="text-5xl mb-3">📢</div>
                <div className="text-lg font-bold mb-2" style={{color: '#ffd700'}}>Official Channel</div>
                <div className="text-sm text-gray-400 font-semibold">News & Updates</div>
              </a>
              
              <a
                href="https://twitter.com/memestake_official"
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-xl text-center transition-all hover:scale-110 cursor-pointer"
                style={{background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 255, 136, 0.1))', border: '2px solid rgba(0, 255, 136, 0.4)', boxShadow: '0 4px 15px rgba(0, 255, 136, 0.2)'}}
              >
                <div className="text-5xl mb-3">🐦</div>
                <div className="text-lg font-bold mb-2" style={{color: '#00ff88'}}>Twitter/X</div>
                <div className="text-sm text-gray-400 font-semibold">Follow Updates</div>
              </a>
            </div>
          </Card>
        </div>
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