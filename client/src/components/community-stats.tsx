import { useState, useEffect } from "react";

export function CommunityStats() {
  const [totalUsers, setTotalUsers] = useState(52847);
  const [totalAirdrop, setTotalAirdrop] = useState(1247583);
  const [isIncreasing, setIsIncreasing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate random increases every 5 seconds
      if (Math.random() > 0.7) {
        const userIncrease = Math.floor(Math.random() * 5) + 1;
        const airdropIncrease = Math.floor(Math.random() * 100) + 50;
        
        setTotalUsers(prev => prev + userIncrease);
        setTotalAirdrop(prev => prev + airdropIncrease);
        
        // Trigger highlight effect
        setIsIncreasing(true);
        
        // Play a subtle sound effect (simulated with console log)
        console.log("📈 Community stats updated!");
        
        setTimeout(() => setIsIncreasing(false), 1000);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="glass-card rounded-xl p-6 mb-6" data-testid="community-stats">
      <h3 className="text-lg font-semibold mb-4 text-white text-center">🦍 Ape Community 🦍</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Total Users */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">💎 Diamond Hands 💎</div>
          <div 
            className={`text-2xl font-bold text-accent transition-all duration-500 ${
              isIncreasing ? 'scale-110 text-secondary' : ''
            }`}
            data-testid="text-total-users"
          >
            {formatNumber(totalUsers)}
          </div>
        </div>
        
        {/* Right: Total Airdrop Distribution */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">🚀 Total To The Moon 🚀</div>
          <div 
            className={`text-2xl font-bold text-secondary transition-all duration-500 ${
              isIncreasing ? 'scale-110 text-accent animate-pulse' : ''
            }`}
            data-testid="text-total-airdrop"
          >
            {formatNumber(totalAirdrop)}
          </div>
        </div>
      </div>
      
      {isIncreasing && (
        <div className="text-center mt-4">
          <div className="text-xs text-accent animate-bounce">
            🔥 WAGMI! New apes joined the rocket! 🚀🦍
          </div>
        </div>
      )}
    </div>
  );
}
