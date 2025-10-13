import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, User, Wallet, TrendingUp, Users } from "lucide-react";
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { CONTRACTS } from '../config/contracts';

export default function Admin() {
  const [searchAddress, setSearchAddress] = useState("");
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const searchUser = async () => {
    if (!searchAddress || !searchAddress.startsWith('0x')) {
      alert('Please enter a valid wallet address');
      return;
    }

    setIsLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: bscTestnet,
        transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
      });

      // Fetch MEMES token balance
      const tokenBalance = await publicClient.readContract({
        address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
        abi: CONTRACTS.MEMES_TOKEN.abi,
        functionName: 'balanceOf',
        args: [searchAddress as `0x${string}`]
      }) as bigint;

      // Fetch staking data
      const userStakes = await publicClient.readContract({
        address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_STAKE.abi,
        functionName: 'getUserStakes',
        args: [searchAddress as `0x${string}`]
      }) as any[];

      // Calculate total staked
      let totalStaked = 0;
      for (const stake of userStakes) {
        if (!stake.capitalWithdrawn) {
          totalStaked += Number(stake.stakedAmount) / 1e18;
        }
      }

      // Fetch pending rewards
      const pendingRewards = await publicClient.readContract({
        address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_STAKE.abi,
        functionName: 'getPendingRewards',
        args: [searchAddress as `0x${string}`]
      }) as bigint;

      // Fetch referral data
      const referralRewards = await publicClient.readContract({
        address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_STAKE.abi,
        functionName: 'getTotalRewardsByReferralLevel',
        args: [searchAddress as `0x${string}`]
      }) as any;

      // Fetch sponsor
      const sponsor = await publicClient.readContract({
        address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_PRESALE.abi,
        functionName: 'referrerOf',
        args: [searchAddress as `0x${string}`]
      }) as string;

      setUserDetails({
        address: searchAddress,
        tokenBalance: Number(tokenBalance) / 1e18,
        totalStaked,
        pendingRewards: Number(pendingRewards) / 1e18,
        referralRewards: Number(referralRewards[0] || 0) / 1e18,
        level1Rewards: Number(referralRewards[1] || 0) / 1e18,
        level2Rewards: Number(referralRewards[2] || 0) / 1e18,
        level3Rewards: Number(referralRewards[3] || 0) / 1e18,
        sponsor,
        stakes: userStakes
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Error fetching user details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #000000 0%, #0a0e1a 50%, #000000 100%)'}}>
      {/* Header */}
      <header className="border-b" style={{background: 'rgba(15, 20, 35, 0.95)', borderColor: 'rgba(255, 215, 0, 0.15)'}}>
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: '#ffd700'}}>
                <span className="text-xl">⚙️</span>
              </div>
              <h1 className="text-2xl font-bold" style={{color: '#ffd700'}}>Admin Panel</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              style={{borderColor: 'rgba(255, 215, 0, 0.3)', color: '#ffd700'}}
              data-testid="button-back-home"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Search Section */}
        <Card className="p-6 mb-8" style={{
          background: 'rgba(15, 20, 35, 0.8)',
          border: '1px solid rgba(255, 215, 0, 0.2)'
        }}>
          <h2 className="text-xl font-bold mb-4" style={{color: '#ffd700'}}>🔍 Search User by Wallet Address</h2>
          <div className="flex gap-4">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="flex-1"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderColor: 'rgba(255, 215, 0, 0.3)',
                color: 'white'
              }}
              data-testid="input-search-address"
            />
            <Button
              onClick={searchUser}
              disabled={isLoading}
              style={{background: '#ffd700', color: '#000'}}
              data-testid="button-search"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </Card>

        {/* User Details */}
        {userDetails && (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="p-6" style={{
              background: 'rgba(15, 20, 35, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#ffd700'}}>
                <User className="w-5 h-5" />
                User Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                  <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                  <div className="font-mono text-sm" style={{color: '#ffd700'}} data-testid="text-user-address">
                    {userDetails.address}
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                  <div className="text-sm text-gray-400 mb-1">Sponsor Address</div>
                  <div className="font-mono text-sm" style={{color: '#00bfff'}} data-testid="text-sponsor-address">
                    {userDetails.sponsor === '0x0000000000000000000000000000000000000000' ? 'No Sponsor' : userDetails.sponsor}
                  </div>
                </div>
              </div>
            </Card>

            {/* Token & Staking Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6" style={{
                background: 'rgba(15, 20, 35, 0.8)',
                border: '1px solid rgba(255, 215, 0, 0.2)'
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgba(255, 215, 0, 0.2)'}}>
                    <Wallet className="w-5 h-5" style={{color: '#ffd700'}} />
                  </div>
                  <div className="text-sm text-gray-400">Token Balance</div>
                </div>
                <div className="text-2xl font-bold" style={{color: '#ffd700'}} data-testid="text-token-balance">
                  {userDetails.tokenBalance.toLocaleString()} $MEMES
                </div>
              </Card>

              <Card className="p-6" style={{
                background: 'rgba(15, 20, 35, 0.8)',
                border: '1px solid rgba(0, 191, 255, 0.2)'
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgba(0, 191, 255, 0.2)'}}>
                    <TrendingUp className="w-5 h-5" style={{color: '#00bfff'}} />
                  </div>
                  <div className="text-sm text-gray-400">Total Staked</div>
                </div>
                <div className="text-2xl font-bold" style={{color: '#00bfff'}} data-testid="text-total-staked">
                  {userDetails.totalStaked.toLocaleString()} $MEMES
                </div>
              </Card>

              <Card className="p-6" style={{
                background: 'rgba(15, 20, 35, 0.8)',
                border: '1px solid rgba(0, 255, 136, 0.2)'
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgba(0, 255, 136, 0.2)'}}>
                    <span className="text-xl">💰</span>
                  </div>
                  <div className="text-sm text-gray-400">Pending Rewards</div>
                </div>
                <div className="text-2xl font-bold" style={{color: '#00ff88'}} data-testid="text-pending-rewards">
                  {userDetails.pendingRewards.toLocaleString()} $MEMES
                </div>
              </Card>
            </div>

            {/* Referral Rewards */}
            <Card className="p-6" style={{
              background: 'rgba(15, 20, 35, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#ffd700'}}>
                <Users className="w-5 h-5" />
                Referral Rewards (3-Level System)
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                  <div className="text-sm text-gray-400 mb-2">Total Referral</div>
                  <div className="text-xl font-bold" style={{color: '#ffd700'}} data-testid="text-total-referral">
                    {userDetails.referralRewards.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                  <div className="text-sm text-gray-400 mb-2">Level 1 (5%)</div>
                  <div className="text-xl font-bold" style={{color: '#00bfff'}} data-testid="text-level1-rewards">
                    {userDetails.level1Rewards.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
                  <div className="text-sm text-gray-400 mb-2">Level 2 (3%)</div>
                  <div className="text-xl font-bold" style={{color: '#00ff88'}} data-testid="text-level2-rewards">
                    {userDetails.level2Rewards.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{background: 'rgba(255, 165, 0, 0.1)'}}>
                  <div className="text-sm text-gray-400 mb-2">Level 3 (2%)</div>
                  <div className="text-xl font-bold" style={{color: '#ffa500'}} data-testid="text-level3-rewards">
                    {userDetails.level3Rewards.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            {/* Stakes List */}
            <Card className="p-6" style={{
              background: 'rgba(15, 20, 35, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h3 className="text-lg font-bold mb-4" style={{color: '#ffd700'}}>📊 Active Stakes</h3>
              {userDetails.stakes.length > 0 ? (
                <div className="space-y-3">
                  {userDetails.stakes.map((stake: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg"
                      style={{
                        background: stake.capitalWithdrawn ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                        border: `1px solid ${stake.capitalWithdrawn ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`
                      }}
                      data-testid={`stake-${index}`}
                    >
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Amount</div>
                          <div className="font-bold" style={{color: '#ffd700'}}>
                            {(Number(stake.stakedAmount) / 1e18).toLocaleString()} $MEMES
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Start Time</div>
                          <div className="text-sm text-white">
                            {new Date(Number(stake.startTime) * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Total Claimed</div>
                          <div className="text-sm" style={{color: '#00ff88'}}>
                            {(Number(stake.totalRewardsClaimed) / 1e18).toLocaleString()} $MEMES
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Status</div>
                          <div className={`text-sm font-bold ${stake.capitalWithdrawn ? 'text-red-400' : 'text-green-400'}`}>
                            {stake.capitalWithdrawn ? '❌ Withdrawn' : '✅ Active'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No active stakes found</div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
