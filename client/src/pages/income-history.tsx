import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import memeStakeLogo from "@assets/ChatGPT Image Oct 9, 2025, 11_08_34 AM_1759988345567.png";

interface IncomeRecord {
  id: number;
  date: string;
  type: 'staking' | 'referral' | 'bonus';
  amount: number;
  status: 'claimed' | 'pending';
  txHash?: string;
}

export default function IncomeHistory() {
  const [location, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample income history data
  const incomeHistory: IncomeRecord[] = [
    { id: 1, date: '2025-10-03 08:30:00', type: 'staking', amount: 1000, status: 'claimed', txHash: '0x1a2b3c...' },
    { id: 2, date: '2025-10-03 07:15:00', type: 'referral', amount: 50000, status: 'claimed', txHash: '0x4d5e6f...' },
    { id: 3, date: '2025-10-02 18:45:00', type: 'staking', amount: 1000, status: 'claimed', txHash: '0x7g8h9i...' },
    { id: 4, date: '2025-10-02 12:30:00', type: 'bonus', amount: 5000, status: 'claimed', txHash: '0xjk1l2m...' },
    { id: 5, date: '2025-10-01 16:20:00', type: 'staking', amount: 1000, status: 'claimed', txHash: '0x3n4o5p...' },
    { id: 6, date: '2025-10-01 09:00:00', type: 'referral', amount: 75000, status: 'claimed', txHash: '0x6q7r8s...' },
    { id: 7, date: '2025-09-30 21:10:00', type: 'staking', amount: 1000, status: 'claimed', txHash: '0x9t0u1v...' },
    { id: 8, date: '2025-09-30 14:55:00', type: 'referral', amount: 120000, status: 'claimed', txHash: '0xwx2y3z...' },
    { id: 9, date: '2025-09-29 11:30:00', type: 'bonus', amount: 10000, status: 'claimed', txHash: '0x4a5b6c...' },
    { id: 10, date: '2025-09-29 08:15:00', type: 'staking', amount: 1000, status: 'claimed', txHash: '0x7d8e9f...' },
    { id: 11, date: '2025-09-28 19:45:00', type: 'referral', amount: 100000, status: 'claimed', txHash: '0xgh1i2j...' },
    { id: 12, date: '2025-09-28 13:20:00', type: 'staking', amount: 1000, status: 'claimed', txHash: '0x3k4l5m...' },
    { id: 13, date: '2025-09-27 16:00:00', type: 'staking', amount: 1000, status: 'pending' },
    { id: 14, date: '2025-09-27 10:30:00', type: 'referral', amount: 25000, status: 'pending' },
    { id: 15, date: '2025-09-26 14:15:00', type: 'staking', amount: 1000, status: 'pending' },
  ];

  const totalPages = Math.ceil(incomeHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = incomeHistory.slice(startIndex, endIndex);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'staking': return '#00bfff';
      case 'referral': return '#ffd700';
      case 'bonus': return '#ff69b4';
      default: return '#fff';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'staking': return '💎';
      case 'referral': return '🎁';
      case 'bonus': return '🎉';
      default: return '💰';
    }
  };

  const totalStakingEarnings = incomeHistory.filter(r => r.type === 'staking').reduce((sum, r) => sum + r.amount, 0);
  const totalReferralEarnings = incomeHistory.filter(r => r.type === 'referral').reduce((sum, r) => sum + r.amount, 0);
  const totalBonusEarnings = incomeHistory.filter(r => r.type === 'bonus').reduce((sum, r) => sum + r.amount, 0);
  const grandTotal = totalStakingEarnings + totalReferralEarnings + totalBonusEarnings;

  return (
    <div className="min-h-screen text-foreground" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0f1421 100%)'}} data-testid="income-history-page">
      
      {/* Header */}
      <header className="border-b border-border" style={{background: 'rgba(15, 10, 35, 0.8)'}} data-testid="income-history-header">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src={memeStakeLogo} 
                alt="MemeStake Logo" 
                className="w-12 h-12 rounded-lg"
                style={{filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.2))'}}
              />
              <span className="text-xl font-bold text-white">Income History</span>
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
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 glass-card text-center">
            <div className="text-xs text-muted-foreground mb-2">Total Earnings</div>
            <div className="text-2xl font-bold" style={{color: '#00ff88'}}>
              {grandTotal.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
          </Card>

          <Card className="p-4 glass-card text-center">
            <div className="text-xs text-muted-foreground mb-2">Staking Rewards</div>
            <div className="text-xl font-bold" style={{color: '#00bfff'}}>
              {totalStakingEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
          </Card>

          <Card className="p-4 glass-card text-center">
            <div className="text-xs text-muted-foreground mb-2">Referral Rewards</div>
            <div className="text-xl font-bold" style={{color: '#ffd700'}}>
              {totalReferralEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
          </Card>

          <Card className="p-4 glass-card text-center">
            <div className="text-xs text-muted-foreground mb-2">Bonus Rewards</div>
            <div className="text-xl font-bold" style={{color: '#ff69b4'}}>
              {totalBonusEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">$MEMES</div>
          </Card>
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
                {currentRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    data-testid={`income-record-${record.id}`}
                  >
                    <td className="py-4 px-4 text-sm">{record.date}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(record.type)}</span>
                        <span className="text-sm capitalize" style={{color: getTypeColor(record.type)}}>
                          {record.type}
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
                        >
                          {record.txHash}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, incomeHistory.length)} of {incomeHistory.length} records
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
