import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import memeStakeLogo from "@assets/ChatGPT Image Oct 9, 2025, 11_08_34 AM_1759988345567.png";
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';
import { CONTRACTS } from '@/config/contracts';
import { useQuery } from '@tanstack/react-query';

interface IncomeRecord {
  id: string;
  date: string;
  type: 'staking' | 'referral' | 'bonus' | 'capital_withdrawn';
  amount: number;
  status: 'claimed' | 'pending' | 'confirmed';
  txHash?: string;
  eventType?: string;
}

export default function IncomeHistory() {
  const [location, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Smart contract data state
  const [stakingRewards, setStakingRewards] = useState(0);
  const [referralRewards, setReferralRewards] = useState(0);
  const [bonusRewards, setBonusRewards] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<IncomeRecord[]>([]);

  // Fetch wallet address on mount
  useEffect(() => {
    const storedWallet = localStorage.getItem('walletAddress');
    console.log('Income History - Loaded wallet address:', storedWallet);
    setWalletAddress(storedWallet);
  }, []);

  // Fetch rewards data from smart contracts
  useEffect(() => {
    const fetchRewards = async () => {
      if (!walletAddress) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Create public client inside useEffect to avoid recreation on every render
        const publicClient = createPublicClient({
          chain: bscTestnet,
          transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
        });

        // 1. Staking Rewards = sum of totalRewardsClaimed from all user stakes
        const activeStakes = await publicClient.readContract({
          address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
          abi: CONTRACTS.MEMES_STAKE.abi,
          functionName: 'getUserStakes',
          args: [walletAddress as `0x${string}`]
        }) as any[];

        const totalClaimedRewards = activeStakes.reduce((sum, stake) => {
          return sum + Number(stake.totalRewardsClaimed);
        }, 0);
        
        setStakingRewards(totalClaimedRewards / 1e18);

        // 2. Referral Rewards = totalClaimedRewardsByReferralLevel from MEMES_STAKE        
        let totalReferralRewards = 0;
        for (let level = 0; level < 3; level++) {
          const reward = await publicClient.readContract({
            address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
            abi: CONTRACTS.MEMES_STAKE.abi,
            functionName: 'totalClaimedRewardsByReferralLevel',
            args: [walletAddress as `0x${string}`, level]
          }) as bigint;
            totalReferralRewards += Number(reward) / 1e18;
        }
        setReferralRewards(totalReferralRewards);

        // 3. Bonus Rewards = referralRewardByLevel from MEMES_PRESALE (levels 0-2)
        let totalAirdropRewards = 0;
        for (let level = 0; level < 3; level++) {
          const reward = await publicClient.readContract({
            address: CONTRACTS.MEMES_AIRDROP.address as `0x${string}`,
            abi: CONTRACTS.MEMES_AIRDROP.abi,
            functionName: 'totalAirdropClaimedRewardsByReferralLevel',
            args: [walletAddress as `0x${string}`, level]
          }) as bigint;
            totalAirdropRewards += Number(reward) / 1e18;
        }
        setBonusRewards(totalAirdropRewards);

      } catch (error) {
        console.error('Error fetching rewards:', error);
        setStakingRewards(0);
        setReferralRewards(0);
        setBonusRewards(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRewards();
  }, [walletAddress]);

  // Fetch transactions from database
  const { data: dbTransactions = [], isLoading: isLoadingDbTransactions } = useQuery<any[]>({
    queryKey: ['/api/transactions', walletAddress],
    enabled: !!walletAddress,
  });

  // Transform database transactions into IncomeRecord format
  useEffect(() => {
    // Only run when wallet is connected and not loading
    if (!walletAddress) {
      return; // Don't do anything when wallet is null to avoid infinite loops
    }
    
    if (isLoadingDbTransactions) {
      return; // Wait for data to finish loading
    }

    try {
      const transformedTransactions: IncomeRecord[] = dbTransactions
        .map((tx) => {
          // Map transaction type to IncomeRecord type
          let type: 'staking' | 'referral' | 'bonus' | 'capital_withdrawn' = 'staking';
          let eventType = tx.transactionType;

          if (tx.transactionType === 'Stake') {
            type = 'capital_withdrawn'; // Use same type as withdrawals for display
            eventType = 'Tokens Staked';
          } else if (tx.transactionType === 'Claim Staking Rewards') {
            type = 'staking';
            eventType = 'Staking Rewards Claimed';
          } else if (tx.transactionType === 'Claim Referral Rewards') {
            type = 'referral';
            eventType = 'Referral Rewards Claimed';
          } else if (tx.transactionType === 'Capital Withdraw') {
            type = 'capital_withdrawn';
            eventType = 'Capital Withdrawn';
          }

          return {
            id: tx.id,
            date: new Date(tx.createdAt).toLocaleString(),
            type,
            amount: parseFloat(tx.amount),
            status: tx.status === 'confirmed' ? 'claimed' : tx.status,
            txHash: tx.transactionHash,
            eventType
          };
        });

      setTransactions(transformedTransactions);
    } catch (error) {
      console.error('Error transforming transactions:', error);
      setTransactions([]);
    }
  }, [dbTransactions, walletAddress, isLoadingDbTransactions]);


  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = transactions.slice(startIndex, endIndex);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'staking': return '#00bfff';
      case 'referral': return '#ffd700';
      case 'bonus': return '#ff69b4';
      case 'capital_withdrawn': return '#ff6b6b';
      default: return '#fff';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'staking': return '💎';
      case 'referral': return '🎁';
      case 'bonus': return '🎉';
      case 'capital_withdrawn': return '💸';
      default: return '💰';
    }
  };

  // Calculate totals from smart contract data
  const grandTotal = stakingRewards + referralRewards + bonusRewards;

  return (
    <div className="min-h-screen text-foreground" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1421 100%)'}} data-testid="income-history-page">
      
      {/* Header */}
      <header className="border-b border-border" style={{background: 'rgba(15, 10, 35, 0.8)'}} data-testid="income-history-header">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={memeStakeLogo} 
                alt="MEMES STAKE Logo" 
                className="w-12 h-12 rounded-lg"
                style={{filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.3))'}}
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold" style={{color: '#ffd700'}}>MEMES STAKE</span>
                <span className="text-sm text-gray-400">Income History</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Wallet Address Display */}
              {walletAddress && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                  <div className="text-xs text-gray-400">Wallet</div>
                  <div className="text-sm font-mono font-bold" style={{color: '#ffd700'}} data-testid="text-connected-wallet">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back-dashboard"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 walle glass-card text-center">
            <div className="text-xs text-muted-foreground mb-2">Total Earnings</div>
            <div className="text-2xl font-bold" style={{color: '#00ff88'}}>
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                grandTotal.toLocaleString()
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
          </Card>

          <Card className="p-4 glass-card text-center">
            <div className="text-xs text-muted-foreground mb-2">Staking Rewards</div>
            <div className="text-xl font-bold" style={{color: '#00bfff'}}>
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                stakingRewards.toLocaleString()
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
          </Card>

          <Card className="p-4 glass-card text-center">
            <div className="text-xs text-muted-foreground mb-2">Referral Rewards</div>
            <div className="text-xl font-bold" style={{color: '#ffd700'}}>
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                referralRewards.toLocaleString()
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
          </Card>

          {<Card className="p-4 glass-card text-center">
            <div className="text-xs text-muted-foreground mb-2">Bonus Rewards</div>
            <div className="text-xl font-bold" style={{color: '#ff69b4'}}>
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                bonusRewards.toLocaleString()
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
          </Card>}
        </div>

        {/* Income History Table */}
        <Card className="p-6 glass-card">
          <h3 className="text-xl font-semibold mb-4">📊 Transaction History</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground font-semibold">Date & Time</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground font-semibold">Type</th>
                  <th className="text-right py-3 px-4 text-sm text-muted-foreground font-semibold">Amount</th>
                  <th className="text-center py-3 px-4 text-sm text-muted-foreground font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-sm text-muted-foreground font-semibold">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingDbTransactions ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{borderColor: '#ffd700'}}></div>
                        <span className="text-sm text-muted-foreground">Loading transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-4xl">📭</span>
                        <span className="text-lg font-semibold">No Transactions Found</span>
                        <span className="text-sm text-muted-foreground">
                          {!walletAddress ? 'Connect your wallet to view transaction history' : 'No transactions yet. Start staking to see your history here!'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    data-testid={`income-record-${record.id}`}
                  >
                    <td className="py-4 px-4 text-sm">{record.date}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(record.type)}</span>
                        <span className="text-sm" style={{color: getTypeColor(record.type)}}>
                          {record.eventType || record.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold" style={{color: getTypeColor(record.type)}}>
                        +{record.amount.toLocaleString()} $MEMES
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: record.status === 'claimed' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 165, 0, 0.2)',
                          color: record.status === 'claimed' ? '#00ff88' : '#ffa500',
                          border: `1px solid ${record.status === 'claimed' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 165, 0, 0.3)'}`
                        }}
                      >
                        {record.status === 'claimed' ? '✅ Claimed' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {record.txHash ? (
                        <a 
                          href={`https://bscscan.com/tx/${record.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono hover:underline"
                          style={{color: '#00bfff'}}
                          title={record.txHash}
                        >
                          {record.txHash.slice(0, 10)}...{record.txHash.slice(-8)}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} records
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                ← Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                      currentPage === page ? 'text-black' : 'text-gray-400 hover:text-white'
                    }`}
                    style={{
                      background: currentPage === page ? '#ffd700' : 'rgba(255, 255, 255, 0.05)'
                    }}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Next →
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
