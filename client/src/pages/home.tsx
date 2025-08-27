import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const i18n = {
  en: { 
    features: 'Features', 
    pricing: 'Pricing', 
    blog: 'Blog', 
    about: 'About', 
    contact: 'Contact', 
    whitepaper: 'Whitepaper',
    getStarted: 'Connect Wallet',
    why: 'Why'
  },
  hi: { 
    features: 'विशेषताएँ', 
    pricing: 'मूल्य', 
    blog: 'ब्लॉग', 
    about: 'परिचय', 
    contact: 'संपर्क', 
    whitepaper: 'व्हाइटपेपर',
    getStarted: 'वॉलेट कनेक्ट करें',
    why: 'क्यों'
  },
  es: { 
    features: 'Funciones', 
    pricing: 'Precios', 
    blog: 'Blog', 
    about: 'Acerca de', 
    contact: 'Contacto', 
    whitepaper: 'Libro Blanco',
    getStarted: 'Conectar Billetera',
    why: 'Por qué'
  }
};

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [counters, setCounters] = useState({ raised: 0, members: 0, audited: 0, stakers: 0 });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [airdropTime, setAirdropTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { toast } = useToast();
  
  const testimonials = [
    {
      name: "Alex Chen",
      role: "DeFi Enthusiast", 
      content: "MemeStake is the first meme token I actually trust. The transparent tokenomics and audited contracts give me confidence to stake long-term."
    },
    {
      name: "Sarah Williams",
      role: "Crypto Investor",
      content: "The daily rewards are amazing! I've been earning 25% APY consistently for 3 months. Best decision ever."
    },
    {
      name: "Mike Rodriguez", 
      role: "Community Member",
      content: "The community is incredible. Great vibes, helpful members, and the team is always engaging with us. Plus the memes are fire! 🔥"
    }
  ];

  const faqItems = [
    {
      question: "What is MemeStake?",
      answer: "MemeStake is a stake-to-earn meme token project with audited contracts, transparent tokenomics, and community rewards."
    },
    {
      question: "How does the ICO work?", 
      answer: "The ICO runs in phases with fixed pricing. Tokens are claimable after the sale ends; any unsold tokens are allocated per the tokenomics (e.g., staking & liquidity)."
    },
    {
      question: "Why choose MemeStake over other meme coins?",
      answer: "Audited & public contracts, stake-to-earn mechanics (discourages dumping), real utility pools, and on-chain community rewards."
    },
    {
      question: "Is the smart contract audited?",
      answer: "Yes. The contracts are audited and the reports will be linked from our whitepaper and website once the final review is complete."
    },
    {
      question: "What chain is MemeStake on?",
      answer: "MemeStake launches on EVM-compatible chain(s) for low fees and broad wallet support. Network details are announced before TGE."
    },
    {
      question: "How do staking rewards work?", 
      answer: "Stake tokens into pools to earn rewards over time. Yields depend on pool allocation, duration, and program parameters announced at launch."
    }
  ];

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Initialize language
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    const browserLang = navigator.language.substring(0, 2);
    const initialLang = savedLang || (i18n[browserLang as keyof typeof i18n] ? browserLang : 'en');
    setLanguage(initialLang);
  }, []);

  // Theme toggle
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

  // Language change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Counter animation
  useEffect(() => {
    const targets = { raised: 2500000, members: 15000, audited: 3, stakers: 8500 };
    const duration = 1200;
    const steps = 60;
    const stepDuration = duration / steps;

    const animate = (key: keyof typeof counters, target: number) => {
      let current = 0;
      const increment = target / steps;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCounters(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, stepDuration);
    };

    // Trigger animation on mount
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          Object.entries(targets).forEach(([key, target]) => {
            animate(key as keyof typeof counters, target);
          });
          observer.disconnect();
        }
      });
    });

    const kpiSection = document.querySelector('#kpi-section');
    if (kpiSection) observer.observe(kpiSection);

    return () => observer.disconnect();
  }, []);

  // Testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % testimonials.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Form validation
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: any = {};

    if (!contactForm.name.trim()) errors.name = 'Please enter your name';
    if (!contactForm.email.trim()) errors.email = 'Please enter your email';
    else if (!validateEmail(contactForm.email)) errors.email = 'Please enter a valid email address';
    if (!contactForm.message.trim()) errors.message = 'Please enter your message';

    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      setContactForm({ name: '', email: '', message: '' });
    }
  };

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
    toast({
      title: "Subscribed successfully!",
      description: "Welcome to the MemeStake community!",
    });
    setNewsletterEmail('');
  };

  const selectPlan = (plan: string) => {
    toast({
      title: `Selected plan: ${plan}`,
      description: "Redirecting to purchase...",
    });
  };

  // Airdrop countdown timer
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7); // 7 days from now
    targetDate.setHours(15, 0, 0, 0); // 3 PM
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance > 0) {
        setAirdropTime({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setAirdropTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = i18n[language as keyof typeof i18n] || i18n.en;

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-md border-b border-border z-30" style={{background: 'rgba(15, 10, 35, 0.8)'}} data-testid="header-navigation">
        <nav className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2" data-testid="logo-brand">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #00bfff 100%)',
                border: '2px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'
              }}>
                <span className="text-primary-foreground font-bold text-lg">₿</span>
              </div>
              <span className="text-xl font-bold text-white">MemeStake</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8" data-testid="desktop-nav">
              <a href="#about" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-about">{t.about}</a>
              <a href="#meme-aggregator" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-staking">Staking</a>
              <a href="#whitepaper" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-whitepaper">{t.whitepaper}</a>
              <a href="#tokenomics" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-tokenomics">Tokenomics</a>
            </div>

            {/* Header Controls */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-16 h-8 text-sm" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="hi">हिं</SelectItem>
                  <SelectItem value="es">ES</SelectItem>
                </SelectContent>
              </Select>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="p-2 h-8 w-8"
                data-testid="button-theme-toggle"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </Button>

              {/* Primary CTA */}
              <Button asChild className="hidden sm:inline-flex" data-testid="button-get-started">
                <a href="#tokenomics">{t.getStarted}</a>
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden hamburger"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu active" data-testid="mobile-menu">
          <div className="p-6">
            <div className="flex flex-col space-y-4 mt-16">
              <a href="#about" className="text-lg" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-about">{t.about}</a>
              <a href="#meme-aggregator" className="text-lg" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-staking">Staking</a>
              <a href="#whitepaper" className="text-lg" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-whitepaper">{t.whitepaper}</a>
              <a href="#tokenomics" className="text-lg" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-tokenomics">Tokenomics</a>
              <Button asChild className="mt-4" data-testid="mobile-button-get-started">
                <a href="#tokenomics">{t.getStarted}</a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="min-h-screen hero-section flex items-center justify-center" data-testid="section-hero">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight" data-testid="text-hero-headline">
              Stake Memes. <span className="text-primary">Earn Big.</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto" data-testid="text-hero-subtitle">
              Turn your favorite meme tokens into daily passive income.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-4" data-testid="button-start-staking">
                <a href="#meme-aggregator">🚀 Start Staking</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4" data-testid="button-learn-more">
                <a href="#about">📄 Learn More</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Airdrop Timer */}
      <section className="py-8" style={{background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)'}} data-testid="section-airdrop">
        <div className="container">
          <div className="text-center">
            <Card className="p-8 max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="chip gold mr-4">🎁 AIRDROP</div>
                  <div className="chip">🔥 EXCLUSIVE</div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#ffd700'}}>
                  🚀 MemeStake Token Airdrop
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Get ready for the biggest meme token airdrop of 2025! Early stakers get exclusive bonuses.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                    <div className="text-3xl md:text-4xl font-bold" style={{color: '#ffd700'}}>
                      {String(airdropTime.days).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
                    <div className="text-3xl md:text-4xl font-bold" style={{color: '#00bfff'}}>
                      {String(airdropTime.hours).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-muted-foreground">Hours</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                    <div className="text-3xl md:text-4xl font-bold" style={{color: '#ffd700'}}>
                      {String(airdropTime.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
                    <div className="text-3xl md:text-4xl font-bold" style={{color: '#00bfff'}}>
                      {String(airdropTime.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-muted-foreground">Seconds</div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.03)'}}>
                    <div className="text-xl font-bold" style={{color: '#ffd700'}}>10,000,000</div>
                    <div className="text-sm text-muted-foreground">MEME Tokens</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.03)'}}>
                    <div className="text-xl font-bold" style={{color: '#00bfff'}}>25,000+</div>
                    <div className="text-sm text-muted-foreground">Participants</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.03)'}}>
                    <div className="text-xl font-bold" style={{color: '#ffd700'}}>$250,000</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="text-lg px-8 py-4" data-testid="button-claim-airdrop">
                    <a href="#meme-aggregator">🎁 Claim Airdrop</a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4" data-testid="button-airdrop-rules">
                    <a href="#faq">📄 Eligibility Rules</a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Meme Token Aggregator */}
      <section id="meme-aggregator" className="section-padding crypto-bg" data-testid="section-meme-aggregator">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Meme Tokens</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stake your favorite meme tokens and earn passive income with our high-yield pools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 relative overflow-hidden" data-testid="card-doge-staking">
              <div className="absolute top-4 right-4">
                <div className="chip gold">🔥 Hot</div>
              </div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center mr-3">
                  <span className="text-xl">🐕</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Dogecoin (DOGE)</div>
                  <div className="text-sm text-muted-foreground">$0.0847 (+12.5%)</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">APY</span>
                  <span className="font-medium" style={{color: '#00bfff'}}>89.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Staked</span>
                  <span className="font-medium text-white">2.5M DOGE</span>
                </div>
                <div className="w-full rounded-full h-2" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                  <div className="h-2 rounded-full" style={{
                    width: '78%',
                    background: 'linear-gradient(to right, #ffd700, #00bfff)'
                  }}></div>
                </div>
                <Button className="w-full" data-testid="button-stake-doge">Stake DOGE</Button>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden" data-testid="card-shib-staking">
              <div className="absolute top-4 right-4">
                <div className="chip">🚀 Rising</div>
              </div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center mr-3">
                  <span className="text-xl">🐕‍🦺</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Shiba Inu (SHIB)</div>
                  <div className="text-sm text-muted-foreground">$0.000023 (+8.2%)</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">APY</span>
                  <span className="font-medium" style={{color: '#00bfff'}}>124.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Staked</span>
                  <span className="font-medium text-white">850B SHIB</span>
                </div>
                <div className="w-full rounded-full h-2" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                  <div className="h-2 rounded-full" style={{
                    width: '65%',
                    background: 'linear-gradient(to right, #ffd700, #00bfff)'
                  }}></div>
                </div>
                <Button className="w-full" data-testid="button-stake-shib">Stake SHIB</Button>
              </div>
            </Card>

            <Card className="p-6 relative overflow-hidden" data-testid="card-pepe-staking">
              <div className="absolute top-4 right-4">
                <div className="chip gold">💎 Premium</div>
              </div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <span className="text-xl">🐸</span>
                </div>
                <div>
                  <div className="font-semibold text-white">Pepe (PEPE)</div>
                  <div className="text-sm text-muted-foreground">$0.0000087 (+15.3%)</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">APY</span>
                  <span className="font-medium" style={{color: '#00bfff'}}>156.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Staked</span>
                  <span className="font-medium text-white">1.2T PEPE</span>
                </div>
                <div className="w-full rounded-full h-2" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                  <div className="h-2 rounded-full" style={{
                    width: '92%',
                    background: 'linear-gradient(to right, #ffd700, #00bfff)'
                  }}></div>
                </div>
                <Button className="w-full" data-testid="button-stake-pepe">Stake PEPE</Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Staking Dashboard */}
      <section id="staking-dashboard" className="section-padding" data-testid="section-staking-dashboard">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Staking Dashboard</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your meme token portfolio and maximize your passive income
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6" data-testid="card-portfolio-overview">
                <h3 className="text-xl font-semibold mb-6 text-white">Portfolio Overview</h3>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                    <div className="text-2xl font-bold" style={{color: '#ffd700'}}>$12,450</div>
                    <div className="text-sm text-muted-foreground">Total Staked</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                    <div className="text-2xl font-bold" style={{color: '#00bfff'}}>$1,847</div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                    <div className="text-2xl font-bold" style={{color: '#ffd700'}}>+14.8%</div>
                    <div className="text-sm text-muted-foreground">24h Change</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.03)'}}>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🐕</span>
                      <div>
                        <div className="font-medium text-white">1,250,000 DOGE</div>
                        <div className="text-sm text-muted-foreground">Staked for 45 days</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" style={{color: '#00bfff'}}>+$847.50</div>
                      <div className="text-sm text-muted-foreground">Daily: +$18.83</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.03)'}}>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🐸</span>
                      <div>
                        <div className="font-medium text-white">500B PEPE</div>
                        <div className="text-sm text-muted-foreground">Staked for 23 days</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" style={{color: '#00bfff'}}>+$445.20</div>
                      <div className="text-sm text-muted-foreground">Daily: +$19.36</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* ROI Calculator */}
            <div>
              <Card className="p-6" data-testid="card-roi-calculator">
                <h3 className="text-lg font-semibold mb-6 text-white">ROI Calculator</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Token Amount</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter amount"
                      className="mt-1"
                      data-testid="input-token-amount"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm text-muted-foreground">Staking Period</Label>
                    <Select>
                      <SelectTrigger className="mt-1" data-testid="select-staking-period">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                        <SelectItem value="180">180 Days</SelectItem>
                        <SelectItem value="365">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                    <div className="text-center">
                      <div className="text-xl font-bold" style={{color: '#00bfff'}}>$2,847.50</div>
                      <div className="text-sm text-muted-foreground">Estimated Returns</div>
                    </div>
                  </div>
                  
                  <Button className="w-full" data-testid="button-start-staking">
                    Start Staking
                  </Button>
                </div>
              </Card>
              
              <Card className="p-6 mt-6" data-testid="card-meme-of-day">
                <h3 className="text-lg font-semibold mb-4 text-white">🎯 Meme of the Day</h3>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="font-medium text-white mb-1">FLOKI</div>
                  <div className="text-sm text-muted-foreground mb-3">+67.8% APY</div>
                  <Button size="sm" className="w-full" data-testid="button-stake-meme-day">
                    Stake Now
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trending & Activity */}
      <section className="section-padding crypto-bg" data-testid="section-trending">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">🔥 Trending Now</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Live meme token trends and community activity
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Trending Tokens */}
            <Card className="p-6" data-testid="card-trending-tokens">
              <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
                📈 Top Performers (24h)
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🐸</span>
                    <div>
                      <div className="font-medium text-white">PEPE</div>
                      <div className="text-sm text-muted-foreground">Pepe Coin</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium" style={{color: '#00ff88'}}>+24.7%</div>
                    <div className="text-sm text-muted-foreground">$0.0000094</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🐕</span>
                    <div>
                      <div className="font-medium text-white">DOGE</div>
                      <div className="text-sm text-muted-foreground">Dogecoin</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium" style={{color: '#00ff88'}}>+18.3%</div>
                    <div className="text-sm text-muted-foreground">$0.0891</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🚀</span>
                    <div>
                      <div className="font-medium text-white">FLOKI</div>
                      <div className="text-sm text-muted-foreground">Floki Inu</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium" style={{color: '#00ff88'}}>+15.2%</div>
                    <div className="text-sm text-muted-foreground">$0.000147</div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Recent Activity */}
            <Card className="p-6" data-testid="card-recent-activity">
              <h3 className="text-xl font-semibold mb-6 text-white flex items-center">
                ⚡ Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.05)'}}>
                  <div className="w-2 h-2 rounded-full mt-2" style={{background: '#00bfff'}}></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Large stake of 2.5M DOGE</div>
                    <div className="text-xs text-muted-foreground">2 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.05)'}}>
                  <div className="w-2 h-2 rounded-full mt-2" style={{background: '#ffd700'}}></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">New PEPE staking pool launched</div>
                    <div className="text-xs text-muted-foreground">8 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.05)'}}>
                  <div className="w-2 h-2 rounded-full mt-2" style={{background: '#00bfff'}}></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Community milestone: 25K stakers!</div>
                    <div className="text-xs text-muted-foreground">15 minutes ago</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.05)'}}>
                  <div className="w-2 h-2 rounded-full mt-2" style={{background: '#ffd700'}}></div>
                  <div className="flex-1">
                    <div className="text-sm text-white">Rewards distributed: $12,847</div>
                    <div className="text-xs text-muted-foreground">23 minutes ago</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg text-center" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                <div className="text-sm font-medium" style={{color: '#ffd700'}}>🎉 Daily Rewards Pool</div>
                <div className="text-2xl font-bold text-white mt-1">$47,293.50</div>
                <div className="text-xs text-muted-foreground mt-1">Ready for distribution</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section id="tokenomics" className="section-padding" data-testid="section-tokenomics">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tokenomics</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fair and transparent token distribution designed for long-term success
            </p>
          </div>
          
          <div className="cols-2 items-center gap-12">
            {/* Tokenomics Chart */}
            <div className="tokenomics-chart" data-testid="chart-tokenomics">
              <svg viewBox="0 0 300 300" className="w-full h-auto">
                <circle cx="150" cy="150" r="100" fill="none" stroke="hsl(var(--primary))" strokeWidth="20" 
                        strokeDasharray="157 314" strokeDashoffset="0" transform="rotate(-90 150 150)"/>
                <circle cx="150" cy="150" r="100" fill="none" stroke="hsl(var(--accent))" strokeWidth="20" 
                        strokeDasharray="94 314" strokeDashoffset="-157" transform="rotate(-90 150 150)"/>
                <circle cx="150" cy="150" r="100" fill="none" stroke="hsl(var(--secondary))" strokeWidth="20" 
                        strokeDasharray="63 314" strokeDashoffset="-251" transform="rotate(-90 150 150)"/>
                <text x="150" y="145" textAnchor="middle" className="text-sm font-bold fill-foreground">1B</text>
                <text x="150" y="160" textAnchor="middle" className="text-xs fill-muted-foreground">Total Supply</text>
              </svg>
            </div>
            
            {/* Tokenomics Breakdown */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3" data-testid="item-public-sale">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <div>
                  <div className="font-medium">Public Sale - 50%</div>
                  <div className="text-sm text-muted-foreground">500M tokens available for ICO</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3" data-testid="item-staking-rewards">
                <div className="w-4 h-4 bg-accent rounded"></div>
                <div>
                  <div className="font-medium">Staking Rewards - 30%</div>
                  <div className="text-sm text-muted-foreground">300M tokens for staking incentives</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3" data-testid="item-team-dev">
                <div className="w-4 h-4 bg-secondary rounded"></div>
                <div>
                  <div className="font-medium">Team & Development - 20%</div>
                  <div className="text-sm text-muted-foreground">200M tokens with 2-year vesting</div>
                </div>
              </div>
              
              <Card className="p-6" data-testid="card-key-details">
                <h4 className="font-semibold mb-3">Key Details</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 2-year team token lock with linear vesting</li>
                  <li>• Liquidity locked for 5 years</li>
                  <li>• No hidden allocations or backdoors</li>
                  <li>• Smart contract ownership renounced</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section id="faq" className="section-padding crypto-bg" data-testid="section-faq">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about MemeStake
            </p>
          </div>
          
          <div className="cols-2 gap-12 max-w-6xl mx-auto">
            {/* FAQ Column */}
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details key={index} className="panel" data-testid={`faq-item-${index}`}>
                  <summary className="font-medium cursor-pointer flex items-center justify-between">
                    {item.question}
                    <span className="text-primary text-xl">+</span>
                  </summary>
                  <p className="text-sm text-muted-foreground mt-3">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
            
            {/* Support Card */}
            <div className="space-y-6">
              <Card className="p-6 text-center" data-testid="card-support">
                <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="font-semibold mb-2">Still need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our community team is here to help you get started
                </p>
                <Button asChild data-testid="button-contact-support">
                  <a href="#contact">Contact Support</a>
                </Button>
              </Card>
              
              <details className="panel" data-testid="faq-tokenomics-details">
                <summary className="font-medium cursor-pointer flex items-center justify-between">
                  What are the tokenomics?
                  <span className="text-primary text-xl">+</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3">
                  Total supply, public sale %, team vesting (cliff + linear), liquidity lock, and staking allocation are published in the whitepaper and on the Tokenomics section.
                </p>
              </details>
              
              <details className="panel" data-testid="faq-vesting">
                <summary className="font-medium cursor-pointer flex items-center justify-between">
                  Is there a vesting schedule?
                  <span className="text-primary text-xl">+</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3">
                  Yes. Team & advisor tokens are subject to a cliff followed by linear vesting; sale allocations follow the schedule disclosed pre-ICO.
                </p>
              </details>
              
              <details className="panel" data-testid="faq-wallets">
                <summary className="font-medium cursor-pointer flex items-center justify-between">
                  Which wallets are supported?
                  <span className="text-primary text-xl">+</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3">
                  Any popular EVM wallet (e.g., MetaMask, Coinbase Wallet, WalletConnect-compatible). Make sure you're on the correct network.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding parallax-bg" data-testid="section-about">
        <div className="container">
          <div className="cols-2 items-center gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">About MemeStake</h2>
              <p className="text-lg text-muted-foreground mb-6">
                We're building the future of meme tokens by combining viral culture with serious DeFi technology. 
                Our mission is to create sustainable value for holders while maintaining the fun and community spirit that makes memes special.
              </p>
              <p className="text-muted-foreground mb-8">
                Founded by experienced DeFi developers and meme enthusiasts, MemeStake represents a new generation 
                of projects that prioritize transparency, community rewards, and long-term sustainability.
              </p>
              <Button asChild data-testid="button-learn-about">
                <a href="#about">Learn About Us</a>
              </Button>
            </div>
            
            <Card className="p-6" data-testid="card-smart-contract">
              <h3 className="font-semibold mb-4">Smart Contract Preview</h3>
              <div className="bg-secondary rounded p-4 font-mono text-sm overflow-x-auto">
                <div className="text-green-600">// MemeStake Contract</div>
                <div>contract MemeStake {'{'}</div>
                <div>&nbsp;&nbsp;uint256 public totalSupply = 1e9;</div>
                <div>&nbsp;&nbsp;uint256 public stakingRewards;</div>
                <div>&nbsp;&nbsp;mapping(address =&gt; uint256) stakes;</div>
                <div>&nbsp;&nbsp;</div>
                <div>&nbsp;&nbsp;function stake(uint256 amount) {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;// Audited staking logic</div>
                <div>&nbsp;&nbsp;{'}'}</div>
                <div>{'}'}</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Whitepaper Section */}
      <section id="whitepaper" className="section-padding" data-testid="section-whitepaper">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Whitepaper</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive documentation covering MemeStake's technology, tokenomics, and roadmap
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6" data-testid="card-technical-overview">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="font-semibold mb-3">Technical Overview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Deep dive into our smart contract architecture, staking mechanisms, and security protocols.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Smart contract specifications</li>
                  <li>• Staking algorithm details</li>
                  <li>• Security audit results</li>
                  <li>• Multi-sig wallet implementation</li>
                </ul>
              </Card>
              
              <Card className="p-6" data-testid="card-tokenomics-details">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold mb-3">Tokenomics Model</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete breakdown of token distribution, vesting schedules, and reward mechanisms.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Token supply & distribution</li>
                  <li>• Staking rewards calculation</li>
                  <li>• Vesting schedules</li>
                  <li>• Liquidity provisions</li>
                </ul>
              </Card>
              
              <Card className="p-6" data-testid="card-roadmap">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="font-semibold mb-3">Development Roadmap</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our strategic plan for platform development, partnerships, and ecosystem growth.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Phase 1: Platform launch</li>
                  <li>• Phase 2: Advanced features</li>
                  <li>• Phase 3: Ecosystem expansion</li>
                  <li>• Phase 4: Cross-chain integration</li>
                </ul>
              </Card>
              
              <Card className="p-6" data-testid="card-governance">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="font-semibold mb-3">Governance Model</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Community-driven decision making process and proposal management system.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Voting mechanisms</li>
                  <li>• Proposal requirements</li>
                  <li>• Implementation process</li>
                  <li>• Community treasury</li>
                </ul>
              </Card>
            </div>
            
            <div className="text-center">
              <Card className="p-8 max-w-2xl mx-auto" data-testid="card-download-whitepaper">
                <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Download Full Whitepaper</h3>
                <p className="text-muted-foreground mb-6">
                  Get the complete 32-page whitepaper with detailed technical specifications, economic models, and strategic vision.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" data-testid="button-download-whitepaper">
                    <a href="#" className="inline-flex items-center">
                      📄 Download PDF
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" data-testid="button-view-online">
                    <a href="#" className="inline-flex items-center">
                      🌐 View Online
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscribe */}
      <section className="section-padding crypto-bg" data-testid="section-newsletter">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscribe to our newsletter</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get product news, tips, and the occasional meme. Unsubscribe anytime.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" data-testid="form-newsletter">
              <Input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" className="whitespace-nowrap" data-testid="button-subscribe">
                Subscribe
              </Button>
            </form>
            
            {formErrors.newsletter && (
              <div className="text-destructive text-sm mt-2" data-testid="error-newsletter">{formErrors.newsletter}</div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)'}} data-testid="footer">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #00bfff 100%)',
                  border: '2px solid rgba(255, 215, 0, 0.3)',
                  boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'
                }}>
                  <span className="text-primary-foreground font-bold text-xl">₿</span>
                </div>
                <span className="text-2xl font-bold text-white">MemeStake</span>
              </div>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                The ultimate meme token staking platform. Earn passive income from your favorite meme coins with our secure, audited smart contracts.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80" 
                   style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                   data-testid="social-twitter">
                  <span className="text-sm">𝕏</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                   style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}
                   data-testid="social-discord">
                  <span className="text-sm">💬</span>
                </a>
                <a href="#" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                   style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                   data-testid="social-telegram">
                  <span className="text-sm">📱</span>
                </a>
              </div>
            </div>
            
            {/* Platform Links */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <span className="mr-2">🚀</span>Platform
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#meme-aggregator" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-staking">Staking Pools</a></li>
                <li><a href="#staking-dashboard" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-dashboard">Dashboard</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-calculator">ROI Calculator</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-rewards">Claim Rewards</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-portfolio">Portfolio</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <span className="mr-2">📚</span>Resources
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#whitepaper" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-whitepaper">Whitepaper</a></li>
                <li><a href="#tokenomics" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-tokenomics">Tokenomics</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-faq">FAQ</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-about">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-support">Support</a></li>
              </ul>
            </div>
            
            {/* Legal & Community */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <span className="mr-2">⚖️</span>Legal
              </h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-privacy">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-terms">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-disclaimer">Risk Disclaimer</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-audit">Security Audit</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-link-bug">Bug Bounty</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-sm text-muted-foreground mb-4 md:mb-0">
                © {new Date().getFullYear()} MemeStake. All rights reserved. | Built with 💎 for the meme community
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{background: '#00ff88'}}></div>
                  <span className="text-muted-foreground">System Status: Online</span>
                </div>
                <div className="text-muted-foreground">|</div>
                <div className="text-muted-foreground">
                  <span className="font-medium" style={{color: '#ffd700'}}>TVL:</span> $47.2M
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-3 rounded-full shadow-lg z-40 hover:opacity-90"
          onClick={scrollToTop}
          data-testid="button-back-to-top"
        >
          <span className="text-lg">↑</span>
        </Button>
      )}
    </div>
  );
}
