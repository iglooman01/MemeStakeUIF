import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FaTwitter, FaTelegram, FaYoutube } from "react-icons/fa";
import { connectWallet, supportedWallets } from "../config/web3Config";
import memeStakeLogo from "@assets/ChatGPT Image Oct 9, 2025, 11_08_34 AM_1759988345567.png";
import heroBackground from "@assets/6284998693224123196_1759928362887.jpg";
import { LiveJoinNotification } from "@/components/LiveJoinNotification";

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
  },
  fr: {
    features: 'Fonctionnalités',
    pricing: 'Tarifs',
    blog: 'Blog',
    about: 'À propos',
    contact: 'Contact',
    whitepaper: 'Livre Blanc',
    getStarted: 'Connecter Portefeuille',
    why: 'Pourquoi'
  },
  de: {
    features: 'Funktionen',
    pricing: 'Preise',
    blog: 'Blog',
    about: 'Über uns',
    contact: 'Kontakt',
    whitepaper: 'Whitepaper',
    getStarted: 'Wallet Verbinden',
    why: 'Warum'
  },
  ja: {
    features: '機能',
    pricing: '価格',
    blog: 'ブログ',
    about: '概要',
    contact: 'お問い合わせ',
    whitepaper: 'ホワイトペーパー',
    getStarted: 'ウォレット接続',
    why: 'なぜ'
  },
  ko: {
    features: '기능',
    pricing: '가격',
    blog: '블로그',
    about: '소개',
    contact: '문의',
    whitepaper: '백서',
    getStarted: '지갑 연결',
    why: '왜'
  },
  zh: {
    features: '功能',
    pricing: '价格',
    blog: '博客',
    about: '关于',
    contact: '联系',
    whitepaper: '白皮书',
    getStarted: '连接钱包',
    why: '为什么'
  },
  pt: {
    features: 'Recursos',
    pricing: 'Preços',
    blog: 'Blog',
    about: 'Sobre',
    contact: 'Contato',
    whitepaper: 'Whitepaper',
    getStarted: 'Conectar Carteira',
    why: 'Por que'
  },
  ru: {
    features: 'Функции',
    pricing: 'Цены',
    blog: 'Блог',
    about: 'О нас',
    contact: 'Контакты',
    whitepaper: 'Белая книга',
    getStarted: 'Подключить Кошелек',
    why: 'Почему'
  },
  ar: {
    features: 'الميزات',
    pricing: 'التسعير',
    blog: 'المدونة',
    about: 'حولنا',
    contact: 'اتصل بنا',
    whitepaper: 'الورقة البيضاء',
    getStarted: 'ربط المحفظة',
    why: 'لماذا'
  },
  it: {
    features: 'Caratteristiche',
    pricing: 'Prezzi',
    blog: 'Blog',
    about: 'Chi siamo',
    contact: 'Contatti',
    whitepaper: 'Whitepaper',
    getStarted: 'Connetti Wallet',
    why: 'Perché'
  }
};

