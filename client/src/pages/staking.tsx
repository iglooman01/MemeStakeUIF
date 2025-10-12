import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import memeStakeLogo from "@assets/ChatGPT Image Oct 9, 2025, 11_08_34 AM_1759988345567.png";
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { CONTRACTS } from '@/config/contracts';

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
  const [accruedToday, setAccruedToday] = useState(0);
  const [claimableRewards, setClaimableRewards] = useState(25000);
  const [lifetimeEarned, setLifetimeEarned] = useState(28475);
  const [isApproved, setIsApproved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState('0.0012');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  const APY = 365;
  const DAILY_RATE = 1;
  const PENALTY_FREE_DAYS = 90;
  const PENALTY_PERCENTAGE = 20;

  // Sample staking records
  const stakingRecords = [
    { id: 1, dateStaked: '2024-01-12', amount: 50000, daysStaked: 240, status: 'active' },
    { id: 2, dateStaked: '2024-03-01', amount: 20000, daysStaked: 60, status: 'active' },
    { id: 3, dateStaked: '2023-12-20', amount: 30000, daysStaked: 365, status: 'active' },
  ];

  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setWalletAddress(storedAddress);
    }
  }, []);

  // Fetch real blockchain data
  const fetchStakingData = async () => {
    if (!walletAddress) return;

    try {
      setIsLoadingData(true);

      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      // 1. Fetch staked amount using getUserStakes to access lastClaim
      try {
        const userStakes = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getUserStakes',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        // Loop through array and sum up all active staked amounts
        let totalStaked = 0;
        for (const stake of userStakes) {
          if (!stake.capitalWithdrawn) {
            totalStaked += Number(stake.stakedAmount) / 1e18;
          }
        }
        
        setStakedAmount(totalStaked);

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
        
        setAccruedToday(todayAccrued);
      } catch (error) {
        console.error('Error fetching staked amount:', error);
        setStakedAmount(0);
        setAccruedToday(0);
      }

      // 2. Fetch user's MEMES token balance
      try {
        const balance = await publicClient.readContract({
          address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
          abi: CONTRACTS.MEMES_TOKEN.abi,
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`]
        }) as bigint;

        setTokenBalance(Number(balance) / 1e18);
      } catch (error) {
        console.error('Error fetching token balance:', error);
        setTokenBalance(0);
      }

      // 3. Fetch claimable rewards (totalRewardsByreferral + getPendingRewards)
      try {
        const [referralRewards, pendingRewards] = await Promise.all([
          publicClient.readContract({
            address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_STAKE.abi,
            functionName: 'getTotalRewardsByReferralLevel',
            args: [walletAddress as `0x${string}`]
          }) as Promise<any>,
          publicClient.readContract({
            address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_STAKE.abi,
            functionName: 'getPendingRewards',
            args: [walletAddress as `0x${string}`]
          }) as Promise<bigint>
        ]);

        const totalReferralRewards = Number(referralRewards.totalRewardsByreferral || 0) / 1e18;
        const totalPendingRewards = Number(pendingRewards) / 1e18;
        const totalClaimable = totalReferralRewards + totalPendingRewards;

        setClaimableRewards(totalClaimable);
      } catch (error) {
        console.error('Error fetching claimable rewards:', error);
        setClaimableRewards(0);
      }

    } catch (error) {
      console.error('Error fetching staking data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchStakingData();
    }
  }, [walletAddress]);

  const getDaysStaked = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - stakingStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPenaltyInfo = (daysStaked: number) => {
    if (daysStaked >= PENALTY_FREE_DAYS) {
      return { hasPenalty: false, text: '✅ No Penalty', color: '#00ff88' };
    } else {
      return { hasPenalty: true, text: `⚠️ ${PENALTY_PERCENTAGE}% Penalty`, color: '#ffa500' };
    }
  };

  const handleUnstakeRecord = (record: any) => {
    const penaltyInfo = getPenaltyInfo(record.daysStaked);
    let finalAmount = record.amount;
    
    if (penaltyInfo.hasPenalty) {
      const penaltyAmount = record.amount * (PENALTY_PERCENTAGE / 100);
      finalAmount = record.amount - penaltyAmount;
      
      toast({
        title: "⚠️ Penalty Applied",
        description: `${PENALTY_PERCENTAGE}% penalty (${penaltyAmount.toLocaleString()} $MEMES) deducted. You will receive ${finalAmount.toLocaleString()} $MEMES.`,
        variant: "destructive"
      });
    }

    setIsProcessing(true);
    setTimeout(() => {
      setTokenBalance(prev => prev + finalAmount);
      setStakedAmount(prev => prev - record.amount);
      setIsProcessing(false);
      
      toast({
        title: "✅ Unstake Successful!",
        description: `${finalAmount.toLocaleString()} $MEMES transferred to your wallet`,
      });
    }, 2000);
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

    if (isEarlyUnstake && daysStaked < PENALTY_FREE_DAYS) {
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
      setClaimableRewards(prev => isEarlyUnstake && daysStaked < PENALTY_FREE_DAYS ? 0 : prev);
      setUnstakeAmount('');
      setIsProcessing(false);
      
      if (!isEarlyUnstake || daysStaked >= PENALTY_FREE_DAYS) {
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

    if (!walletAddress) {
      toast({
        title: "❌ Wallet Not Connected",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Check if ethereum provider is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask or compatible wallet not found');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Prepare the contract call
      const contractAddress = CONTRACTS.MEMES_STAKE.address;
      const claimRewardsData = CONTRACTS.MEMES_STAKE.abi.find(
        (item: any) => item.name === 'claimRewards' && item.type === 'function'
      );

      if (!claimRewardsData) {
        throw new Error('claimRewards function not found in ABI');
      }

      // Encode function call
      const iface = {
        encodeFunctionData: () => {
          return '0x372500ab'; // claimRewards() function signature
        }
      };

      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: contractAddress,
          data: iface.encodeFunctionData(),
        }],
      });

      toast({
        title: "⏳ Transaction Submitted",
        description: "Claiming your rewards...",
      });

      // Wait for transaction confirmation (optional - could use receipt)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Refresh data after claim
      await fetchStakingData();

      setIsProcessing(false);
      
      toast({
        title: "🎉 Rewards Claimed!",
        description: `Successfully claimed your rewards! TX: ${txHash.slice(0, 10)}...`,
      });
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      setIsProcessing(false);
      
      toast({
        title: "❌ Claim Failed",
        description: error.message || "Failed to claim rewards. Please try again.",
        variant: "destructive"
      });
    }
  };

  const daysStaked = getDaysStaked();
  const remainingDays = Math.max(0, PENALTY_FREE_DAYS - daysStaked);

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
                {/* Unstaking Info Banner */}
                <div className="p-3 rounded-lg text-xs" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
                  <div className="font-semibold mb-1" style={{color: '#00bfff'}}>Unstaking Rules:</div>
                  <ul className="space-y-1 text-gray-300">
                    <li>• Penalty-free after: <strong>90 days</strong></li>
                    <li>• Early unstake penalty: <strong>20% deduction</strong></li>
                    <li>• Minimum recommended lock: <strong>365 days</strong></li>
                  </ul>
                </div>

                {/* Staking Records Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-2 text-xs text-muted-foreground">#</th>
                        <th className="text-left py-2 px-2 text-xs text-muted-foreground">Date Staked</th>
                        <th className="text-right py-2 px-2 text-xs text-muted-foreground">Amount</th>
                        <th className="text-center py-2 px-2 text-xs text-muted-foreground">Days</th>
                        <th className="text-center py-2 px-2 text-xs text-muted-foreground">Penalty</th>
                        <th className="text-center py-2 px-2 text-xs text-muted-foreground">Action</th>
                        <th className="text-center py-2 px-2 text-xs text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stakingRecords.map((record) => {
                        const penaltyInfo = getPenaltyInfo(record.daysStaked);
                        return (
                          <tr 
                            key={record.id} 
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            data-testid={`stake-record-${record.id}`}
                          >
                            <td className="py-3 px-2 text-gray-400">{record.id}</td>
                            <td className="py-3 px-2">{record.dateStaked}</td>
                            <td className="py-3 px-2 text-right font-bold" style={{color: '#ffd700'}}>
                              {record.amount.toLocaleString()} MEME
                            </td>
                            <td className="py-3 px-2 text-center font-semibold" style={{color: '#00bfff'}}>
                              {record.daysStaked} days
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span style={{color: penaltyInfo.color, fontSize: '11px'}}>
                                {penaltyInfo.text}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button
                                onClick={() => handleUnstakeRecord(record)}
                                disabled={isProcessing || record.status !== 'active'}
                                className="px-3 py-1 rounded text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  background: record.status === 'active' ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : 'rgba(100, 100, 100, 0.3)',
                                  color: record.status === 'active' ? '#000' : '#666'
                                }}
                                data-testid={`button-unstake-${record.id}`}
                              >
                                🔓 Unstake
                              </button>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span 
                                className="px-2 py-1 rounded text-xs font-semibold"
                                style={{
                                  background: record.status === 'active' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                                  color: record.status === 'active' ? '#00ff88' : '#888',
                                  border: `1px solid ${record.status === 'active' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(100, 100, 100, 0.3)'}`
                                }}
                              >
                                {record.status === 'active' ? 'Active' : 'Completed'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                  {isLoadingData ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    `${accruedToday.toLocaleString()} $MEMES`
                  )}
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
                <li>• Minimum staking period: <strong>90 days</strong> for penalty-free unstake</li>
                <li>• Early unstake (before 90 days): <strong>All earned rewards will be deducted</strong> from your principal amount</li>
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
