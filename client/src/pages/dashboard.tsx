import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import memeStakeLogo from "@assets/ChatGPT Image Aug 27, 2025, 09_52_01 PM_1756366058294.png";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [airdropTime, setAirdropTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [tokenBalance, setTokenBalance] = useState(125000);
  const [stakingRewards, setStakingRewards] = useState(28475);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const { toast } = useToast();

  // Load wallet address from localStorage
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

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
    toast({
      title: "Staking Started!",
      description: "Your tokens are now earning rewards.",
    });
  };

  return (
    <div className="min-h-screen text-foreground" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1421 100%)'}} data-testid="dashboard-page">
      
      {/* Header */}
      <header className="border-b border-border" style={{background: 'rgba(15, 10, 35, 0.8)'}} data-testid="dashboard-header">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img 
                src={memeStakeLogo} 
                alt="MemeStake Logo" 
                className="w-12 h-12 rounded-lg"
                style={{filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.2))'}}
              />
              <span className="text-xl font-bold text-white">MemeStake Dashboard</span>
            </div>
            
            {/* Back to Home */}
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              data-testid="button-back-home"
            >
              🏠 Back to Home
            </Button>
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
                <span className="font-bold" style={{color: '#00ff88'}}>365% (1% Daily)</span>
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
                className="w-full mt-4 gradient-button" 
                onClick={handleStakeTokens}
                data-testid="button-stake-more"
              >
                💎 Stake More Tokens
              </Button>
            </div>
          </Card>
        </div>

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

        {/* Referrals & Community */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Referrals */}
          <Card className="p-6 glass-card">
            <h3 className="text-lg font-semibold mb-4">🎁 3-Level Referral Program</h3>
            <div className="space-y-4">
              {/* Level 1 Referrals */}
              <div className="p-3 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🥇</span>
                    <span className="font-semibold text-sm" style={{color: '#ffd700'}}>Level 1 (5%)</span>
                  </div>
                  <span className="text-sm font-bold text-white">8 Referrals</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Volume</div>
                    <div className="font-bold" style={{color: '#ffd700'}}>5,000,000 $MEMES</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">You Earned</div>
                    <div className="font-bold" style={{color: '#00ff88'}}>250,000 $MEMES</div>
                  </div>
                </div>
              </div>

              {/* Level 2 Referrals */}
              <div className="p-3 rounded-lg" style={{background: 'rgba(192, 192, 192, 0.1)', border: '1px solid rgba(192, 192, 192, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🥈</span>
                    <span className="font-semibold text-sm" style={{color: '#c0c0c0'}}>Level 2 (3%)</span>
                  </div>
                  <span className="text-sm font-bold text-white">5 Referrals</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Volume</div>
                    <div className="font-bold" style={{color: '#c0c0c0'}}>2,500,000 $MEMES</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">You Earned</div>
                    <div className="font-bold" style={{color: '#00ff88'}}>75,000 $MEMES</div>
                  </div>
                </div>
              </div>

              {/* Level 3 Referrals */}
              <div className="p-3 rounded-lg" style={{background: 'rgba(205, 127, 50, 0.1)', border: '1px solid rgba(205, 127, 50, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🥉</span>
                    <span className="font-semibold text-sm" style={{color: '#cd7f32'}}>Level 3 (2%)</span>
                  </div>
                  <span className="text-sm font-bold text-white">2 Referrals</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Volume</div>
                    <div className="font-bold" style={{color: '#cd7f32'}}>1,000,000 $MEMES</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">You Earned</div>
                    <div className="font-bold" style={{color: '#00ff88'}}>20,000 $MEMES</div>
                  </div>
                </div>
              </div>

              {/* Total Earnings */}
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
                <div className="text-sm text-muted-foreground mb-1">Total Referral Earnings</div>
                <div className="text-2xl font-bold" style={{color: '#00ff88'}}>345,000 $MEMES</div>
              </div>

              <Button variant="outline" className="w-full">
                📋 Copy Referral Link
              </Button>
            </div>
          </Card>

          {/* Community Stats */}
          <Card className="p-6 glass-card">
            <h3 className="text-lg font-semibold mb-4">🌟 Community</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Stakers:</span>
                <span className="font-bold" style={{color: '#00ff88'}}>47,832</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Supply:</span>
                <span className="font-bold" style={{color: '#ffd700'}}>50B $MEMES</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Token Price:</span>
                <span className="font-bold" style={{color: '#00bfff'}}>$0.0001</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Your Rank:</span>
                <span className="font-bold" style={{color: '#00ff88'}}>#1,847</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Referral Pool:</span>
                <span className="font-bold" style={{color: '#ff6b6b'}}>5B $MEMES (10%)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}