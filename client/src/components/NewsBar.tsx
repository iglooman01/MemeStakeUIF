import { useState, useEffect } from "react";

export function NewsBar() {
  const [newsMessage, setNewsMessage] = useState<string>("🎉 Congratulations! We are live. Complete your task and claim your reward.");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news-ticker");
        if (response.ok) {
          const data = await response.json();
          if (data.message) {
            setNewsMessage(data.message);
          }
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="w-full overflow-hidden py-2.5"
      style={{
        background: "linear-gradient(90deg, rgba(13, 17, 23, 0.95) 0%, rgba(26, 31, 46, 0.95) 50%, rgba(13, 17, 23, 0.95) 100%)",
        borderBottom: "1px solid rgba(255, 215, 0, 0.3)",
      }}
      data-testid="news-bar"
    >
      <div 
        className="inline-block whitespace-nowrap animate-scroll-news"
        style={{
          color: "#00ffcc",
          fontSize: "14px",
          fontWeight: 500,
          paddingLeft: "100%",
        }}
      >
        {newsMessage}
      </div>
      <style>{`
        @keyframes scroll-news {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll-news {
          animation: scroll-news 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
