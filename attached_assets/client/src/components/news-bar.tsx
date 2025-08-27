import { useState, useEffect } from "react";

export function NewsBar() {
  const newsItems = [
    "🚀 MemeStake to the moon! HODL strong diamond hands! 💎🙌",
    "🐸 Pepe approves this project! Rare gains incoming! 📈",
    "🎉 Over 50,000 diamond hands joined the rocket! 💎🚀",
    "🔥 Wen lambo? Soon! APY go brrr! 🏎️💰",
    "⭐ Much wow! Such gains! Doge father blessing us! 🐕✨",
    "📈 Number go up! APE together strong! 🦍💪",
    "🌙 Not financial advice but... MOON MISSION activated! 🚀",
    "💎 Paper hands NGMI! Diamond hands forever! 🙌💯",
    "🤝 Based devs doxxed! No rugs here, anon! 🛡️",
    "🎯 Chad move: Still early! We're all gonna make it! 📊"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [newsItems.length]);

  return (
    <div className="w-full bg-muted/20 border border-border rounded-lg p-3 mb-6 overflow-hidden" data-testid="news-bar">
      <div className="flex items-center space-x-3">
        <div className="text-secondary font-semibold text-sm whitespace-nowrap">
          Latest Updates:
        </div>
        <div className="flex-1 overflow-hidden">
          <div 
            className="animate-pulse text-foreground text-sm whitespace-nowrap"
            data-testid="news-text"
          >
            {newsItems[currentIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}