import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ReferralsCard() {
  const [copySuccess, setCopySuccess] = useState(false);
  
  const referralStats = {
    users: 42,
    tokens: "12,500 MEMES",
    link: "https://memestake.com/ref/abc123def456"
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralStats.link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="glass-card rounded-xl p-6 mb-6" data-testid="referrals-card">
      <h3 className="text-lg font-semibold mb-4 text-white">🤝 Fren Referrals 🤝</h3>
      
      <div className="space-y-3">
        {/* Your Referral Users */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Your Diamond Frens 💎</span>
          <span className="text-foreground font-medium" data-testid="referral-users">
            {referralStats.users}
          </span>
        </div>
        
        {/* Your Referral Tokens */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Chad Rewards 🏆</span>
          <span className="text-secondary font-medium" data-testid="referral-tokens">
            {referralStats.tokens}
          </span>
        </div>
        
        {/* My Referral Link */}
        <div className="pt-2">
          <div className="text-muted-foreground mb-2">My Referral Link</div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={referralStats.link}
              readOnly
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground"
              data-testid="referral-link"
            />
            <Button
              onClick={handleCopyLink}
              size="sm"
              className="gradient-button"
              data-testid="button-copy-link"
            >
              {copySuccess ? "Copied!" : "Copy"}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 animate-pulse">
            🦍 Invite your frens! Ape together strong! Get extra MEMES! 🚀
          </div>
        </div>
      </div>
    </div>
  );
}