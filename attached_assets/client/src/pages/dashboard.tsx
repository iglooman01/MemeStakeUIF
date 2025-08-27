import { Navbar } from "@/components/navbar";
import { AirdropTimer } from "@/components/airdrop-timer";
import { NewsBar } from "@/components/news-bar";
import { AirdropVertical } from "@/components/airdrop-vertical";
import { ReferralsCard } from "@/components/referrals-card";
import { WalletCard } from "@/components/wallet-card";
import { StakingOverview } from "@/components/staking-overview";
import { MyProfitStaking } from "@/components/my-profit-staking";
import { RoadmapSection } from "@/components/roadmap-section";
import { CommunityStats } from "@/components/community-stats";
import { TopReferrals } from "@/components/top-referrals";
import { Footer } from "@/components/footer";

export default function Dashboard() {
  return (
    <div className="min-h-screen text-foreground" data-testid="dashboard-page">
      {/* Navbar / Header */}
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Airdrop End Timer (Big Bar) */}
        <AirdropTimer />
        
        {/* News Bar */}
        <NewsBar />
        
        {/* Airdrop (Vertical Flow – one tall box) full screen */}
        <AirdropVertical />
        
        {/* Referrals (one box) */}
        <ReferralsCard />
        
        {/* Middle Row (two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="middle-row">
          {/* Left: My Wallet */}
          <WalletCard />
          {/* Right: Staking Overview */}
          <StakingOverview />
        </div>
        
        {/* Left Row (two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="left-row">
          {/* My Profit staking */}
          <MyProfitStaking />
          {/* Roadmap (moved to right column) */}
          <div>
            <RoadmapSection />
          </div>
        </div>
        
        {/* Community (Full-width box) */}
        <CommunityStats />
        
        {/* Top 5 Referrals */}
        <TopReferrals />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}