export default function Home() {
  const [location, setLocation] = useLocation();
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [counters, setCounters] = useState({ raised: 0, members: 0, audited: 0, stakers: 0 });
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [airdropTime, setAirdropTime] = useState({ days: 30, hours: 12, minutes: 0, seconds: 4 });
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [verifiedParticipants, setVerifiedParticipants] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [connectedWalletType, setConnectedWalletType] = useState<string>('');
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [cryptoNews, setCryptoNews] = useState<any[]>([]);
  const [showNewsSection, setShowNewsSection] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const { toast } = useToast();
  
  // Check for existing wallet connection on component mount
  useEffect(() => {
    const savedWalletConnected = localStorage.getItem('walletConnected');
    const savedWalletAddress = localStorage.getItem('walletAddress');
    const savedWalletType = localStorage.getItem('walletType');
    
    if (savedWalletConnected === 'true' && savedWalletAddress && savedWalletType) {
      setWalletConnected(true);
      setWalletAddress(savedWalletAddress);
      setConnectedWalletType(savedWalletType);
    }
  }, []);
  
  const testimonials = [
    {
      name: "Alex Chen",
      role: "DeFi Enthusiast", 
      content: "memes is the first meme token I actually trust. The transparent tokenomics and audited contracts give me confidence to stake long-term."
    },
    {
      name: "Sarah Williams",
      role: "Crypto Investor",
      content: "The daily rewards are amazing! I've been earning 1% daily (365% APY) consistently. Plus the referral system is incredible!"
    },
    {
      name: "Mike Rodriguez", 
      role: "Community Member",
      content: "The community is incredible. Great vibes, helpful members, and the team is always engaging with us. Plus the memes are fire! 🔥"
    }
  ];

  const faqItems = [
    {
      question: "What is memes?",
      answer: "memes is a stake-to-earn meme token project with audited contracts, transparent tokenomics, and community rewards."
    },
    {
      question: "How does the public sale work?", 
      answer: "Public sale offers 25 billion $MEMES tokens at $0.0001 each. Minimum purchase is $50, no maximum limit. Sale runs alongside the airdrop campaign. Connect your BSC wallet to participate!"
    },
    {
      question: "Why choose memes over other meme coins?",
      answer: "Audited & public contracts, stake-to-earn mechanics (discourages dumping), real utility pools, and on-chain community rewards."
    },
    {
      question: "Is the smart contract audited?",
      answer: "Yes. The contracts are audited and the reports will be linked from our whitepaper and website once the final review is complete."
    },
    {
      question: "What chain is memes on?",
      answer: "$MEMES token is on Binance Smart Chain (BSC / BEP-20) for low fees and fast transactions. Make sure your wallet is connected to BSC network before purchasing!"
    },
    {
      question: "How do staking rewards work?", 
      answer: "Stake $MEMES tokens to earn 365% APY (1% daily rewards). Staking program coming soon! Plus, earn referral bonuses at 3 levels: Level 1 - 1,00,000 $MEMES, Level 2 - 1,00,000 $MEMES, Level 3 - 1,00,000 $MEMES tokens distributed across your referral network."
    },
    {
      question: "How does the referral system work?",
      answer: "Earn passive income through our 3-level referral system! Level 1 - 1,00,000 $MEMES, Level 2 - 1,00,000 $MEMES, Level 3 - 1,00,000 $MEMES tokens will be distributed across your three referral levels. Total referral pool is 5 billion $MEMES (10% of supply)."
    },
    {
      question: "What are the purchase limits?",
      answer: "Minimum purchase is $50. There is NO maximum limit! At $0.0001 per token, $100 gets you 1,000,000 $MEMES tokens. All purchases are on BSC (BEP-20) network."
    },
    {
      question: "What is the total supply and token price?",
      answer: "Total supply is 1 trillion $MEMES tokens. Public sale offers 500 billion tokens (50% of supply) at $0.0001 per token. The raise target is $50,000,000 if all tokens are sold."
    }
  ];

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
      description: "Welcome to the memes community!",
    });
    setNewsletterEmail('');
  };

  const selectPlan = (plan: string) => {
    toast({
      title: `Selected plan: ${plan}`,
      description: "Redirecting to purchase...",
    });
  };

  // Play beep sound function
  const playSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Higher frequency for a cleaner beep
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Fallback for browsers that don't support Web Audio API
      console.log('Audio not supported');
    }
  };

  const playPeacefulChime = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create an extremely gentle, whisper-soft meditative chime
      const createChimeNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine'; // Softest possible wave
        
        // Whisper-quiet volume for ultimate peace
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.002, startTime + 0.05); // Even lower, slower fade-in
        gainNode.gain.exponentialRampToValueAtTime(0.00005, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Create very slow, meditative sequence with deeper tones
      const now = audioContext.currentTime;
      createChimeNote(329.63, now, 2.0); // E4 (deep, calming base)
      createChimeNote(392.00, now + 0.6, 1.8); // G4 (gentle rise)
      createChimeNote(523.25, now + 1.2, 1.5); // C5 (soft peak)
      
    } catch (e) {
      console.log('Audio not supported');
    }
  };


  // Wallet connection functions
  const handleWalletSelect = async (walletName: string) => {
    setSelectedWallet(walletName);
    setIsConnecting(true); // Show loader
    
    // Find the wallet connector type
    const wallet = supportedWallets.find(w => w.name === walletName);
    if (!wallet) {
      toast({
        title: "❌ Wallet Not Supported",
        description: `${walletName} is not supported`,
        variant: "destructive"
      });
      setIsConnecting(false);
      return;
    }

    // Set timeout to prevent indefinite hanging
    const connectionTimeout = setTimeout(() => {
      setIsConnecting(false);
      setSelectedWallet('');
      toast({
        title: "⏱️ Connection Timeout",
        description: "Wallet connection took too long. Please try again and approve the request quickly.",
        variant: "destructive"
      });
    }, 30000); // 30 second timeout

    try {
      // Show notification to user about popup
      toast({
        title: "🦊 MetaMask Popup Opening",
        description: "Please check for the MetaMask popup and click 'Connect' to approve",
      });
      
      // Connect to the selected wallet
      const result = await connectWallet(wallet.connector);
      
      // Clear timeout if connection completes
      clearTimeout(connectionTimeout);
      
      if (result.success && result.address) {
        // Store wallet info
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', result.address);
        localStorage.setItem('walletType', walletName);
        sessionStorage.setItem('walletSession', 'active'); // Mark active session
        
        // Update state
        setWalletConnected(true);
        setWalletAddress(result.address);
        setConnectedWalletType(walletName);
        
        setWalletModalOpen(false);
        
        // Check network and prompt to switch if needed
        try {
          const BSC_TESTNET_CHAIN_ID = '0x61'; // 97 in hex
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          
          if (chainId !== BSC_TESTNET_CHAIN_ID) {
            // Wrong network - ask user to switch
            toast({
              title: "⚠️ Wrong Network",
              description: "Please switch to BSC Testnet to continue",
              variant: "destructive"
            });
            
            try {
              // Try to switch network
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: BSC_TESTNET_CHAIN_ID }],
              });
              
              toast({
                title: "✅ Network Switched",
                description: "Successfully switched to BSC Testnet. Redirecting...",
              });
              
              setIsConnecting(false);
              setTimeout(() => {
                setLocation('/dashboard');
              }, 300);
            } catch (switchError: any) {
              // If network not added, add it
              if (switchError.code === 4902) {
                try {
                  await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: BSC_TESTNET_CHAIN_ID,
                      chainName: 'BNB Smart Chain Testnet',
                      nativeCurrency: {
                        name: 'BNB',
                        symbol: 'tBNB',
                        decimals: 18,
                      },
                      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                      blockExplorerUrls: ['https://testnet.bscscan.com/'],
                    }],
                  });
                  
                  toast({
                    title: "✅ Network Added",
                    description: "BSC Testnet added successfully. Redirecting...",
                  });
                  
                  setIsConnecting(false);
                  setTimeout(() => {
                    setLocation('/dashboard');
                  }, 300);
                } catch (addError) {
                  toast({
                    title: "❌ Network Setup Failed",
                    description: "Please manually switch to BSC Testnet in your wallet",
                    variant: "destructive"
                  });
                  setIsConnecting(false);
                  setLocation('/dashboard'); // Still redirect, network warning will show there
                }
              } else {
                // User rejected or other error
                toast({
                  title: "⚠️ Network Switch Required",
                  description: "Please manually switch to BSC Testnet to use the app",
                });
                setIsConnecting(false);
                setLocation('/dashboard'); // Still redirect, network warning will show there
              }
            }
          } else {
            // Correct network - proceed
            toast({
              title: "✅ Wallet Connected!",
              description: `Connected with ${walletName}. Redirecting to dashboard...`,
            });
            
            setIsConnecting(false);
            setTimeout(() => {
              setLocation('/dashboard');
            }, 300);
          }
        } catch (networkError) {
          console.error('Network check error:', networkError);
          // Proceed anyway, network check will happen on dashboard
          toast({
            title: "✅ Wallet Connected!",
            description: `Connected with ${walletName}. Redirecting to dashboard...`,
          });
          
          setIsConnecting(false);
          setTimeout(() => {
            setLocation('/dashboard');
          }, 300);
        }
      } else {
        // Handle specific errors
        let errorTitle = "❌ Connection Failed";
        let errorDescription = result.error || `Failed to connect to ${walletName}`;
        
        if (result.error?.includes('not installed') || result.error?.includes('not found')) {
          errorTitle = "⚠️ Wallet Not Found";
          errorDescription = `${walletName} is not installed. Please install the ${walletName} browser extension first.`;
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive"
        });
        setSelectedWallet('');
        setIsConnecting(false);
      }
    } catch (error: any) {
      // Clear timeout on error
      clearTimeout(connectionTimeout);
      
      console.error('Wallet connection error:', error);
      
      let errorTitle = "❌ Connection Error";
      let errorDescription = error.message || `Error connecting to ${walletName}`;
      
      // Handle user rejection (error code 4001)
      if (error.code === 4001) {
        errorTitle = "🚫 Connection Rejected";
        errorDescription = `You clicked "Cancel" or "Reject" in the ${walletName} popup. Please try again and click "Connect" or "Next" to approve the connection.`;
      } else if (error.code === -32002) {
        errorTitle = "⏳ Request Already Pending";
        errorDescription = "A wallet connection request is already open. Please check for the MetaMask popup window (it might be behind other windows) and approve it.";
      } else if (error.code === -32603) {
        errorTitle = "⚠️ MetaMask Locked";
        errorDescription = "Please unlock your MetaMask wallet first, then try connecting again.";
      } else if (!window.ethereum) {
        errorTitle = "⚠️ No Wallet Detected";
        errorDescription = "Please install MetaMask, Trust Wallet, or SafePal browser extension to connect.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
      setSelectedWallet('');
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const handleDisconnectWallet = () => {
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    
    // Reset state
    setWalletConnected(false);
    setWalletAddress('');
    setConnectedWalletType('');
    setSelectedWallet('');
    
    toast({
      title: "👋 Wallet Disconnected",
      description: "You have been disconnected from your wallet",
    });
    
    // Redirect to home page
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  // Staking launch notification
  const handleStakingClick = () => {
    if (!walletConnected) {
      toast({
        title: "⚠️ Connect Wallet First",
        description: "Please connect your wallet to access the staking page.",
        variant: "destructive"
      });
      return;
    }
    window.location.href = '/staking';
  };

  const walletOptions = supportedWallets;

  // Fetch participant stats from database API
  useEffect(() => {
    const fetchParticipantStats = async () => {
      try {
        const response = await fetch('/api/airdrop/stats');
        const data = await response.json();
        
        if (response.ok) {
          setTotalParticipants(data.totalParticipants || 0);
          setVerifiedParticipants(data.verifiedParticipants || 0);
        }
      } catch (error) {
        console.error('Error fetching participant stats:', error);
      }
    };

    fetchParticipantStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchParticipantStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for specific date: October 27, 2025 at 09:30:30
  useEffect(() => {
    const calculateTimeRemaining = () => {
      // Target date: October 27, 2025 at 09:30:30
      const targetDate = new Date('2026-01-08T09:30:30');
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setAirdropTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setAirdropTime({ days, hours, minutes, seconds });
    };
    
    // Calculate immediately
    calculateTimeRemaining();
    
    // Update every second
    const timer = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = i18n[language as keyof typeof i18n] || i18n.en;

  return (
    <div className="bg-background text-foreground">
      {/* Live Join Notifications */}
      <LiveJoinNotification />
      
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-md border-b z-30" style={{background: 'rgba(15, 20, 35, 0.95)', borderColor: 'rgba(255, 215, 0, 0.15)', backdropFilter: 'blur(20px)'}} data-testid="header-navigation">
        <nav className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" data-testid="logo-brand" onClick={() => window.location.href = '/'}>
              <img 
                src={memeStakeLogo} 
                alt="MEMES STAKE Logo" 
                className="w-16 h-16 rounded-lg shadow-lg"
                style={{
                  filter: 'drop-shadow(0 4px 15px rgba(255, 215, 0, 0.3))'
                }}
              />
              <span className="text-xl font-bold" style={{fontFamily: 'Space Grotesk, Inter, sans-serif', fontWeight: '700', color: '#ffd700'}}>MEMES STAKE</span>
            </div>

            {/* Desktop Navigation - Multiple Links */}
            <div className="hidden md:flex items-center justify-center flex-1 space-x-8" data-testid="desktop-nav">
              <a href="#about" className="nav-link text-gray-300 hover:text-white transition-all duration-200" style={{fontFamily: 'Inter, sans-serif', fontWeight: '500'}} data-testid="link-about">{t.about}</a>
              <a href="/whitepaper" className="nav-link text-gray-300 hover:text-white transition-all duration-200" style={{fontFamily: 'Inter, sans-serif', fontWeight: '500'}} data-testid="link-whitepaper">{t.whitepaper}</a>
              <a href="#tokenomics" className="nav-link text-gray-300 hover:text-white transition-all duration-200" style={{fontFamily: 'Inter, sans-serif', fontWeight: '500'}} data-testid="link-tokenomics">Tokenomics</a>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Language Selector */}
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-16 h-8 text-sm border" style={{background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 215, 0, 0.2)', color: 'white', fontFamily: 'Inter, sans-serif'}} data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{background: 'rgba(15, 20, 35, 0.98)', borderColor: 'rgba(255, 215, 0, 0.2)', backdropFilter: 'blur(20px)'}}>
                  <SelectItem value="en" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇺🇸 EN</SelectItem>
                  <SelectItem value="hi" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇮🇳 हिं</SelectItem>
                  <SelectItem value="es" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇪🇸 ES</SelectItem>
                  <SelectItem value="fr" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇫🇷 FR</SelectItem>
                  <SelectItem value="de" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇩🇪 DE</SelectItem>
                  <SelectItem value="ja" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇯🇵 JP</SelectItem>
                  <SelectItem value="ko" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇰🇷 KO</SelectItem>
                  <SelectItem value="zh" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇨🇳 中文</SelectItem>
                  <SelectItem value="pt" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇵🇹 PT</SelectItem>
                  <SelectItem value="ru" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇷🇺 RU</SelectItem>
                  <SelectItem value="ar" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇸🇦 عرب</SelectItem>
                  <SelectItem value="it" style={{color: 'white', fontFamily: 'Inter, sans-serif'}}>🇮🇹 IT</SelectItem>
                </SelectContent>
              </Select>

              {/* Telegram Link */}
              <a
                href="https://t.me/memestakegroup"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 h-8 w-8 border rounded-md flex items-center justify-center transition-all hover:scale-110"
                style={{background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 215, 0, 0.2)', color: '#ffd700'}}
                data-testid="link-telegram"
              >
                <FaTelegram className="text-lg" />
              </a>

              

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

      {/* Airdrop Notification Banner */}
     {/* <div className="w-full py-2 px-4 text-center" style={{background: '#000000', borderBottom: '1px solid rgba(255, 215, 0, 0.2)'}} data-testid="airdrop-notification">
        <p className="text-xs sm:text-sm text-white/80">
          🎁 <span style={{color: '#ffd700'}}>Limited Airdrop:</span> Connect your wallet now to claim free $MEMES tokens • Staking rewards 365% APY (1% daily)
        </p>
      </div> */}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu active" data-testid="mobile-menu">
          <div className="p-6">
            <div className="flex flex-col space-y-6 mt-16">
              <a href="#about" className="text-xl font-medium text-white hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-link-about">{t.about}</a>
              {walletConnected ? (
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">{connectedWalletType}</p>
                    <p className="text-sm text-white font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  </div>
                  <Button 
                    onClick={handleDisconnectWallet}
                    variant="outline"
                    className="text-sm px-4 py-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                      color: 'white'
                    }}
                    data-testid="mobile-button-disconnect-wallet"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <Button 
                  className="mt-4" 
                  onClick={() => setWalletModalOpen(true)}
                  style={{
                    background: '#ffd700',
                    color: '#0a0e1a',
                    fontWeight: '600',
                    fontFamily: 'Space Grotesk, sans-serif',
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}
                  data-testid="mobile-button-get-started"
                >
                  {t.getStarted}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section 
        id="home" 
        className="min-h-screen hero-section flex items-center justify-center relative" 
        data-testid="section-hero"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #0a0e1a 50%, #000000 100%)'
        }}
      >
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-5xl font-bold mb-6 sm:mb-8 leading-tight px-4" style={{fontFamily: 'Space Grotesk, Inter, sans-serif', fontWeight: '800'}} data-testid="text-hero-headline">
              Worlds First AI Driven $Meme Staking Platform Launching In
            </h2>

            {/* Attractive One-Line Countdown */}
            <div className="flex items-center justify-center mb-8">
              <div className="glass-card px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 glow-effect" 
                   style={{
                     background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
                     border: '2px solid rgba(255, 215, 0, 0.3)',
                     boxShadow: '0 0 30px rgba(255, 215, 0, 0.2), 0 0 60px rgba(0, 191, 255, 0.1)'
                   }}>
                <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 text-center">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" 
                          style={{color: '#ffd700'}}>
                      {String(airdropTime.days).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-medium" style={{color: '#ffd700'}}>DAYS</span>
                  </div>

                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-pulse" style={{color: '#ffd700'}}>:</div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
                          style={{color: '#ffd700'}}>
                      {String(airdropTime.hours).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-medium" style={{color: '#ffd700'}}>HRS</span>
                  </div>

                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-pulse" style={{color: '#ffd700'}}>:</div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
                          style={{color: '#ffd700'}}>
                      {String(airdropTime.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-medium" style={{color: '#ffd700'}}>MIN</span>
                  </div>

                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl animate-pulse" style={{color: '#ffd700'}}>:</div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold"
                          style={{color: '#ffd700'}}>
                      {String(airdropTime.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base font-medium" style={{color: '#ffd700'}}>S</span>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-4xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent" style={{fontFamily: 'Space Grotesk, Inter, sans-serif'}}>Connect Wallet To Claim Free 1,00,000 $MEMES Tokens</h3>
            {/*<p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-4" style={{fontFamily: 'Inter, sans-serif'}} data-testid="text-hero-subtitle">
              <span style={{color: '#ffd700', fontWeight: '700'}}>From LOLs to APYs</span>
            </p> */}            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              {/* Connect Wallet / Wallet Info - Top Right Corner */}
              {walletConnected ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400">{connectedWalletType}</span>
                    <span className="text-sm text-white font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                  <Button 
                    onClick={handleDisconnectWallet}
                    size="sm"
                    variant="outline"
                    className="text-xs px-3 py-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                      color: 'white'
                    }}
                    data-testid="button-disconnect-wallet"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setWalletModalOpen(true)}
                  className="px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: '#ffd700',
                    color: '#0a0e1a',
                    fontWeight: '600',
                    fontFamily: 'Space Grotesk, sans-serif',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'
                  }}
                  data-testid="button-get-started"
                >
                  {t.getStarted}
                </Button>
              )}
              {/* <Button 
                size="lg" 
                className="text-lg px-8 py-4" 
                onClick={handleStakingClick}
                style={{
                  background: '#ffd700',
                  color: '#0a0e1a',
                  fontWeight: '600',
                  fontFamily: 'Space Grotesk, sans-serif',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
                data-testid="button-start-staking"
              >
                🚀 Start Staking
              </Button> */}
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4" data-testid="button-learn-more">
                <a href="#faq">📄 Learn More</a>
              </Button>
            </div>

            {/* Live Stats - Moved to Hero */}
            <div className="mt-12">
              <div className="flex items-center justify-center mb-4">
                <div className="w-3 h-3 rounded-full mr-2" style={{background: '#00ff88', animation: 'pulse 1s infinite'}}></div>
                <span className="text-sm font-medium" style={{color: '#ffd700'}}>🔴 LIVE DATA</span>
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                {/* Total Participants */}
                <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden" 
                     style={{
                       background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
                       border: '2px solid rgba(255, 215, 0, 0.3)',
                       boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)'
                     }}>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2" 
                         style={{color: '#ffd700'}}>
                      {totalParticipants.toLocaleString()}
                    </div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1">🏆 Total Participants</div>
                    <div className="text-xs sm:text-sm" style={{color: '#00ff88'}}>📊 Connected Wallets</div>
                  </div>
                </div>
                
                {/* Verified Users */}
                <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 relative overflow-hidden" 
                     style={{
                       background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)',
                       border: '2px solid rgba(0, 255, 136, 0.3)',
                       boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)'
                     }}>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2" 
                         style={{color: '#00ff88'}}>
                      {verifiedParticipants.toLocaleString()}
                    </div>
                    <div className="text-sm sm:text-base md:text-lg font-semibold text-white mb-1">✅ Verified Users</div>
                    <div className="text-xs sm:text-sm" style={{color: '#00bfff'}}>📧 Email Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect Wallet Section */}
      <section className="py-16 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0a0015 0%, #1a0a2e 50%, #0a0015 100%)'}} data-testid="section-airdrop">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          {/* Section Title */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full animate-pulse" style={{
                background: 'linear-gradient(90deg, rgba(255,215,0,0.2), rgba(0,191,255,0.2), rgba(255,215,0,0.2))',
                border: '1px solid rgba(255,215,0,0.3)'
              }}>
                <span className="text-2xl">🎁</span>
                <span className="text-sm font-bold" style={{color: '#ffd700'}}>EXCLUSIVE AIRDROP</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent" style={{fontFamily: 'Space Grotesk, Inter, sans-serif'}}>
              Connect Your Wallet & Get Airdrop
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join thousands of holders and claim your share of <span className="font-bold" style={{color: '#ffd700'}}>1,00,000 $MEMES</span> tokens!
            </p>
          </div>

          <div className="text-center">
            <Card className="p-8 md:p-12 max-w-5xl mx-auto relative overflow-hidden" style={{
              background: 'linear-gradient(135deg, rgba(138,43,226,0.15) 0%, rgba(0,191,255,0.15) 50%, rgba(255,215,0,0.15) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.4)',
              boxShadow: '0 0 80px rgba(255, 215, 0, 0.3), 0 0 40px rgba(0, 191, 255, 0.2), inset 0 0 60px rgba(255, 215, 0, 0.1)'
            }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-500/10 to-yellow-500/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="chip gold">🎁 AIRDROP</div>
                  <div className="chip" style={{background: 'rgba(0, 191, 255, 0.2)', border: '1px solid rgba(0, 191, 255, 0.4)'}}>🔥 EXCLUSIVE</div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{color: '#ffd700', fontFamily: 'Space Grotesk, Inter, sans-serif'}}>
                  Connect Your Wallet & Get Airdrop
                </h3>
                <p className="text-base md:text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Get ready for the biggest meme token airdrop of 2025! Early participants get exclusive bonuses.
                </p>
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-8 max-w-3xl mx-auto border border-primary/20">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl mr-2">⏰</span>
                    <span className="text-base sm:text-lg font-semibold" style={{color: '#ffd700'}}>LAUNCH TIMELINE</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                      <div className="font-semibold" style={{color: '#ffd700'}}>Airdrop Is Live</div>
                      <div className="text-muted-foreground">Distribution of 100 Billion $MEMES Tokens</div>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                      <div className="font-semibold" style={{color: '#ffd700'}}>Staking Program</div>
                      <div className="text-muted-foreground">Coming soon!</div>
                    </div>
                  </div>
                </div>
                
               
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  {walletConnected ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-2">Connected with {connectedWalletType}</p>
                        <p className="text-lg text-white font-mono bg-black/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                          {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                        </p>
                      </div>
                      <Button 
                        onClick={handleDisconnectWallet}
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-4"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 215, 0, 0.5)',
                          color: 'white'
                        }}
                        data-testid="button-hero-disconnect-wallet"
                      >
                        Disconnect Wallet
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-4" 
                      onClick={() => setLocation('/dashboard')}
                      style={{
                        background: '#ffd700',
                        color: '#0a0e1a',
                        fontWeight: '600',
                        fontFamily: 'Space Grotesk, sans-serif',
                        border: '1px solid rgba(255, 215, 0, 0.3)'
                      }}
                      data-testid="button-claim-airdrop"
                    >
                      🎁 Join Airdrop
                    </Button>
                  )}
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4" data-testid="button-airdrop-rules">
                    <a href="#faq">📄 Eligibility Rules</a>
                  </Button>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
                    <span className="text-lg">💎</span>
                    <span className="text-sm font-medium" style={{color: '#ffd700'}}>Staking rewards 365% APY (1% daily) - Coming soon!</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Staking Dashboard */}
      {/*<section id="staking-dashboard" className="section-padding" data-testid="section-staking-dashboard">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4">Your Staking Dashboard</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Track your meme token portfolio and maximize your passive income
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            
          </div>
        </div>
      </section>*/}


      {/* Tokenomics Section */}
      <section id="tokenomics" className="py-12" data-testid="section-tokenomics">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 px-4" style={{color: '#ffd700', fontFamily: 'Space Grotesk, Inter, sans-serif'}}>Tokenomics</h2>
            <p className="text-sm sm:text-base text-muted-foreground px-4">Fair and transparent token distribution</p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full" style={{background: '#ffd700'}}>
                <span className="text-2xl font-bold text-black">1T</span>
              </div>
              <div className="text-lg sm:text-xl font-semibold mt-3">Total Supply: 1,000,000,000,000 $MEMES</div>
              {/*<div className="text-sm text-muted-foreground mt-2">Sale Price: $0.0001 per $MEMES</div>*/}
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-8">
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                <div className="text-2xl mb-2">🚀</div>
                <div className="text-base font-semibold" style={{color: '#ffd700'}}>Public Sale - 50%</div>
                <div className="text-sm text-muted-foreground">500B tokens available</div>
                <div className="text-xs text-cyan-400 mt-1">Target: $50,000,000</div>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
                <div className="text-2xl mb-2">💎</div>
                <div className="text-base font-semibold" style={{color: '#ffd700'}}>Staking Rewards</div>
                <div className="text-sm text-muted-foreground">365% APY (1% daily)</div>
                <div className="text-xs text-cyan-400 mt-1">Coming soon!</div>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(255, 105, 180, 0.1)', border: '1px solid rgba(255, 105, 180, 0.3)'}}>
                <div className="text-2xl mb-2">🎁</div>
                <div className="text-base font-semibold" style={{color: '#ffd700'}}>Referral Pool - 10%</div>
                <div className="text-sm text-muted-foreground">100B tokens</div>
                <div className="text-xs text-cyan-400 mt-1">3-level system</div>
              </div>
              
              <div className="text-center p-4 rounded-lg" style={{background: 'rgba(128, 128, 128, 0.1)', border: '1px solid rgba(128, 128, 128, 0.3)'}}>
                <div className="text-2xl mb-2">👥</div>
                <div className="text-base font-semibold" style={{color: '#ffd700'}}>Team & Marketing</div>
                <div className="text-sm text-muted-foreground">Remaining allocation</div>
                <div className="text-xs text-cyan-400 mt-1">With vesting schedule</div>
              </div>
            </div>

            {/* Purchase Info */}
            <div className="grid md:grid-cols-1 gap-4 px-4">
              {/*<div className="p-4 rounded-lg bg-black/30 border border-yellow-500/30">
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2" style={{color: '#ffd700'}}>💰 Purchase Limits</div>
                  <div className="space-y-2 text-sm">
                    <div>Minimum: <span className="text-white font-bold">$50</span></div>
                    <div>Maximum: <span className="text-white font-bold">No Limit</span></div>
                    <div className="text-cyan-400 font-mono">$100 = 1,000,000 $MEMES</div>
                  </div>
                </div>
              </div>*/}
              <div className="p-4 rounded-lg bg-black/30 border border-cyan-500/30">
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2" style={{color: '#ffd700'}}>📊 Tokenomics</div>
                  <div className="space-y-2 text-sm">
                    {/*<div>Price: <span className="text-white font-bold">$0.0001</span></div>*/}
                    <div>Network: <span className="text-white font-bold">BSC (BEP-20)</span></div>
                    <div className="text-cyan-400">Fully audited contract</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section id="faq" className="section-padding crypto-bg" data-testid="section-faq">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4" style={{color: '#ffd700', fontFamily: 'Space Grotesk, Inter, sans-serif'}}>Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about memes
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto px-4">
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
                  <a href="https://t.me/memstakeofficial" target="_blank" rel="noopener noreferrer">💬 Contact Support</a>
                </Button>
              </Card>
              
              <details className="panel" data-testid="faq-tokenomics-details">
                <summary className="font-medium cursor-pointer flex items-center justify-between">
                  What are the tokenomics?
                  <span className="text-primary text-xl">+</span>
                </summary>
                <p className="text-sm text-muted-foreground mt-3">
                  Total supply: 1 trillion $MEMES. Public sale: 50% (500B tokens at $0.0001 each). Staking rewards: 365% APY (1% daily). Referral pool: 10% (100B tokens) with 3-level structure. All details are in the Tokenomics section and whitepaper.
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
          <div className="grid lg:grid-cols-2 items-center gap-8 lg:gap-12 px-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">About $memes</h2>
              <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{color: '#ffd700'}}>Our Mission</h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-8">
                $memes is revolutionizing the meme coin ecosystem by combining decentralized airdrops with innovative staking mechanisms. We deliver tokens direct in your wallet while building the strongest $meme community in crypto.
              </p>
              <Button asChild data-testid="button-learn-about">
                <a href="#about">Learn About Us</a>
              </Button>
            </div>
            
            <Card className="p-6" style={{background: 'white'}} data-testid="card-smart-contract">
              <h3 className="font-semibold mb-4 text-black">Smart Contract Preview</h3>
              <div className="rounded p-4 font-mono text-sm overflow-x-auto" style={{background: 'white', border: '1px solid #e5e7eb'}}>
                <div className="text-green-600">// memes Contract</div>
                <div className="text-black">contract MemesEverywhere {'{'}</div>
                <div className="text-black">&nbsp;&nbsp;uint256 public totalSupply = 1e12; // 1 Trillion</div>
                <div className="text-black">&nbsp;&nbsp;uint256 public stakingRewards; // 365% APY</div>
                <div className="text-black">&nbsp;&nbsp;mapping(address =&gt; uint256) stakes;</div>
                <div className="text-black">&nbsp;&nbsp;</div>
                <div className="text-black">&nbsp;&nbsp;function stake(uint256 amount) {'{'}</div>
                <div className="text-green-600">&nbsp;&nbsp;&nbsp;&nbsp;// Audited staking logic</div>
                <div className="text-black">&nbsp;&nbsp;{'}'}</div>
                <div className="text-black">{'}'}</div>
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
              Comprehensive documentation covering memes's technology, tokenomics, and roadmap
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
                  Complete breakdown of $MEMES token distribution, sale pricing, and reward mechanisms.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 1T total supply at $0.0001/token</li>
                  <li>• 365% APY staking (1% daily)</li>
                  <li>• 3-level referral system (Level 1: 100K, Level 2: 100K, Level 3: 100K tokens)</li>
                  <li>• Public sale & airdrop details</li>
                  <li>• BSC network deployment</li>
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
                  <Button 
                    size="lg" 
                    data-testid="button-download-whitepaper"
                    onClick={() => {
                      // Open whitepaper page in new tab for PDF generation
                      window.open('/whitepaper', '_blank');
                    }}
                  >
                    📄 Download PDF
                  </Button>
                  <Button asChild variant="outline" size="lg" data-testid="button-view-online">
                    <a href="/whitepaper" className="inline-flex items-center">
                      🌐 View Online
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>



      {/* Newsletter Subscribe - Moved to end */}
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

      {/* Why $MEMES & Market News Section */}
      <section className="section-padding" style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(15,10,35,0.95) 100%)'}} data-testid="section-why-memes">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: '#ffd700'}}>
              🚀 Why $MEMES?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Join the revolution of community-driven meme tokens with real utility, high staking rewards, and an active ecosystem.
            </p>
            
            {/* Why Choose MEMES Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl" style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)'}}>
                <div className="text-3xl mb-2">💰</div>
                <div className="font-bold mb-1" style={{color: '#ffd700'}}>365% APY</div>
                <div className="text-xs text-gray-400">High-yield staking rewards</div>
              </div>
              <div className="p-4 rounded-xl" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.3)'}}>
                <div className="text-3xl mb-2">🎁</div>
                <div className="font-bold mb-1" style={{color: '#00bfff'}}>Free Airdrop</div>
                <div className="text-xs text-gray-400">100,000 $MEMES tokens</div>
              </div>
              <div className="p-4 rounded-xl" style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
                <div className="text-3xl mb-2">👥</div>
                <div className="font-bold mb-1" style={{color: '#00ff88'}}>Community</div>
                <div className="text-xs text-gray-400">3-level referral system</div>
              </div>
            </div>

            {/* Know More About Market Button */}
            <Button
              onClick={async () => {
                setIsLoadingNews(true);
                try {
                  const response = await fetch('/api/crypto-news');
                  const data = await response.json();
                  setCryptoNews(data.news || []);
                  setShowNewsSection(true);
                } catch (error) {
                  console.error('Failed to fetch news:', error);
                } finally {
                  setIsLoadingNews(false);
                }
              }}
              className="mb-6"
              style={{background: 'linear-gradient(135deg, #00bfff 0%, #0088cc 100%)', color: '#fff'}}
              disabled={isLoadingNews}
              data-testid="button-load-news"
            >
              {isLoadingNews ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Loading News...
                </>
              ) : (
                <>
                  📰 Know More About $MEMES Market
                </>
              )}
            </Button>

            {/* News Section - Only shows when button is clicked */}
            {showNewsSection && cryptoNews.length > 0 && (
              <div className="mt-8" data-testid="section-crypto-news">
                <h3 className="text-xl font-bold mb-4" style={{color: '#00bfff'}}>
                  📊 Latest Crypto Market News
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cryptoNews.map((article: any, index: number) => (
                    <a
                      key={article.id || index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl transition-all hover:scale-105 text-left"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                      data-testid={`news-article-${index}`}
                    >
                      {article.imageUrl && (
                        <div className="w-full h-32 rounded-lg mb-3 overflow-hidden">
                          <img 
                            src={article.imageUrl} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.cryptocompare.com/news/default/cryptocompare.png';
                            }}
                          />
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mb-1">{article.source}</div>
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2" style={{color: '#ffd700'}}>
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {article.body}
                      </p>
                      <div className="text-xs mt-2" style={{color: '#00bfff'}}>
                        Read more →
                      </div>
                    </a>
                  ))}
                </div>
                
                {/* Refresh News Button */}
                <Button
                  onClick={async () => {
                    setIsLoadingNews(true);
                    try {
                      const response = await fetch('/api/crypto-news');
                      const data = await response.json();
                      setCryptoNews(data.news || []);
                    } catch (error) {
                      console.error('Failed to fetch news:', error);
                    } finally {
                      setIsLoadingNews(false);
                    }
                  }}
                  variant="outline"
                  className="mt-6"
                  disabled={isLoadingNews}
                  data-testid="button-refresh-news"
                >
                  {isLoadingNews ? 'Refreshing...' : '🔄 Refresh News'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Wallet Connection Modal */}
      {walletModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setWalletModalOpen(false)}
          data-testid="modal-wallet-overlay"
        >
          <div 
            className="bg-gradient-to-br from-slate-900/95 to-indigo-900/95 rounded-2xl p-8 max-w-md w-full mx-auto backdrop-blur-xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.95) 0%, rgba(30, 15, 60, 0.95) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-wallet-content"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={memeStakeLogo} 
                  alt="memes Logo" 
                  className="w-8 h-8 rounded-lg"
                  style={{
                    filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.1))'
                  }}
                />
                <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
              </div>
              <button 
                onClick={() => setWalletModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                data-testid="button-close-modal"
              >
                <span className="text-white text-lg">×</span>
              </button>
            </div>

            {/* BNB Chain Badge */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium"
                   style={{background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', color: '#ffd700'}}>
                <span className="text-xs">⬡</span>
                <span>BNB Smart Chain (BEP20)</span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-center text-gray-300 mb-6 text-base">
              Select a BNB Smart Chain compatible wallet
            </p>

            {/* Connection Guide */}
            <div className="mb-6 p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1 text-sm text-gray-300">
                  <p className="font-medium mb-2 text-cyan-400">How to connect:</p>
                  <ol className="space-y-1 text-xs">
                    <li>1. Make sure your wallet extension is installed</li>
                    <li>2. Click on your preferred wallet below</li>
                    <li>3. Click <strong className="text-cyan-400">"Approve"</strong> in the popup that appears</li>
                    <li>4. If no popup appears, check your browser extensions</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Wallet Options */}
            <div className="grid gap-3 mb-6 relative">
              {isConnecting && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 mx-auto mb-3" style={{borderColor: '#ffd700'}}></div>
                    <p className="text-white font-medium">Connecting...</p>
                    <p className="text-gray-400 text-sm mt-1">Check your wallet extension</p>
                    <button
                      onClick={() => {
                        setIsConnecting(false);
                        setSelectedWallet('');
                      }}
                      className="mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700', border: '1px solid rgba(255, 215, 0, 0.3)'}}
                      data-testid="button-cancel-connection"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {walletOptions.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletSelect(wallet.name)}
                  disabled={isConnecting}
                  className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: selectedWallet === wallet.name 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    border: selectedWallet === wallet.name 
                      ? '1px solid #00bfff' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: selectedWallet === wallet.name 
                      ? '0 0 20px rgba(0, 191, 255, 0.2)' 
                      : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isConnecting) {
                      e.currentTarget.style.background = '#000000';
                      e.currentTarget.style.color = '#000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedWallet !== wallet.name) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  data-testid={`wallet-option-${wallet.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <span className="font-medium text-white group-hover:text-black transition-colors">
                      {wallet.name}
                    </span>
                  </div>
                  {selectedWallet === wallet.name && (
                    <span className="text-cyan-400">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/10 gap-2">
              <a href="#" className="hover:text-cyan-400 transition-colors" data-testid="link-help">
                Having trouble?
              </a>
              <span>More wallets via WalletConnect</span>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal (after wallet connection) */}
      {welcomeModalOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => setWelcomeModalOpen(false)}
          data-testid="modal-welcome-overlay"
        >
          <div 
            className="rounded-2xl p-8 max-w-lg w-full mx-auto backdrop-blur-xl border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 10, 35, 0.98) 0%, rgba(30, 15, 60, 0.98) 50%, rgba(15, 10, 35, 0.98) 100%)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 60px rgba(255, 215, 0, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-welcome-content"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full" 
                   style={{background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)'}}></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full" 
                   style={{background: 'radial-gradient(circle, rgba(0, 191, 255, 0.15) 0%, transparent 70%)'}}></div>
            </div>

            {/* Close button */}
            <button 
              onClick={() => setWelcomeModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10 hover:rotate-90"
              style={{background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}
              data-testid="button-close-welcome"
            >
              <span className="text-white text-xl font-bold">×</span>
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src={memeStakeLogo} 
                alt="memes Logo" 
                className="w-20 h-20 rounded-2xl animate-pulse"
                style={{
                  filter: 'drop-shadow(0 8px 20px rgba(255, 215, 0, 0.4))',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-6 relative z-10">
              <h2 className="text-3xl font-bold mb-3" style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🎉 Welcome to memes!
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                Your wallet is now connected
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm"
                   style={{background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)'}}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{background: '#00ff88'}}></div>
                <span className="font-mono text-sm" style={{color: '#00bfff'}}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="mb-6 p-5 rounded-xl relative z-10" 
                 style={{background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)'}}>
              <p className="text-center text-gray-300 text-base mb-4">
                For more information about <span className="font-bold" style={{color: '#ffd700'}}>$MEMES token</span>, 
                <span className="font-bold" style={{color: '#00bfff'}}> airdrop</span>, and 
                <span className="font-bold" style={{color: '#00ff88'}}> staking</span>, join our community!
              </p>

              {/* Telegram Button */}
              <a
                href="https://t.me/memestakegroup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-3 w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #0088cc 0%, #00aaff 100%)',
                  boxShadow: '0 4px 20px rgba(0, 136, 204, 0.4)'
                }}
                data-testid="link-telegram-join"
              >
                <FaTelegram className="text-2xl" />
                <span>Join Our Telegram Group</span>
              </a>
            </div>

            {/* Dashboard Button */}
            <button
              onClick={() => {
                setWelcomeModalOpen(false);
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 300);
              }}
              className="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                color: '#000',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.4)'
              }}
              data-testid="button-go-dashboard"
            >
              Go to Dashboard 🚀
            </button>
          </div>
        </div>
      )}

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

      {/* Footer */}
      <footer className="relative mt-20 py-12 border-t" style={{
        borderColor: 'rgba(255, 215, 0, 0.2)',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.9) 100%)'
      }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-8">
            {/* Logo & Brand */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <img 
                  src={memeStakeLogo} 
                  alt="memes Logo" 
                  className="w-12 h-12 rounded-full"
                  style={{boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'}}
                />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent">
                  $memes
                </h3>
              </div>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                The ultimate $meme token platform with staking, airdrops, and community rewards
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/memestakegroup"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(0, 136, 204, 0.2)',
                  border: '2px solid rgba(0, 136, 204, 0.3)'
                }}
                data-testid="footer-link-telegram"
              >
                <FaTelegram className="text-2xl transition-colors group-hover:text-[#0088cc]" style={{color: '#00bfff'}} />
              </a>

              <a
                href="https://x.com/memestake86"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(29, 161, 242, 0.2)',
                  border: '2px solid rgba(29, 161, 242, 0.3)'
                }}
                data-testid="footer-link-twitter"
              >
                <FaTwitter className="text-2xl transition-colors group-hover:text-[#1DA1F2]" style={{color: '#1DA1F2'}} />
              </a>

              <a
                href="https://youtube.com/@memestake86?si=0bljj-3rnPz9IPh1"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-full transition-all duration-300 hover:scale-110"
                style={{
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 0, 0, 0.3)'
                }}
                data-testid="footer-link-youtube"
              >
                <FaYoutube className="text-2xl transition-colors group-hover:text-[#FF0000]" style={{color: '#FF0000'}} />
              </a>

            </div>

            {/* Divider */}
            <div className="w-full max-w-2xl h-px" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.3) 50%, transparent 100%)'
            }}></div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} <span className="font-semibold" style={{color: '#ffd700'}}>$memes</span>. All rights reserved.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Built on Binance Smart Chain • Powered by Community
              </p>
            </div>
          </div>
        </div>

        {/* Background glow effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
               style={{background: 'radial-gradient(circle, #ffd700 0%, transparent 70%)'}}></div>
        </div>
      </footer>
    </div>
  );
}
