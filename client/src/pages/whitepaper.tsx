import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, FileText, Target, Shield, Zap, Trophy, Globe, Coins, Lock, CheckCircle2 } from "lucide-react";

export default function Whitepaper() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0a23 0%, #1e0f3c 100%)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(255, 215, 0, 0.2)', background: 'rgba(0, 0, 0, 0.3)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6" style={{ color: '#ffd700' }} />
            <h1 className="text-xl font-bold" style={{ color: '#ffd700' }}>
              Memestake Whitepaper
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation('/')}
            data-testid="button-back-home"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <Card className="p-8 mb-8 glass-card text-center" style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(0, 191, 255, 0.1))' }}>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#ffd700' }}>
            Memestake ($MEMES) Whitepaper
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Memestake is a next-generation decentralized staking protocol that allows users to stake their favorite meme coins and earn up to <span style={{ color: '#00ff88' }} className="font-bold">365% APY</span>. The most unique aspect of Memestake is its daily reward mechanism — users earn <span style={{ color: '#ffd700' }} className="font-bold">1% daily rewards</span>, withdrawable directly to their wallets every single day. This makes Memestake the <span style={{ color: '#00bfff' }} className="font-bold">first-ever staking platform</span> in the crypto industry offering real-time daily staking rewards with full capital flexibility.
          </p>
        </Card>

        {/* Vision */}
        <Card className="p-6 mb-8 glass-card">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6" style={{ color: '#00bfff' }} />
            <h3 className="text-2xl font-bold" style={{ color: '#00bfff' }}>Vision</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">
            To revolutionize the meme coin ecosystem by transforming passive meme holdings into active income-generating assets through decentralized staking, cross-chain rewards, and NFT staking utilities.
          </p>
        </Card>

        {/* Problems Section */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#ffd700' }}>1. Problems with Existing Staking Protocols</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 mt-1" style={{ color: '#ff6b6b' }} />
              <div>
                <span className="font-semibold" style={{ color: '#ff6b6b' }}>Locked Funds</span>
                <span className="text-gray-300"> – users can't access staked tokens before the end of the lock period.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 mt-1" style={{ color: '#ff6b6b' }} />
              <div>
                <span className="font-semibold" style={{ color: '#ff6b6b' }}>Delayed Rewards</span>
                <span className="text-gray-300"> – rewards distributed weekly or monthly cause friction.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 mt-1" style={{ color: '#ff6b6b' }} />
              <div>
                <span className="font-semibold" style={{ color: '#ff6b6b' }}>Centralization</span>
                <span className="text-gray-300"> – centralized custodial staking creates rug-pull risk.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 mt-1" style={{ color: '#ff6b6b' }} />
              <div>
                <span className="font-semibold" style={{ color: '#ff6b6b' }}>No Cross-Chain Support</span>
                <span className="text-gray-300"> – staking limited to one blockchain.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 mt-1" style={{ color: '#ff6b6b' }} />
              <div>
                <span className="font-semibold" style={{ color: '#ff6b6b' }}>No NFT Utility</span>
                <span className="text-gray-300"> – NFTs stay idle without earning yield.</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Solutions Section */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#00ff88' }}>2. How Memestake Solves These Problems</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-1" style={{ color: '#00ff88' }} />
              <div>
                <span className="font-semibold" style={{ color: '#00ff88' }}>1% Daily Rewards:</span>
                <span className="text-gray-300"> Users earn 1% daily and can withdraw anytime.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-1" style={{ color: '#00ff88' }} />
              <div>
                <span className="font-semibold" style={{ color: '#00ff88' }}>Flexible Unstaking:</span>
                <span className="text-gray-300"> Users can withdraw funds anytime.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-1" style={{ color: '#00ff88' }} />
              <div>
                <span className="font-semibold" style={{ color: '#00ff88' }}>Cross-Bridge Protocol:</span>
                <span className="text-gray-300"> Stake SHIBA and earn PEPE – true cross-chain innovation.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-1" style={{ color: '#00ff88' }} />
              <div>
                <span className="font-semibold" style={{ color: '#00ff88' }}>NFT Staking:</span>
                <span className="text-gray-300"> Turn your NFTs into yield assets.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-1" style={{ color: '#00ff88' }} />
              <div>
                <span className="font-semibold" style={{ color: '#00ff88' }}>Decentralized Governance:</span>
                <span className="text-gray-300"> $MEMES holders govern the protocol.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 mt-1" style={{ color: '#00ff88' }} />
              <div>
                <span className="font-semibold" style={{ color: '#00ff88' }}>DEX Liquidity Provision:</span>
                <span className="text-gray-300"> Liquidity profits are distributed to token holders.</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Architecture */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#00bfff' }}>3. Technical Architecture</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
              <div className="font-semibold mb-1" style={{ color: '#00bfff' }}>Smart Contracts</div>
              <div className="text-sm text-gray-400">Manage staking, rewards, and penalty logic</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <div className="font-semibold mb-1" style={{ color: '#ffd700' }}>Cross-Bridge Engine</div>
              <div className="text-sm text-gray-400">Allows multi-token staking</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
              <div className="font-semibold mb-1" style={{ color: '#00ff88' }}>Oracle Layer</div>
              <div className="text-sm text-gray-400">Provides real-time price feeds</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
              <div className="font-semibold mb-1" style={{ color: '#00bfff' }}>Liquidity Vault</div>
              <div className="text-sm text-gray-400">Maintains transparent reserves</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <div className="font-semibold mb-1" style={{ color: '#ffd700' }}>Governance DAO</div>
              <div className="text-sm text-gray-400">For protocol decisions</div>
            </div>
          </div>
        </Card>

        {/* Reward Distribution */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#ffd700' }}>4. Reward Distribution & Profit Model</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Reward Rate</div>
                  <div className="font-bold" style={{ color: '#00ff88' }}>1% daily (365% APY)</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Reward Claim</div>
                  <div className="font-bold" style={{ color: '#00ff88' }}>Accumulates daily, withdrawable weekly</div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <div className="text-sm text-gray-400 mb-1">Capital Withdrawal</div>
              <div className="text-gray-300">Before 90 days, rewards are deducted and 20% penalty applied.</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
              <div className="text-sm text-gray-400 mb-1">Revenue Streams</div>
              <div className="text-gray-300">DEX yield, treasury staking, cross-bridge fees</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
              <div className="text-sm text-gray-400 mb-1">Referral System</div>
              <div className="text-gray-300 mb-2">3-Level Token Distribution Program</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded" style={{ background: 'rgba(255, 215, 0, 0.2)' }}>
                  <div className="font-bold" style={{ color: '#ffd700' }}>Level 1</div>
                  <div className="text-sm text-gray-300">1,00,000 $MEMES</div>
                </div>
                <div className="p-2 rounded" style={{ background: 'rgba(0, 191, 255, 0.2)' }}>
                  <div className="font-bold" style={{ color: '#00bfff' }}>Level 2</div>
                  <div className="text-sm text-gray-300">1,00,000 $MEMES</div>
                </div>
                <div className="p-2 rounded" style={{ background: 'rgba(0, 255, 136, 0.2)' }}>
                  <div className="font-bold" style={{ color: '#00ff88' }}>Level 3</div>
                  <div className="text-sm text-gray-300">1,00,000 $MEMES</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">Tokens distributed across three referral levels</div>
            </div>
          </div>
        </Card>

        {/* NFT Staking */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#00bfff' }}>5. NFT Staking Innovation</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Stake NFTs to earn yield – a first in the meme ecosystem. NFTs' floor prices are tracked by oracles for reward calculation, allowing NFT holders to earn APYs while holding their assets.
          </p>
        </Card>

        {/* Ecosystem Expansion */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#00ff88' }}>6. Ecosystem Expansion</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: '#00ff88' }} />
              <span className="text-gray-300">Meme-to-Meme Cross-Staking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: '#00ff88' }} />
              <span className="text-gray-300">Multi-chain Pools</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: '#00ff88' }} />
              <span className="text-gray-300">NFT Collateral Lending</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: '#00ff88' }} />
              <span className="text-gray-300">DAO Governance</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: '#00ff88' }} />
              <span className="text-gray-300">Global Meme Yield Network</span>
            </div>
          </div>
        </Card>

        {/* Token Utility */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#ffd700' }}>7. $MEMES Token Utility</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 mt-1" style={{ color: '#ffd700' }} />
              <span className="text-gray-300">Governance voting</span>
            </div>
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 mt-1" style={{ color: '#ffd700' }} />
              <span className="text-gray-300">Reward and referral token</span>
            </div>
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 mt-1" style={{ color: '#ffd700' }} />
              <span className="text-gray-300">Payment medium for bridge fees</span>
            </div>
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 mt-1" style={{ color: '#ffd700' }} />
              <span className="text-gray-300">Liquidity profit sharing</span>
            </div>
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 mt-1" style={{ color: '#ffd700' }} />
              <span className="text-gray-300">Required for NFT staking participation</span>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#00bfff' }}>8. Security & Transparency</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: '#00bfff' }} />
              <span className="text-gray-300">Smart contract audits</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: '#00bfff' }} />
              <span className="text-gray-300">Bug bounty program</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: '#00bfff' }} />
              <span className="text-gray-300">On-chain transparency</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: '#00bfff' }} />
              <span className="text-gray-300">Non-custodial staking</span>
            </div>
          </div>
        </Card>

        {/* Roadmap */}
        <Card className="p-6 mb-8 glass-card">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#00ff88' }}>9. Roadmap</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <div className="font-bold mb-1" style={{ color: '#ffd700' }}>Q4 2025</div>
              <div className="text-sm text-gray-300">Platform & Sale Launch</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
              <div className="font-bold mb-1" style={{ color: '#00bfff' }}>Q1 2026</div>
              <div className="text-sm text-gray-300">Meme Coin Staking + Daily Rewards</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
              <div className="font-bold mb-1" style={{ color: '#00ff88' }}>Q2 2026</div>
              <div className="text-sm text-gray-300">Cross-Bridge & NFT Staking</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
              <div className="font-bold mb-1" style={{ color: '#ffd700' }}>Q3 2026</div>
              <div className="text-sm text-gray-300">DAO Governance + DEX Liquidity</div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'rgba(0, 191, 255, 0.1)', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
              <div className="font-bold mb-1" style={{ color: '#00bfff' }}>Q4 2026</div>
              <div className="text-sm text-gray-300">Lending & Global Expansion</div>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 glass-card" style={{ background: 'rgba(255, 107, 107, 0.1)', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
          <h3 className="text-xl font-bold mb-3" style={{ color: '#ff6b6b' }}>10. Disclaimer</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            This whitepaper is for informational purposes only. Cryptocurrency investments involve risk. Always DYOR (Do Your Own Research) before investing. Memestake is community-driven and does not guarantee profits.
          </p>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={() => setLocation('/dashboard')}
            className="text-lg font-bold px-8 py-6"
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
              color: '#000',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)'
            }}
            data-testid="button-get-started"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}
