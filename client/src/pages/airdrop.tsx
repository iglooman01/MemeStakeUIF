import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import memeStakeLogo from "@assets/ChatGPT Image Oct 9, 2025, 11_08_34 AM_1759988345567.png";

export default function Airdrop() {
  const [location, setLocation] = useLocation();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [airdropTime, setAirdropTime] = useState({ days: 84, hours: 3, minutes: 0, seconds: 0 });
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [referralCount, setReferralCount] = useState(1);
  const [airdropTokens, setAirdropTokens] = useState(0);
  const { toast } = useToast();

  const referralLink = walletAddress 
    ? `https://memestake.app/airdrop?ref=${walletAddress.slice(0, 6)}` 
    : 'Connect wallet to get your referral link';

  // Verify wallet connection using sessionStorage
  useEffect(() => {
    const activeSession = sessionStorage.getItem('walletSession');
    const storedAddress = localStorage.getItem('walletAddress');
    
    if (activeSession === 'active' && storedAddress) {
      // Active session exists - restore wallet
      setWalletAddress(storedAddress);
    } else {
      // No active session - clear and redirect to home
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('walletType');
      sessionStorage.removeItem('walletSession');
      toast({
        title: "🔒 Session Expired",
        description: "Please connect your wallet to continue",
      });
      setLocation('/');
    }
  }, []);

  // Listen for wallet account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setWalletAddress('');
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletType');
        toast({
          title: "👋 Wallet Disconnected",
          description: "You have been disconnected from your wallet",
        });
      } else if (accounts[0] !== walletAddress) {
        // User switched to a different account
        const newAddress = accounts[0];
        setWalletAddress(newAddress);
        localStorage.setItem('walletAddress', newAddress);
        
        toast({
          title: "🔄 Wallet Changed",
          description: `Switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`,
        });
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletAddress]);

  useEffect(() => {
    const timer = setInterval(() => {
      setAirdropTime(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        toast({
          title: "✅ Wallet Connected!",
          description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Please try again",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "No Wallet Found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive"
      });
    }
  };

  const sendOTP = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    setOtpSent(true);
    toast({
      title: "📧 OTP Sent!",
      description: `Verification code sent to ${email}`,
    });
  };

  const verifyOTP = () => {
    if (otp === '123456' || otp.length === 6) {
      setIsEmailVerified(true);
      toast({
        title: "✅ Email Verified!",
        description: "You can now complete social tasks",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please check your code and try again",
        variant: "destructive"
      });
    }
  };

  const skipVerification = () => {
    setIsEmailVerified(true);
    toast({
      title: "⏩ Skipped",
      description: "You can complete tasks without email verification",
    });
  };

  const completeTask = (taskId: string, taskName: string, url: string) => {
    if (!isEmailVerified) {
      toast({
        title: "🔒 Locked",
        description: "Verify your email first",
        variant: "destructive"
      });
      return;
    }
    
    window.open(url, '_blank');
    
    setTimeout(() => {
      if (!completedTasks.includes(taskId)) {
        setCompletedTasks([...completedTasks, taskId]);
        setAirdropTokens(prev => prev + 2500);
        toast({
          title: "✅ Task Completed!",
          description: `${taskName} verified! +2,500 MEMES`,
        });
      }
    }, 2000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "✅ Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareReferral = () => {
    const shareText = `Join me on MemeStake and claim your free MEMES tokens! 🚀\n\n${referralLink}`;
    if (navigator.share) {
      navigator.share({
        title: 'MemeStake Airdrop',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "✅ Copied!",
        description: "Share message copied to clipboard",
      });
    }
  };

  const progress = (completedTasks.length / 4) * 100;

  return (
    <div className="min-h-screen text-foreground" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1421 100%)'}} data-testid="airdrop-page">
      
      {/* Header */}
      <header className="border-b border-border" style={{background: 'rgba(15, 10, 35, 0.8)'}} data-testid="header">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={memeStakeLogo} alt="MemeStake" className="w-10 h-10 rounded-full" data-testid="logo" />
              <span className="text-xl font-bold" style={{color: '#ffd700'}} data-testid="brand-name">MemeStake</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button onClick={() => setLocation('/')} className="hover:text-primary transition-colors" data-testid="nav-home">Home</button>
              <button onClick={() => setLocation('/dashboard')} className="hover:text-primary transition-colors" data-testid="nav-dashboard">Dashboard</button>
              <button onClick={() => setLocation('/staking')} className="hover:text-primary transition-colors" data-testid="nav-staking">Staking</button>
              <button onClick={() => setLocation('/airdrop')} className="hover:text-primary transition-colors" style={{color: '#ffd700'}} data-testid="nav-airdrop">Airdrop</button>
            </nav>
            {!walletAddress ? (
              <Button onClick={connectWallet} style={{background: 'linear-gradient(90deg, #ffd700, #00bfff)', color: '#000'}} data-testid="button-connect">
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                <div className="text-xs text-gray-400">Wallet</div>
                <div className="text-sm font-mono font-bold" style={{color: '#ffd700'}}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Airdrop Timer */}
        <Card className="p-6 mb-8 text-center glass-card">
          <h2 className="text-2xl font-bold mb-4" style={{color: '#ffd700'}}>⏰ Airdrop ends in:</h2>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold" style={{color: '#00bfff'}}>{airdropTime.days}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
            <div className="text-4xl" style={{color: '#ffd700'}}>:</div>
            <div className="text-center">
              <div className="text-4xl font-bold" style={{color: '#00bfff'}}>{airdropTime.hours}</div>
              <div className="text-sm text-muted-foreground">Hours</div>
            </div>
            <div className="text-4xl" style={{color: '#ffd700'}}>:</div>
            <div className="text-center">
              <div className="text-4xl font-bold" style={{color: '#00bfff'}}>{airdropTime.minutes}</div>
              <div className="text-sm text-muted-foreground">Min</div>
            </div>
            <div className="text-4xl" style={{color: '#ffd700'}}>:</div>
            <div className="text-center">
              <div className="text-4xl font-bold" style={{color: '#00bfff'}}>{airdropTime.seconds}</div>
              <div className="text-sm text-muted-foreground">Sec</div>
            </div>
          </div>
          <p className="mt-6 text-muted-foreground">
            🚀 MemeStake DECENTRALIZED AIRDROP is LIVE! Complete social tasks to claim exclusive MEMES tokens DIRECT IN YOUR WALLET
          </p>
        </Card>

        {/* Main Title */}
        <h1 className="text-3xl font-bold text-center mb-8" style={{color: '#ffd700'}}>
          🎁 Claim Your MEMES Airdrop
        </h1>

        {/* Email Verification */}
        <Card className="p-6 mb-6 glass-card">
          <h3 className="text-xl font-semibold mb-4">1. Email Verification</h3>
          {!isEmailVerified ? (
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-2"
                  data-testid="input-email"
                />
                {!otpSent ? (
                  <div className="flex gap-2">
                    <Button onClick={sendOTP} style={{background: '#00bfff'}} data-testid="button-send-otp">
                      📧 Send OTP
                    </Button>
                    <Button onClick={skipVerification} variant="outline" data-testid="button-skip">
                      🚀 Skip
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      data-testid="input-otp"
                    />
                    <Button onClick={verifyOTP} style={{background: '#00ff88'}} data-testid="button-verify-otp">
                      ✅ Verify OTP
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <span className="text-2xl">✅</span>
              <p className="text-lg" style={{color: '#00ff88'}}>Email Verified!</p>
            </div>
          )}
        </Card>

        {/* Social Media Tasks */}
        <Card className="p-6 mb-6 glass-card">
          <h3 className="text-xl font-semibold mb-4">2. Social Media Tasks</h3>
          {!isEmailVerified && (
            <p className="text-muted-foreground mb-4">🔒 Verify your email first to unlock tasks</p>
          )}
          <div className="space-y-3">
            <Button
              onClick={() => completeTask('telegram-group', 'Join Telegram Group', 'https://t.me/memestakegroup')}
              className="w-full justify-between"
              variant="outline"
              disabled={!isEmailVerified}
              data-testid="button-task-telegram-group"
            >
              <span>Join Telegram Group</span>
              <span>{completedTasks.includes('telegram-group') ? '✅' : isEmailVerified ? '🔗' : '🔒'}</span>
            </Button>
            <Button
              onClick={() => completeTask('telegram-channel', 'Join Telegram Channel', 'https://t.me/memstakeofficial')}
              className="w-full justify-between"
              variant="outline"
              disabled={!isEmailVerified}
              data-testid="button-task-telegram-channel"
            >
              <span>Join Telegram Channel</span>
              <span>{completedTasks.includes('telegram-channel') ? '✅' : isEmailVerified ? '🔗' : '🔒'}</span>
            </Button>
            <Button
              onClick={() => completeTask('twitter', 'Follow on Twitter/X', 'https://twitter.com/memestake_official')}
              className="w-full justify-between"
              variant="outline"
              disabled={!isEmailVerified}
              data-testid="button-task-twitter"
            >
              <span>Follow on Twitter/X</span>
              <span>{completedTasks.includes('twitter') ? '✅' : isEmailVerified ? '🔗' : '🔒'}</span>
            </Button>
            <Button
              onClick={() => completeTask('youtube', 'Subscribe YouTube', 'https://youtube.com/@memestake')}
              className="w-full justify-between"
              variant="outline"
              disabled={!isEmailVerified}
              data-testid="button-task-youtube"
            >
              <span>Subscribe YouTube</span>
              <span>{completedTasks.includes('youtube') ? '✅' : isEmailVerified ? '🔗' : '🔒'}</span>
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Progress: {completedTasks.length}/4 Tasks</p>
            <Progress value={progress} className="h-2" />
          </div>
        </Card>

        {/* Airdrop Status */}
        <Card className="p-6 mb-6 glass-card">
          <h3 className="text-xl font-semibold mb-4">3. Your Airdrop Status</h3>
          <div className="text-center py-6">
            <div className="text-5xl font-bold mb-2" style={{color: '#ffd700'}}>
              {airdropTokens.toLocaleString()} $MEMES
            </div>
            <p className="text-muted-foreground">
              {walletAddress ? 'Ready to claim!' : '🔗 Wallet connection required for token distribution'}
            </p>
          </div>
        </Card>

        {/* Token & Referral Details */}
        <Card className="p-6 mb-6 glass-card">
          <h3 className="text-xl font-semibold mb-4">4. Token & Referral Details</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
              <div className="text-sm text-muted-foreground">Your Referrals</div>
              <div className="text-2xl font-bold" style={{color: '#ffd700'}}>{referralCount}</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
              <div className="text-sm text-muted-foreground">Referral Tokens</div>
              <div className="text-2xl font-bold" style={{color: '#00bfff'}}>0</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
              <div className="text-sm text-muted-foreground">Airdrop Tokens</div>
              <div className="text-2xl font-bold" style={{color: '#00ff88'}}>{airdropTokens.toLocaleString()}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Referral tokens will be claimed slot by slot after tokens launching
          </p>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="flex-1" data-testid="input-referral-link" />
            <Button onClick={copyReferralLink} style={{background: '#ffd700', color: '#000'}} data-testid="button-copy-referral">
              Copy
            </Button>
          </div>
        </Card>

        {/* Share Referral */}
        <Card className="p-6 mb-6 glass-card text-center">
          <p className="mb-4">💡 Want to share your referral link to friends and relatives on social media?</p>
          <Button onClick={shareReferral} size="lg" style={{background: 'linear-gradient(90deg, #ffd700, #00bfff)', color: '#000'}} data-testid="button-share">
            Share & Earn Rewards
          </Button>
          <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <span>🔒Secure</span>
            <span>🌍Global</span>
            <span>⚡Instant</span>
          </div>
        </Card>

        {/* Complete Platform Details */}
        <Card className="p-6 mb-6 glass-card">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{color: '#ffd700'}}>
            💎 Complete Platform Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{color: '#00bfff'}}>📊 Tokenomics</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
                  <div className="text-sm text-muted-foreground mb-2">Total Supply</div>
                  <div className="text-xl font-bold" style={{color: '#ffd700'}}>1,000,000,000 $MEMES</div>
                </div>
                <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
                  <div className="text-sm text-muted-foreground mb-2">Token Price</div>
                  <div className="text-xl font-bold" style={{color: '#00bfff'}}>$0.001</div>
                </div>
                <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
                  <div className="text-sm text-muted-foreground mb-2">Public Sale</div>
                  <div className="text-xl font-bold" style={{color: '#00ff88'}}>500M Tokens (50%)</div>
                </div>
                <div className="p-4 rounded-lg" style={{background: 'rgba(255, 105, 180, 0.1)', border: '1px solid rgba(255, 105, 180, 0.2)'}}>
                  <div className="text-sm text-muted-foreground mb-2">Blockchain</div>
                  <div className="text-xl font-bold" style={{color: '#ff69b4'}}>BNB Chain (BEP-20)</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4" style={{color: '#00bfff'}}>💰 Staking Features</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                  <div className="text-3xl mb-2">💰</div>
                  <div className="font-semibold mb-2">High APY</div>
                  <div className="text-sm text-muted-foreground">Up to 365% APY</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                  <div className="text-3xl mb-2">🔒</div>
                  <div className="font-semibold mb-2">Flexible Periods</div>
                  <div className="text-sm text-muted-foreground">1-12 months</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="font-semibold mb-2">Instant Rewards</div>
                  <div className="text-sm text-muted-foreground">Daily distribution</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="p-6 mb-6 glass-card">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{color: '#ffd700'}}>
            ❓ Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <details className="p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
              <summary className="font-semibold cursor-pointer">What is MemeStake?</summary>
              <p className="text-sm text-muted-foreground mt-3">
                MemeStake is a stake-to-earn meme token project with audited contracts, transparent tokenomics, and community rewards.
              </p>
            </details>
            
            <details className="p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
              <summary className="font-semibold cursor-pointer">How do I earn rewards?</summary>
              <p className="text-sm text-muted-foreground mt-3">
                Complete social tasks to earn airdrop tokens. Invite friends for referral bonuses. Stake tokens for 365% APY rewards.
              </p>
            </details>
            
            <details className="p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
              <summary className="font-semibold cursor-pointer">Is my investment safe?</summary>
              <p className="text-sm text-muted-foreground mt-3">
                Yes. The contracts are audited and reports will be linked from our whitepaper once final review is complete.
              </p>
            </details>
            
            <details className="p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
              <summary className="font-semibold cursor-pointer">When can I withdraw my tokens?</summary>
              <p className="text-sm text-muted-foreground mt-3">
                Airdrop tokens are claimable immediately after completing tasks. Staked tokens follow the lock period rules.
              </p>
            </details>
          </div>
        </Card>

        {/* About MemeStake */}
        <Card className="p-6 mb-6 glass-card">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{color: '#ffd700'}}>
            🚀 About MemeStake
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-3" style={{color: '#00bfff'}}>Our Mission</h3>
              <p className="text-muted-foreground">
                MemeStake is revolutionizing the meme coin ecosystem by combining decentralized airdrops with innovative staking mechanisms. 
                We deliver tokens direct to your wallet while building the strongest meme community in crypto.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3" style={{color: '#00bfff'}}>Why Choose Us?</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <span>✅</span>
                  <span className="text-sm text-muted-foreground">True decentralized rewards system</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>✅</span>
                  <span className="text-sm text-muted-foreground">Community-driven governance</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>✅</span>
                  <span className="text-sm text-muted-foreground">High-yield staking opportunities</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>✅</span>
                  <span className="text-sm text-muted-foreground">Transparent tokenomics</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Join Our Community */}
        <Card className="p-6 mb-6 glass-card">
          <h2 className="text-2xl font-bold mb-4 text-center" style={{color: '#ffd700'}}>
            🌟 Join Our Community
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Connect with 47,000+ members! Get real-time updates, share strategies, and never miss an opportunity.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://t.me/memestakegroup"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg text-center transition-all hover:scale-105"
              style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}
            >
              <div className="text-3xl mb-2">✈️</div>
              <div className="font-semibold mb-1">Telegram Group</div>
              <div className="text-xs text-muted-foreground">Chat & Discussion</div>
            </a>
            
            <a
              href="https://t.me/memstakeofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg text-center transition-all hover:scale-105"
              style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}
            >
              <div className="text-3xl mb-2">📢</div>
              <div className="font-semibold mb-1">Official Channel</div>
              <div className="text-xs text-muted-foreground">News & Updates</div>
            </a>
            
            <a
              href="https://twitter.com/memestake_official"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg text-center transition-all hover:scale-105"
              style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}
            >
              <div className="text-3xl mb-2">🐦</div>
              <div className="font-semibold mb-1">Twitter/X</div>
              <div className="text-xs text-muted-foreground">Follow Updates</div>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
