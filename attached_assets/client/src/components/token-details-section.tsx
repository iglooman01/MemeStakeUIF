import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TokenDetailsSection() {
  const tokenPrice = "$0.000127";
  const priceChange = "+15.42%";
  const allTimeHigh = "$0.000234";
  const allTimeLow = "$0.000089";
  const liquidityPool = "$1.2M";
  const contractAddress = "0x1a2b3c4d5e6f7890abcdef123456789012345678";
  
  const priceHistory = [
    { time: "24h", price: "$0.000118", change: "+7.6%" },
    { time: "7d", price: "$0.000095", change: "+33.7%" },
    { time: "30d", price: "$0.000076", change: "+67.1%" },
    { time: "90d", price: "$0.000042", change: "+202.4%" }
  ];

  const tokenomics = [
    { label: "Total Supply", value: "1,000,000,000 MEMES", percentage: "100%" },
    { label: "Circulating Supply", value: "750,000,000 MEMES", percentage: "75%" },
    { label: "Liquidity Pool", value: "100,000,000 MEMES", percentage: "10%" },
    { label: "Development", value: "75,000,000 MEMES", percentage: "7.5%" },
    { label: "Marketing", value: "50,000,000 MEMES", percentage: "5%" },
    { label: "Rewards Pool", value: "25,000,000 MEMES", percentage: "2.5%" }
  ];

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    console.log("Contract address copied");
  };

  const handleViewOnExplorer = () => {
    window.open(`https://bscscan.com/address/${contractAddress}`, '_blank');
  };

  return (
    <div className="space-y-6" data-testid="token-details-section">
      {/* Price Chart & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-border" data-testid="price-chart-card">
          <CardHeader>
            <CardTitle className="text-white">Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mock chart area */}
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center border border-border mb-4">
              <div className="text-center">
                <div className="text-accent text-3xl mb-2">📈</div>
                <div className="text-muted-foreground">Price Chart</div>
                <div className="text-sm text-muted-foreground">Real-time price tracking coming soon</div>
              </div>
            </div>
            
            {/* Current price info */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-accent" data-testid="chart-current-price">
                  {tokenPrice}
                </div>
                <div className="text-sm text-secondary font-medium">
                  {priceChange} (24h)
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-muted-foreground">ATH: <span className="text-foreground">{allTimeHigh}</span></div>
                <div className="text-muted-foreground">ATL: <span className="text-foreground">{allTimeLow}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border" data-testid="price-history-card">
          <CardHeader>
            <CardTitle className="text-white">Price History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priceHistory.map((period) => (
                <div key={period.time} className="flex justify-between items-center" data-testid={`price-period-${period.time}`}>
                  <span className="text-muted-foreground">{period.time}</span>
                  <div className="text-right">
                    <div className="font-medium text-foreground">{period.price}</div>
                    <div className="text-xs text-secondary">{period.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tokenomics & Contract */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border" data-testid="tokenomics-card">
          <CardHeader>
            <CardTitle className="text-white">Tokenomics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokenomics.map((item) => (
                <div key={item.label} className="space-y-2" data-testid={`tokenomics-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {item.percentage}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-accent to-secondary h-2 rounded-full" 
                      style={{ width: item.percentage }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border" data-testid="contract-info-card">
          <CardHeader>
            <CardTitle className="text-white">Contract Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Contract Address</label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded font-mono text-foreground break-all" data-testid="contract-address">
                    {contractAddress}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleCopyContract}
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                    data-testid="button-copy-contract"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Network</label>
                  <div className="text-sm font-medium text-foreground mt-1">BNB Smart Chain</div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Liquidity</label>
                  <div className="text-sm font-medium text-foreground mt-1" data-testid="liquidity-amount">{liquidityPool}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleViewOnExplorer}
                  className="gradient-button w-full"
                  data-testid="button-view-explorer"
                >
                  View on BSCScan
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    Add to Wallet
                  </Button>
                  <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    Buy MEMES
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}