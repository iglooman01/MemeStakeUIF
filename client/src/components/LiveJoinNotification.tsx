import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Notification {
  id: string;
  country: string;
  flag: string;
  message: string;
}

const mockCountries = [
  { name: 'United States', flag: '🇺🇸' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'UAE', flag: '🇦🇪' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'South Africa', flag: '🇿🇦' },
];

const messages = [
  'joined the airdrop!',
  'just signed up!',
  'claimed tokens!',
  'joined MemeStake!',
  'connected wallet!',
  'just connected!',
  'wallet connected!',
];

export function LiveJoinNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [queue, setQueue] = useState<Notification[]>([]);

  useEffect(() => {
    const generateNotification = (): Notification => {
      const country = mockCountries[Math.floor(Math.random() * mockCountries.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];
      return {
        id: Date.now().toString() + Math.random(),
        country: country.name,
        flag: country.flag,
        message,
      };
    };

    const showNotification = () => {
      const notification = generateNotification();
      setQueue((prev) => [...prev, notification]);
    };

    const interval = setInterval(showNotification, 6000);
    
    setTimeout(showNotification, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (queue.length > 0 && notifications.length === 0) {
      const [next, ...rest] = queue;
      setNotifications([next]);
      setQueue(rest);

      setTimeout(() => {
        setNotifications([]);
      }, 4000);
    }
  }, [queue, notifications]);

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="pointer-events-auto mb-3"
          >
            <div 
              className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border"
              style={{
                background: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'rgba(0, 255, 136, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
              }}
            >
              <div className="text-3xl" data-testid={`flag-${notification.id}`}>
                {notification.flag}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate" data-testid={`country-${notification.id}`}>
                  {notification.country}
                </div>
                <div className="text-xs truncate" style={{ color: '#00ff88' }} data-testid={`message-${notification.id}`}>
                  {notification.message}
                </div>
              </div>
              <button
                onClick={() => handleClose(notification.id)}
                className="text-gray-400 hover:text-white transition-colors"
                data-testid={`button-close-notification-${notification.id}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
