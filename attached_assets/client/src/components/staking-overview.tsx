import { Button } from "@/components/ui/button";

export function StakingOverview() {
  const totalStaked = "125,000 MEMES";
  const currentROI = "78.5%";
  const pendingRewards = "1,247 MEMES";
  
  const handleStakeMore = () => {
    console.log("Opening stake more modal...");
  };

  const handleClaimReward = () => {
    console.log("Claiming rewards...");
  };

  return (
    <div className="glass-card rounded-xl p-6" data-testid="staking-overview">
      <h3 className="text-lg font-semibold mb-4 text-white">Staking Overview</h3>
      
      <div className="space-y-4">
        {/* Total Staked */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Total Staked</div>
          <div className="text-2xl font-bold text-accent" data-testid="text-total-staked">
            {totalStaked}
          </div>
        </div>
        
        {/* ROI */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Current ROI</div>
          <div className="text-lg font-semibold text-secondary" data-testid="text-current-roi">
            {currentROI}
          </div>
        </div>
        
        {/* Pending Rewards */}
        <div>
          <div className="text-xs text-muted-foreground mb-1">Pending Rewards</div>
          <div className="text-lg font-medium text-foreground" data-testid="text-pending-rewards">
            {pendingRewards}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button 
            onClick={handleStakeMore}
            className="gradient-button py-2.5 rounded-lg font-medium text-sm"
            data-testid="button-stake-more"
          >
            Stake More
          </Button>
          <Button 
            onClick={handleClaimReward}
            variant="outline"
            className="py-2.5 rounded-lg font-medium text-sm border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            data-testid="button-claim-reward"
          >
            Claim Reward
          </Button>
        </div>
      </div>
    </div>
  );
}