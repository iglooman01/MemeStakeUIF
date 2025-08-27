import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailVerificationCardProps {
  isVerified: boolean;
  onVerificationChange: (verified: boolean) => void;
}

export function EmailVerificationCard({ isVerified, onVerificationChange }: EmailVerificationCardProps) {
  const [email, setEmail] = useState("user@example.com");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(true);
  
  const rewardAmount = "500 MEMES";
  const verificationSteps = [
    { step: 1, title: "Enter Email", completed: true },
    { step: 2, title: "Verify OTP", completed: isVerified },
    { step: 3, title: "Claim Reward", completed: isVerified }
  ];

  const handleSubmit = () => {
    if (otp.length === 6) {
      onVerificationChange(true);
      console.log("Email verified successfully!");
    }
  };

  const handleResendOTP = () => {
    console.log("Resending OTP...");
  };

  return (
    <div className="glass-card rounded-xl p-6" data-testid="email-verification-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Complete Your Email Verification</h2>
        <div className="text-sm">
          <span className="text-secondary font-medium">Reward: </span>
          <span className="text-accent font-semibold" data-testid="text-verification-reward">+{rewardAmount}</span>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {verificationSteps.map((step, index) => (
          <div key={step.step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.completed 
                ? 'bg-secondary text-secondary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`} data-testid={`step-${step.step}`}>
              {step.completed ? '✓' : step.step}
            </div>
            <span className={`ml-2 text-xs ${
              step.completed ? 'text-secondary' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
            {index < verificationSteps.length - 1 && (
              <div className={`w-8 h-0.5 mx-3 ${
                step.completed ? 'bg-secondary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Email input */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-2 block">Email Address</label>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          data-testid="input-email"
          disabled={isVerified}
        />
      </div>
      
      {/* OTP row */}
      <div className="flex space-x-3 mb-4">
        <div className="flex-1">
          <label className="text-sm text-muted-foreground mb-2 block">Verification Code</label>
          <Input
            type="text"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            data-testid="input-otp"
            disabled={isVerified}
            maxLength={6}
          />
        </div>
        <div className="flex flex-col justify-end">
          <Button 
            onClick={handleSubmit}
            className="gradient-button px-6 py-3 rounded-lg"
            data-testid="button-submit-otp"
            disabled={isVerified}
          >
            {isVerified ? 'Verified' : 'Submit'}
          </Button>
        </div>
      </div>
      
      {/* Additional actions */}
      {otpSent && !isVerified && (
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Didn't receive the code?</span>
          <Button 
            variant="ghost" 
            onClick={handleResendOTP}
            className="text-accent hover:text-accent-foreground text-sm p-0 h-auto"
            data-testid="button-resend-otp"
          >
            Resend OTP
          </Button>
        </div>
      )}
      
      {/* Status section */}
      {isVerified ? (
        <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-secondary text-lg">✓</span>
              <div>
                <div className="text-secondary text-sm font-medium" data-testid="status-verification">
                  Email verified successfully!
                </div>
                <div className="text-muted-foreground text-xs">
                  You've earned {rewardAmount} bonus tokens
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-secondary font-semibold text-sm">+{rewardAmount}</div>
              <div className="text-muted-foreground text-xs">Added to wallet</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div>
              <div className="text-yellow-200 text-sm font-medium">
                Email verification pending
              </div>
              <div className="text-muted-foreground text-xs">
                Complete verification to earn {rewardAmount} and unlock airdrop eligibility
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
