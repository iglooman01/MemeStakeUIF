import { useState, useEffect } from "react";

export function AirdropTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 84,
    hours: 3,
    minutes: 0,
    seconds: 5
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          seconds = 59;
          minutes--;
        } else if (hours > 0) {
          seconds = 59;
          minutes = 59;
          hours--;
        } else if (days > 0) {
          seconds = 59;
          minutes = 59;
          hours = 23;
          days--;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-accent/20 to-secondary/20 border border-accent/30 rounded-xl p-6 mb-6" data-testid="airdrop-timer">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Airdrop End</h2>
        <div className="flex items-center justify-center space-x-4 text-2xl md:text-3xl font-bold text-accent">
          <div className="flex flex-col items-center">
            <span data-testid="timer-days">{timeLeft.days}</span>
            <span className="text-xs text-muted-foreground font-normal">Days</span>
          </div>
          <span className="text-muted-foreground">:</span>
          <div className="flex flex-col items-center">
            <span data-testid="timer-hours">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground font-normal">Hrs</span>
          </div>
          <span className="text-muted-foreground">:</span>
          <div className="flex flex-col items-center">
            <span data-testid="timer-minutes">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground font-normal">Min</span>
          </div>
          <span className="text-muted-foreground">:</span>
          <div className="flex flex-col items-center">
            <span data-testid="timer-seconds">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground font-normal">Sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}