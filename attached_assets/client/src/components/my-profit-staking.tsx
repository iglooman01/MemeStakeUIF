import { Button } from "@/components/ui/button";

export function MyProfitStaking() {
  const stakingEarnings = {
    totalEarnings: "3,247 MEMES",
    dailyEarnings: "285 MEMES",
    weeklyEarnings: "1,995 MEMES",
    monthlyEarnings: "8,550 MEMES",
    stakingDays: 47,
    totalWithdrawable: "2,100 MEMES"
  };

  const handleWithdraw = () => {
    console.log("Opening withdraw modal...");
  };

  return (
    <div className="glass-card rounded-xl p-6" data-testid="my-profit-staking">
      <h3 className="text-lg font-semibold mb-4 text-white">My Profit Staking</h3>
      
      <div className="space-y-4">
        {/* Staking Earnings Summary */}
        <div>
          <div className="text-xs text-muted-foreground mb-3">Staking Earnings Summary</div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-muted-foreground">Total Earnings</div>
              <div className="text-lg font-bold text-accent" data-testid="text-total-earnings">
                {stakingEarnings.totalEarnings}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Daily Earnings</div>
              <div className="text-sm font-medium text-secondary" data-testid="text-daily-earnings">
                {stakingEarnings.dailyEarnings}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Weekly Earnings</div>
              <div className="text-sm font-medium text-foreground" data-testid="text-weekly-earnings">
                {stakingEarnings.weeklyEarnings}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Monthly Earnings</div>
              <div className="text-sm font-medium text-foreground" data-testid="text-monthly-earnings">
                {stakingEarnings.monthlyEarnings}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4 pt-2 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground">Staking Days</div>
              <div className="text-sm font-medium text-foreground" data-testid="text-staking-days">
                {stakingEarnings.stakingDays} days
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Available to Withdraw</div>
              <div className="text-lg font-bold text-secondary" data-testid="text-withdrawable">
                {stakingEarnings.totalWithdrawable}
              </div>
            </div>
          </div>
        </div>
        
        {/* Withdraw button */}
        <div className="pt-2">
          <Button 
            onClick={handleWithdraw}
            className="gradient-button w-full py-3 rounded-lg font-medium"
            data-testid="button-withdraw"
          >
            Withdraw Earnings
          </Button>
        </div>
      </div>
    </div>
  );
}