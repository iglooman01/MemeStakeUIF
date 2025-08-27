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
    getStarted: 'Get Started',
    why: 'Why'
  },
  hi: { 
    features: 'विशेषताएँ', 
    pricing: 'मूल्य', 
    blog: 'ब्लॉग', 
    about: 'परिचय', 
    contact: 'संपर्क', 
    getStarted: 'शुरू करें',
    why: 'क्यों'
  },
  es: { 
    features: 'Funciones', 
    pricing: 'Precios', 
    blog: 'Blog', 
    about: 'Acerca de', 
    contact: 'Contacto', 
    getStarted: 'Comenzar',
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
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">₿</span>
              </div>
              <span className="text-xl font-bold text-white">MemeStake</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8" data-testid="desktop-nav">
              <a href="#tokenomics" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-tokenomics">Tokenomics</a>
              <a href="#about" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-about">{t.about}</a>
              <a href="#contact" className="nav-link text-foreground hover:text-primary transition-colors" data-testid="link-contact">{t.contact}</a>
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
                <a href="#contact">{t.getStarted}</a>
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
              <a href="#tokenomics" className="text-lg" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-tokenomics">Tokenomics</a>
              <a href="#about" className="text-lg" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-about">{t.about}</a>
              <a href="#contact" className="text-lg" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-contact">{t.contact}</a>
              <Button asChild className="mt-4" data-testid="mobile-button-get-started">
                <a href="#contact">{t.getStarted}</a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="section-padding hero-section" data-testid="section-hero">
        <div className="container">
          <div className="cols-2 items-center gap-12">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="text-hero-headline">
                Stake Memes. <span className="text-primary">Earn Big.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-hero-subtitle">
                Turn your favorite meme tokens into daily passive income.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" data-testid="button-join-ico">
                  <a href="#pricing">Join the ICO</a>
                </Button>
                <Button asChild variant="outline" size="lg" data-testid="button-read-whitepaper">
                  <a href="#about">Read Whitepaper</a>
                </Button>
              </div>
            </div>
            
            {/* Hero Preview Card */}
            <div className="relative" data-testid="card-hero-preview">
              <Card className="p-6 max-w-md mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <CardContent className="p-0 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Stake Dashboard</h3>
                    <div className="chip">🟢 Live</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="muted">Total Staked</span>
                      <span className="font-medium text-white">1,250 MEME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="muted">Daily Rewards</span>
                      <span className="font-medium" style={{color: 'hsl(142, 76%, 70%)'}}>+12.5 MEME</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div className="h-2 rounded-full bg-gradient-to-r from-primary to-purple-400" style={{width: '65%'}}></div>
                    </div>
                    <Button className="w-full" data-testid="button-claim-rewards">Claim Rewards</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Section */}
      <section id="kpi-section" className="section-padding crypto-bg" data-testid="section-kpi">
        <div className="container">
          <div className="cols-4">
            <div className="kpi" data-testid="kpi-raised">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">${counters.raised.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Raised</div>
            </div>
            <div className="kpi" data-testid="kpi-members">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{counters.members.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="kpi" data-testid="kpi-audited">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{counters.audited}</div>
              <div className="text-sm text-muted-foreground">Contracts Audited</div>
            </div>
            <div className="kpi" data-testid="kpi-stakers">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{counters.stakers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Active Stakers</div>
            </div>
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

      {/* Testimonials Section */}
      <section className="section-padding" data-testid="section-testimonials">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied stakers earning daily rewards
            </p>
          </div>
          
          <div className="carousel-container">
            <div 
              className="carousel-track"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`
              }}
              data-testid="carousel-testimonials"
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="carousel-slide px-3" data-testid={`slide-testimonial-${index}`}>
                  <Card className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-foreground font-bold">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "{testimonial.content}"
                    </p>
                  </Card>
                </div>
              ))}
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
              <Button asChild data-testid="button-get-in-touch">
                <a href="#contact">Get in Touch</a>
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

      {/* Contact Section */}
      <section id="contact" className="section-padding" data-testid="section-contact">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleContactSubmit} className="space-y-6" data-testid="form-contact">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({...prev, name: e.target.value}))}
                  data-testid="input-contact-name"
                />
                {formErrors.name && (
                  <div className="text-destructive text-sm mt-1" data-testid="error-contact-name">{formErrors.name}</div>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({...prev, email: e.target.value}))}
                  data-testid="input-contact-email"
                />
                {formErrors.email && (
                  <div className="text-destructive text-sm mt-1" data-testid="error-contact-email">{formErrors.email}</div>
                )}
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({...prev, message: e.target.value}))}
                  data-testid="input-contact-message"
                />
                {formErrors.message && (
                  <div className="text-destructive text-sm mt-1" data-testid="error-contact-message">{formErrors.message}</div>
                )}
              </div>
              
              <Button type="submit" className="w-full" data-testid="button-send-message">
                Send Message
              </Button>
            </form>
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
      <footer className="bg-secondary py-12" data-testid="footer">
        <div className="container">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">₿</span>
              </div>
              <span className="text-xl font-bold text-white">MemeStake</span>
            </div>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} MemeStake. All rights reserved.
            </p>
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
