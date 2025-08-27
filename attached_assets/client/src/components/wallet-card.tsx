import { Button } from "@/components/ui/button";

export function WalletCard() {
  const walletAddress = "0x1234...abcd";
  const memesBalance = "9,750,000";
  const bnbBalance = "0.0234";
  const usdtBalance = "45.67";
  
  const handleDepositTokens = () => {
    console.log("Opening deposit modal...");
  };

  return (
    <div className="glass-card rounded-xl p-6" data-testid="wallet-card">
      <h3 className="text-lg font-semibold mb-4 text-white">My Wallet</h3>
      
      <div className="space-y-4">
        {/* Wallet Address */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Wallet Address</div>
          <div className="text-sm font-mono bg-muted px-3 py-2 rounded-lg" data-testid="text-wallet-address">
            {walletAddress}
          </div>
        </div>
        
        {/* Token Balances */}
        <div>
          <div className="text-xs text-muted-foreground mb-3">Token Balances</div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="coin-icon">😊</div>
                <span className="font-medium">MEMES</span>
              </div>
              <span className="text-sm" data-testid="text-memes-balance">{memesBalance}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="coin-icon">💎</div>
                <span className="font-medium">BNB</span>
              </div>
              <span className="text-sm" data-testid="text-bnb-balance">{bnbBalance}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="coin-icon">💰</div>
                <span className="font-medium">USDT</span>
              </div>
              <span className="text-sm" data-testid="text-usdt-balance">{usdtBalance}</span>
            </div>
          </div>
        </div>
        
        {/* Deposit button */}
        <div className="pt-2">
          <Button 
            onClick={handleDepositTokens}
            className="gradient-button w-full py-3 rounded-lg font-medium"
            data-testid="button-deposit-tokens"
          >
            Deposit Tokens
          </Button>
        </div>
      </div>
    </div>
  );
}
