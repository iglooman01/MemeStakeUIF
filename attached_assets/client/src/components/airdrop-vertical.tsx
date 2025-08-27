import { useState } from "react";
import { EmailVerificationCard } from "@/components/email-verification-card";
import { TasksCard } from "@/components/tasks-card";

export function AirdropVertical() {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [allTasksCompleted, setAllTasksCompleted] = useState(false);
  const [airdropClaimed, setAirdropClaimed] = useState(false);

  return (
    <div className="w-full" data-testid="airdrop-vertical">
      {/* Combined Airdrop Section */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 text-center">🎁 Chad Airdrop (DYOR & Complete) 🦍</h3>
        
        {/* Section 4.1: Email Verification */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-white mb-4">📧 Email Verification (No Scam)</h4>
          <EmailVerificationCard
            isVerified={isEmailVerified}
            onVerificationChange={setIsEmailVerified}
          />
        </div>

        {/* Section 4.2: Social Media Tasks */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-white mb-4">📱 Social Tasks (Much Easy) 🐕</h4>
          <TasksCard
            isEmailVerified={isEmailVerified}
            allTasksCompleted={allTasksCompleted}
            onTasksComplete={setAllTasksCompleted}
            airdropClaimed={airdropClaimed}
            onAirdropClaim={setAirdropClaimed}
          />
        </div>

        {/* Section 4.3: Success Message */}
        {airdropClaimed && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 text-center">
            <div className="text-secondary font-medium" data-testid="success-message">
              🎉 LFG! You're a certified APE! Tokens: 500 MEMES 🚀💎
            </div>
          </div>
        )}
      </div>
    </div>
  );
}