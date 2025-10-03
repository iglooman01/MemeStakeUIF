import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import memeStakeLogo from "@assets/ChatGPT Image Aug 27, 2025, 09_52_01 PM_1756366058294.png";

export default function Staking() {
  const [location, setLocation] = useLocation();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'stake' | 'unstake'>('stake');
  const [tokenBalance, setTokenBalance] = useState(1250000);
  const [stakedAmount, setStakedAmount] = useState(100000);
  const [stakingStartDate] = useState(new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)); // 25 days ago
  const [rewardsToday, setRewardsToday] = useState(1000);
  const [claimableRewards, setClaimableRewards] = useState(25000);
  const [lifetimeEarned, setLifetimeEarned] = useState(28475);
  const [isApproved, setIsApproved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState('0.0012');
  const { toast } = useToast();

  const APY = 365;
  const DAILY_RATE = 1;
  const MIN_STAKE_DAYS = 50;

  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  const getDaysStaked = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - stakingStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsApproved(true);
      setIsProcessing(false);
      toast({
        title: "✅ Approved!",
        description: "Smart contract approved successfully. You can now stake your tokens.",
      });
    }, 2000);
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "❌ Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(stakeAmount) > tokenBalance) {
      toast({
        title: "❌ Insufficient Balance",
        description: "You don't have enough tokens to stake",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const amount = parseFloat(stakeAmount);
      setStakedAmount(prev => prev + amount);
      setTokenBalance(prev => prev - amount);
      setStakeAmount('');
      setIsProcessing(false);
      toast({
        title: "🎉 Staking Successful!",
        description: `Successfully staked ${amount.toLocaleString()} $MEMES tokens`,
      });
    }, 2500);
  };

  const handleUnstake = async (isEarlyUnstake: boolean = false) => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast({
        title: "❌ Invalid Amount",
        description: "Please enter a valid unstaking amount",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(unstakeAmount) > stakedAmount) {
      toast({
        title: "❌ Insufficient Staked Balance",
        description: "You don't have enough staked tokens",
        variant: "destructive"
      });
      return;
    }

    const daysStaked = getDaysStaked();
    let finalAmount = parseFloat(unstakeAmount);
    let penaltyAmount = 0;

    if (isEarlyUnstake && daysStaked < MIN_STAKE_DAYS) {
      penaltyAmount = claimableRewards;
      finalAmount = finalAmount - penaltyAmount;
      
      toast({
        title: "⚠️ Early Unstake Penalty",
        description: `Early unstake detected! All rewards (${penaltyAmount.toLocaleString()} $MEMES) deducted from principal. You will receive ${finalAmount.toLocaleString()} $MEMES.`,
        variant: "destructive"
      });
    }

    setIsProcessing(true);
    setTimeout(() => {
      setStakedAmount(prev => prev - parseFloat(unstakeAmount));
      setTokenBalance(prev => prev + finalAmount);
      setClaimableRewards(prev => isEarlyUnstake && daysStaked < MIN_STAKE_DAYS ? 0 : prev);
      setUnstakeAmount('');
      setIsProcessing(false);
      
      if (!isEarlyUnstake || daysStaked >= MIN_STAKE_DAYS) {
        toast({
          title: "✅ Unstaking Successful!",
          description: `Successfully unstaked ${parseFloat(unstakeAmount).toLocaleString()} $MEMES tokens`,
        });
      }
    }, 2500);
  };

  const handleClaimRewards = async () => {
    if (claimableRewards <= 0) {
      toast({
        title: "❌ No Rewards",
        description: "You don't have any rewards to claim",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setTokenBalance(prev => prev + claimableRewards);
      setClaimableRewards(0);
      setIsProcessing(false);
      toast({
        title: "🎉 Rewards Claimed!",
        description: `Successfully claimed ${claimableRewards.toLocaleString()} $MEMES tokens`,
      });
    }, 2000);
  };

  const daysStaked = getDaysStaked();
  const remainingDays = Math.max(0, MIN_STAKE_DAYS - daysStaked);

  return (
    <div className="min-h-screen text-foreground" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1421 100%)'}} data-testid="staking-page">
      
      {/* Header */}
      <header className="border-b border-border" style={{background: 'rgba(15, 10, 35, 0.8)'}} data-testid="staking-header">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src={memeStakeLogo} 
                alt="MemeStake Logo" 
                className="w-12 h-12 rounded-lg"
                style={{filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.2))'}}
              />
              <span className="text-xl font-bold text-white">Staking Portal</span>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setLocation('/dashboard')}
              data-testid="button-back-dashboard"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* APY Banner */}
        <Card className="p-6 glass-card text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div>
              <div className="text-4xl font-bold" style={{color: '#00ff88'}}>365% APY</div>
              <div className="text-sm text-muted-foreground">Annual Percentage Yield</div>
            </div>
            <div className="text-3xl">💎</div>
            <div>
              <div className="text-4xl font-bold" style={{color: '#ffd700'}}>1% Daily</div>
              <div className="text-sm text-muted-foreground">Daily Returns</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Earn consistent daily rewards on your staked $MEMES tokens
          </p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Staking Panel */}
          <Card className="p-6 glass-card">
            <h3 className="text-xl font-semibold mb-4">💰 Stake/Unstake</h3>
            
            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setActiveTab('stake')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'stake' 
                    ? 'text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  background: activeTab === 'stake' ? '#ffd700' : 'rgba(255, 255, 255, 0.05)'
                }}
                data-testid="tab-stake"
              >
                Stake
              </button>
              <button
                onClick={() => setActiveTab('unstake')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  activeTab === 'unstake' 
                    ? 'text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  background: activeTab === 'unstake' ? '#ffd700' : 'rgba(255, 255, 255, 0.05)'
                }}
                data-testid="tab-unstake"
              >
                Unstake
              </button>
            </div>

            {/* Balance Display */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                <div className="text-xs text-muted-foreground mb-1">Wallet Balance</div>
                <div className="font-bold" style={{color: '#ffd700'}}>{tokenBalance.toLocaleString()} $MEMES</div>
              </div>
              <div className="p-3 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                <div className="text-xs text-muted-foreground mb-1">Staked Amount</div>
                <div className="font-bold" style={{color: '#00bfff'}}>{stakedAmount.toLocaleString()} $MEMES</div>
              </div>
            </div>

            {activeTab === 'stake' ? (
              <div className="space-y-4">
                {/* Approval Section */}
                {!isApproved && (
                  <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
                    <p className="text-sm text-gray-300 mb-3">
                      First, approve the smart contract to manage your tokens
                    </p>
                    <Button 
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="w-full"
                      style={{background: '#ffd700', color: '#000'}}
                      data-testid="button-approve"
                    >
                      {isProcessing ? '⏳ Approving...' : '✅ Approve Contract'}
                    </Button>
                  </div>
                )}

                {/* Stake Input */}
                {isApproved && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">Amount to Stake</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          placeholder="0.00"
                          className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white"
                          data-testid="input-stake-amount"
                        />
                        <button
                          onClick={() => setStakeAmount(tokenBalance.toString())}
                          className="px-4 py-2 rounded-lg text-sm font-semibold"
                          style={{background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                          data-testid="button-max-stake"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg text-xs" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Estimated Gas Fee:</span>
                        <span className="font-semibold" style={{color: '#00bfff'}}>{estimatedGas} BNB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected Daily Reward:</span>
                        <span className="font-semibold" style={{color: '#00ff88'}}>
                          {stakeAmount ? (parseFloat(stakeAmount) * 0.01).toLocaleString() : '0'} $MEMES
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={handleStake}
                      disabled={isProcessing || !stakeAmount}
                      className="w-full"
                      style={{background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', color: '#000'}}
                      data-testid="button-stake"
                    >
                      {isProcessing ? '⏳ Staking...' : '💎 Stake Tokens'}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Staking Duration Info */}
                <div className="p-4 rounded-lg" style={{
                  background: remainingDays > 0 ? 'rgba(255, 165, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                  border: remainingDays > 0 ? '1px solid rgba(255, 165, 0, 0.3)' : '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                  <div className="text-sm mb-2">
                    <span className="text-muted-foreground">Days Staked: </span>
                    <span className="font-bold" style={{color: '#ffd700'}}>{daysStaked} days</span>
                  </div>
                  {remainingDays > 0 ? (
                    <div className="text-xs text-orange-400">
                      ⚠️ Early unstake penalty applies! {remainingDays} days remaining for penalty-free unstake.
                    </div>
                  ) : (
                    <div className="text-xs" style={{color: '#00ff88'}}>
                      ✅ You can unstake penalty-free anytime!
                    </div>
                  )}
                </div>

                {/* Unstake Input */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount to Unstake</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white"
                      data-testid="input-unstake-amount"
                    />
                    <button
                      onClick={() => setUnstakeAmount(stakedAmount.toString())}
                      className="px-4 py-2 rounded-lg text-sm font-semibold"
                      style={{background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                      data-testid="button-max-unstake"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg text-xs" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Gas Fee:</span>
                    <span className="font-semibold" style={{color: '#00bfff'}}>{estimatedGas} BNB</span>
                  </div>
                </div>

                {remainingDays > 0 && (
                  <Button 
                    onClick={() => handleUnstake(true)}
                    disabled={isProcessing || !unstakeAmount}
                    className="w-full"
                    variant="destructive"
                    data-testid="button-early-unstake"
                  >
                    {isProcessing ? '⏳ Processing...' : '⚠️ Early Unstake (Penalty Applied)'}
                  </Button>
                )}
                
                <Button 
                  onClick={() => handleUnstake(false)}
                  disabled={isProcessing || !unstakeAmount || remainingDays > 0}
                  className="w-full"
                  style={{background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)', color: '#000'}}
                  data-testid="button-unstake"
                >
                  {isProcessing ? '⏳ Unstaking...' : '💰 Unstake Tokens'}
                </Button>
              </div>
            )}
          </Card>

          {/* Rewards Panel */}
          <Card className="p-6 glass-card">
            <h3 className="text-xl font-semibold mb-4">🎁 Rewards</h3>
            
            <div className="space-y-4">
              {/* Accrued Today */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">⏰ Accrued Today</span>
                  <span className="text-xs" style={{color: '#ffd700'}}>1% Daily</span>
                </div>
                <div className="text-2xl font-bold" style={{color: '#ffd700'}}>
                  {rewardsToday.toLocaleString()} $MEMES
                </div>
              </div>

              {/* Claimable Now */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">💰 Claimable Now</span>
                  <span className="text-xs" style={{color: '#00ff88'}}>{daysStaked} days</span>
                </div>
                <div className="text-2xl font-bold" style={{color: '#00ff88'}}>
                  {claimableRewards.toLocaleString()} $MEMES
                </div>
              </div>

              {/* Lifetime Earned */}
              <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">🏆 Lifetime Earned</span>
                  <span className="text-xs" style={{color: '#00bfff'}}>Total</span>
                </div>
                <div className="text-2xl font-bold" style={{color: '#00bfff'}}>
                  {lifetimeEarned.toLocaleString()} $MEMES
                </div>
              </div>

              {/* Gas Estimation for Claim */}
              <div className="p-3 rounded-lg text-xs" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Gas Fee (Claim):</span>
                  <span className="font-semibold" style={{color: '#00bfff'}}>~{estimatedGas} BNB</span>
                </div>
                <div className="text-muted-foreground">
                  Batching available for multiple claims to save gas
                </div>
              </div>

              {/* Claim Button */}
              <Button 
                onClick={handleClaimRewards}
                disabled={isProcessing || claimableRewards <= 0}
                className="w-full"
                style={{background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)', color: '#000'}}
                data-testid="button-claim-rewards"
              >
                {isProcessing ? '⏳ Claiming...' : `🎁 Claim ${claimableRewards.toLocaleString()} $MEMES`}
              </Button>
            </div>
          </Card>
        </div>

        {/* Important Notice */}
        <Card className="p-4 glass-card">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1 text-sm">
              <p className="font-semibold mb-2" style={{color: '#ffd700'}}>Important Staking Rules:</p>
              <ul className="space-y-1 text-gray-300 text-xs">
                <li>• Minimum staking period: <strong>50 days</strong> for penalty-free unstake</li>
                <li>• Early unstake (before 50 days): <strong>All earned rewards will be deducted</strong> from your principal amount</li>
                <li>• Daily rewards: <strong>1% of staked amount</strong> (365% APY)</li>
                <li>• Rewards can be claimed anytime without affecting your stake</li>
                <li>• Gas fees apply to all transactions (stake, unstake, claim)</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
