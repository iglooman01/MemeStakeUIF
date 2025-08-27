import { Button } from "@/components/ui/button";

export function Navbar() {
  const handleJoinTelegram = () => {
    window.open("https://t.me/memestake", "_blank");
  };

  const handleDisconnectWallet = () => {
    console.log("Disconnecting wallet...");
  };

  return (
    <nav className="w-full px-6 py-4 bg-card/80 backdrop-blur-sm border-b border-border" data-testid="navbar">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center space-x-3" data-testid="brand-logo">
          <div className="logo-coin">🚀</div>
          <span className="text-xl font-semibold text-white">MemeStake</span>
        </div>
        
        {/* Center - Navigation */}
        <div className="flex items-center space-x-6">
          <a href="#dashboard" className="text-foreground hover:text-accent transition-colors" data-testid="nav-dashboard">
            Dashboard
          </a>
          <span className="text-muted-foreground">|</span>
          <Button 
            onClick={handleJoinTelegram}
            variant="link"
            className="text-accent hover:text-secondary p-0 h-auto font-normal flex items-center space-x-2"
            data-testid="nav-join-telegram"
          >
            <span className="text-lg">✈️</span>
            <span>Join our Telegram Group</span>
          </Button>
        </div>
        
        {/* Right side - Wallet */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span className="text-sm text-foreground" data-testid="nav-wallet-address">Your Wallet: 0x1234...abcd</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <Button 
            onClick={handleDisconnectWallet}
            variant="outline"
            size="sm"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            data-testid="button-disconnect"
          >
            Disconnect
          </Button>
        </div>
      </div>
    </nav>
  );
}
