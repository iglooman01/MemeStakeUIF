import { useState, useEffect } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 4,
    minutes: 32,
    seconds: 11
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
              days--;
              if (days < 0) {
                // Timer ended
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className="flex justify-center" data-testid="countdown-timer">
      <div className="timer-pill px-6 py-3 rounded-full flex items-center space-x-2">
        <span>⏱</span>
        <span className="font-medium">Time Left:</span>
        <span className="font-semibold" data-testid="text-time-remaining">
          {timeLeft.days}d {formatTime(timeLeft.hours)}h {formatTime(timeLeft.minutes)}m {formatTime(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
}
