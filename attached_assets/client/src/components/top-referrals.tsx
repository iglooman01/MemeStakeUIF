export function TopReferrals() {
  const topReferrals = [
    { rank: 1, address: "0x7fA9...B2c8", referrals: 127, rewards: "45,780 MEMES" },
    { rank: 2, address: "0x3Bc1...F6d4", referrals: 98, rewards: "32,450 MEMES" },
    { rank: 3, address: "0x9Ed2...A8f7", referrals: 76, rewards: "28,900 MEMES" },
    { rank: 4, address: "0x2Ca5...D3b9", referrals: 64, rewards: "21,340 MEMES" },
    { rank: 5, address: "0x8Fb4...E1c6", referrals: 52, rewards: "18,760 MEMES" }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `${rank}.`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-400";
      case 2: return "text-gray-300";
      case 3: return "text-yellow-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 mb-6" data-testid="top-referrals">
      <h3 className="text-lg font-semibold mb-4 text-white text-center">Top 5 Referrals</h3>
      
      <div className="space-y-3">
        {topReferrals.map((referral) => (
          <div 
            key={referral.rank}
            className={`flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/50 transition-colors ${
              referral.rank <= 3 ? 'bg-muted/20' : 'bg-muted/10'
            }`}
            data-testid={`referral-rank-${referral.rank}`}
          >
            <div className="flex items-center space-x-3">
              <span className={`text-lg font-bold ${getRankColor(referral.rank)}`}>
                {getRankIcon(referral.rank)}
              </span>
              <div>
                <div className="font-mono text-sm text-foreground" data-testid={`address-${referral.rank}`}>
                  {referral.address}
                </div>
                <div className="text-xs text-muted-foreground">
                  {referral.referrals} referrals
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-secondary" data-testid={`rewards-${referral.rank}`}>
                {referral.rewards}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Rankings update hourly based on total referrals and rewards earned
        </div>
      </div>
    </div>
  );
}