import { Button } from "@/components/ui/button";

export function Footer() {
  const footerLinks = [
    { name: "About", href: "#about" },
    { name: "Staking", href: "#staking" },
    { name: "Whitepaper", href: "#whitepaper" },
    { name: "Smart Contract", href: "#smart-contract" },
    { name: "Roadmap", href: "#roadmap" }
  ];

  const socialIcons = [
    { name: "Telegram", icon: "✈️", href: "https://t.me/memstakeofficial" },
    { name: "Twitter", icon: "🐦", href: "https://twitter.com/memestake" },
    { name: "YouTube", icon: "📺", href: "https://youtube.com/@memestake" },
    { name: "Discord", icon: "💬", href: "https://discord.gg/memestake" }
  ];

  const handleLinkClick = (href: string) => {
    if (href.startsWith('http')) {
      window.open(href, '_blank');
    } else {
      console.log(`Navigating to: ${href}`);
    }
  };

  return (
    <footer className="bg-card/50 border-t border-border mt-16" data-testid="footer">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Links */}
          <div className="flex flex-wrap items-center space-x-6">
            {footerLinks.map((link, index) => (
              <div key={link.name} className="flex items-center">
                <button
                  onClick={() => handleLinkClick(link.href)}
                  className="text-muted-foreground hover:text-accent transition-colors text-sm"
                  data-testid={`footer-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.name}
                </button>
                {index < footerLinks.length - 1 && (
                  <span className="text-muted-foreground mx-3">|</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Social Media Icons */}
          <div className="flex space-x-3" data-testid="social-icons">
            {socialIcons.map((social) => (
              <Button
                key={social.name}
                variant="ghost"
                size="sm"
                onClick={() => handleLinkClick(social.href)}
                className="w-10 h-10 p-0 hover:bg-accent hover:text-accent-foreground"
                data-testid={`social-${social.name.toLowerCase()}`}
                title={social.name}
              >
                <span className="text-lg">{social.icon}</span>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center mt-4 pt-4 border-t border-border">
          <div className="text-muted-foreground text-sm">
            © 2025 MemeStake. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
