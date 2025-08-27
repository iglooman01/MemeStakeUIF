import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function UserProfileSection() {
  const userLevel = 15;
  const currentXP = 2850;
  const nextLevelXP = 3200;
  const xpProgress = (currentXP / nextLevelXP) * 100;
  
  const userStats = {
    totalEarned: "12,500 MEMES",
    tasksCompleted: 47,
    daysActive: 28,
    referrals: 12
  };

  const achievements = [
    { id: 1, title: "Early Adopter", description: "Joined in the first 1000 users", icon: "🏆", earned: true, rarity: "Gold" },
    { id: 2, title: "Task Master", description: "Completed 50+ tasks", icon: "⭐", earned: false, rarity: "Silver", progress: 47, target: 50 },
    { id: 3, title: "Community Builder", description: "Referred 10+ friends", icon: "👥", earned: true, rarity: "Bronze" },
    { id: 4, title: "HODLER", description: "Hold tokens for 30+ days", icon: "💎", earned: true, rarity: "Silver" },
    { id: 5, title: "Social Butterfly", description: "Connected all social accounts", icon: "🦋", earned: true, rarity: "Bronze" },
    { id: 6, title: "Whale Status", description: "Hold 1M+ MEMES tokens", icon: "🐋", earned: false, rarity: "Legendary", progress: 975000, target: 1000000 }
  ];

  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarned: "3,200 MEMES",
    monthlyEarnings: "450 MEMES"
  };

  const levelBenefits = [
    { level: 10, benefit: "5% bonus on all tasks", unlocked: true },
    { level: 15, benefit: "Access to exclusive airdrops", unlocked: true },
    { level: 20, benefit: "10% trading fee discount", unlocked: false },
    { level: 25, benefit: "VIP community access", unlocked: false }
  ];

  const copyReferralCode = () => {
    const referralCode = "MEME-REF-USER123";
    navigator.clipboard.writeText(`https://memestake.com/ref/${referralCode}`);
    console.log("Referral link copied");
  };

  return (
    <div className="space-y-6" data-testid="user-profile-section">
      {/* Referral System */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-card border-border" data-testid="referral-card">
          <CardHeader>
            <CardTitle className="text-white">Referral Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent" data-testid="referral-total">{referralStats.totalReferrals}</div>
                  <div className="text-xs text-muted-foreground">Total Referrals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary" data-testid="referral-active">{referralStats.activeReferrals}</div>
                  <div className="text-xs text-muted-foreground">Active This Month</div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="text-sm text-muted-foreground mb-2">Referral Earnings</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-foreground" data-testid="referral-total-earned">{referralStats.totalEarned}</div>
                    <div className="text-xs text-muted-foreground">Total Earned</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-secondary" data-testid="referral-monthly-earned">{referralStats.monthlyEarnings}</div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={copyReferralCode}
                  className="gradient-button w-full"
                  data-testid="button-copy-referral"
                >
                  Copy Referral Link
                </Button>
                <div className="text-xs text-center text-muted-foreground">
                  Earn 10% of your referrals' rewards forever!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}