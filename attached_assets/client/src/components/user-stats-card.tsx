export function UserStatsCard() {
  const totalUsers = "1,985";
  const tokenPrice = "$0.000127";
  const priceChange = "+15.42%";
  const marketCap = "$2.4M";
  const volume24h = "$145.2K";
  const totalSupply = "1,000,000,000";
  const holders = "847";

  return (
    <div className="glass-card rounded-xl p-6" data-testid="user-stats-card">
      <h3 className="text-lg font-semibold mb-2 text-white">Token Statistics</h3>
      <div className="text-sm text-muted-foreground mb-4">Meme Airdrop Stats</div>
      
      {/* Price and Change */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-accent" data-testid="text-token-price">
            {tokenPrice}
          </div>
          <div className="text-sm text-secondary font-medium" data-testid="text-price-change">
            {priceChange} (24h)
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-white" data-testid="text-total-users">
            {totalUsers}
          </div>
          <div className="text-xs text-muted-foreground">Total Users</div>
        </div>
      </div>
      
      {/* Market Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="font-medium text-foreground" data-testid="text-market-cap">{marketCap}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">24h Volume</div>
          <div className="font-medium text-foreground" data-testid="text-volume">{volume24h}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Holders</div>
          <div className="font-medium text-foreground" data-testid="text-holders">{holders}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Total Supply</div>
          <div className="font-medium text-foreground" data-testid="text-supply">{totalSupply.slice(0, -6)}M</div>
        </div>
      </div>
      
      {/* Token Details */}
      <div className="border-t border-border pt-4 space-y-2 text-sm">
        <div className="text-muted-foreground" data-testid="text-ticker">
          <span className="text-foreground font-medium">Ticker:</span> MEMES
        </div>
        <div className="text-muted-foreground" data-testid="text-chain">
          <span className="text-foreground font-medium">Chain:</span> BNB Smart Chain (BEP20)
        </div>
      </div>
    </div>
  );
}
