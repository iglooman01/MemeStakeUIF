import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Coins, 
  Globe, 
  Eye, 
  Download, 
  ArrowLeft,
  BarChart3,
  Activity,
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Settings,
  Mail,
  Puzzle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

const MASTER_WALLET = "0xb79f08d7b6903db05afca56aee75a2c7cdc78e56";

export default function AdminAnalytics() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedDays, setSelectedDays] = useState(30);
  const [newTickerMessage, setNewTickerMessage] = useState("");
  const [editingTickerId, setEditingTickerId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState("");
  const [verificationMode, setVerificationMode] = useState<number>(1);

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const address = accounts[0].toLowerCase();
            setWalletAddress(address);
            if (address === MASTER_WALLET.toLowerCase()) {
              setIsAuthorized(true);
            } else {
              toast({
                title: "Access Denied",
                description: "Only the master wallet can access this dashboard",
                variant: "destructive",
              });
              setLocation("/dashboard");
            }
          } else {
            toast({
              title: "Wallet Not Connected",
              description: "Please connect your wallet first",
              variant: "destructive",
            });
            setLocation("/dashboard");
          }
        } catch (error) {
          console.error("Error checking wallet:", error);
          setLocation("/dashboard");
        }
      } else {
        setLocation("/dashboard");
      }
    };
    checkWallet();
  }, []);

  const { data: userAnalytics, isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/admin/analytics/users", walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/users?wallet=${walletAddress}`);
      if (!res.ok) throw new Error("Failed to fetch user analytics");
      return res.json();
    },
    enabled: isAuthorized && !!walletAddress,
  });

  const { data: trafficAnalytics, isLoading: loadingTraffic } = useQuery({
    queryKey: ["/api/admin/analytics/traffic", walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/traffic?wallet=${walletAddress}`);
      if (!res.ok) throw new Error("Failed to fetch traffic analytics");
      return res.json();
    },
    enabled: isAuthorized && !!walletAddress,
  });

  const { data: countryAnalytics, isLoading: loadingCountries } = useQuery({
    queryKey: ["/api/admin/analytics/countries", walletAddress, selectedDays],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics/countries?wallet=${walletAddress}&days=${selectedDays}`);
      if (!res.ok) throw new Error("Failed to fetch country analytics");
      return res.json();
    },
    enabled: isAuthorized && !!walletAddress,
  });

  const { data: newsTickers, isLoading: loadingTickers } = useQuery({
    queryKey: ["/api/admin/news-ticker", walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/admin/news-ticker?wallet=${walletAddress}`);
      if (!res.ok) throw new Error("Failed to fetch news tickers");
      return res.json();
    },
    enabled: isAuthorized && !!walletAddress,
  });

  const { data: verificationModeData } = useQuery({
    queryKey: ["/api/airdrop/verification-mode"],
    queryFn: async () => {
      const res = await fetch("/api/airdrop/verification-mode");
      if (!res.ok) throw new Error("Failed to fetch verification mode");
      return res.json();
    },
    enabled: isAuthorized,
  });

  useEffect(() => {
    if (verificationModeData?.mode !== undefined) {
      setVerificationMode(verificationModeData.mode);
    }
  }, [verificationModeData]);

  const switchVerificationModeMutation = useMutation({
    mutationFn: async (newMode: number) => {
      const res = await fetch("/api/airdrop/verification-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: walletAddress, mode: newMode }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || "Failed to switch verification mode");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setVerificationMode(data.mode);
      queryClient.invalidateQueries({ queryKey: ["/api/airdrop/verification-mode"] });
      toast({ title: `Verification mode switched to ${data.mode === 0 ? 'OTP (Email)' : 'Puzzle'}` });
    },
    onError: (error: any) => {
      toast({ title: error.message || "Failed to switch verification mode", variant: "destructive" });
    },
  });

  const createTickerMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch("/api/admin/news-ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress, message, isActive: true }),
      });
      if (!res.ok) throw new Error("Failed to create ticker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news-ticker"] });
      setNewTickerMessage("");
      toast({ title: "News ticker created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create ticker", variant: "destructive" });
    },
  });

  const updateTickerMutation = useMutation({
    mutationFn: async ({ id, message, isActive }: { id: string; message?: string; isActive?: boolean }) => {
      const res = await fetch(`/api/admin/news-ticker/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress, message, isActive }),
      });
      if (!res.ok) throw new Error("Failed to update ticker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news-ticker"] });
      setEditingTickerId(null);
      setEditingMessage("");
      toast({ title: "News ticker updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update ticker", variant: "destructive" });
    },
  });

  const deleteTickerMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/news-ticker/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress }),
      });
      if (!res.ok) throw new Error("Failed to delete ticker");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news-ticker"] });
      toast({ title: "News ticker deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete ticker", variant: "destructive" });
    },
  });

  const handleCreateTicker = () => {
    if (newTickerMessage.trim()) {
      createTickerMutation.mutate(newTickerMessage.trim());
    }
  };

  const handleExportUsers = () => {
    window.open(`/api/admin/export/users?wallet=${walletAddress}`, '_blank');
    toast({
      title: "Export Started",
      description: "Your Excel file is being downloaded",
    });
  };

  const handleExportEmails = () => {
    window.open(`/api/admin/export/emails?wallet=${walletAddress}`, '_blank');
    toast({
      title: "Export Started",
      description: "Your emails Excel file is being downloaded",
    });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto mb-4" style={{ borderColor: '#ffd700', borderTopColor: 'transparent' }}></div>
          <p className="text-white">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/dashboard")}
              className="border-white/20"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold" style={{ color: '#ffd700' }}>
              Admin Analytics Dashboard
            </h1>
          </div>
          <div className="text-sm text-gray-400">
            Master Wallet Connected
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-black/50 border border-white/20">
            <TabsTrigger value="users" className="data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="traffic" className="data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
              <Activity className="w-4 h-4 mr-2" />
              Traffic
            </TabsTrigger>
            <TabsTrigger value="countries" className="data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
              <Globe className="w-4 h-4 mr-2" />
              Countries
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
              <Download className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
              <Megaphone className="w-4 h-4 mr-2" />
              News
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#ffd700] data-[state=active]:text-black">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: '#00bfff' }}>User & Verification Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-black/50 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(0, 191, 255, 0.2)' }}>
                    <Users className="w-6 h-6" style={{ color: '#00bfff' }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-white">
                      {loadingUsers ? '...' : userAnalytics?.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-black/50 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.2)' }}>
                    <UserCheck className="w-6 h-6" style={{ color: '#00ff88' }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Verified Users</p>
                    <p className="text-2xl font-bold text-white">
                      {loadingUsers ? '...' : userAnalytics?.verifiedUsers || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-black/50 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 71, 87, 0.2)' }}>
                    <UserX className="w-6 h-6" style={{ color: '#ff4757' }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Unverified Users</p>
                    <p className="text-2xl font-bold text-white">
                      {loadingUsers ? '...' : userAnalytics?.unverifiedUsers || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-black/50 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.2)' }}>
                    <Coins className="w-6 h-6" style={{ color: '#ffd700' }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Token Holders</p>
                    <p className="text-2xl font-bold text-white">
                      {loadingUsers ? '...' : userAnalytics?.tokenHolders || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: '#00bfff' }}>Traffic & Usage Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-black/50 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(0, 191, 255, 0.2)' }}>
                    <Eye className="w-6 h-6" style={{ color: '#00bfff' }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Page Views</p>
                    <p className="text-2xl font-bold text-white">
                      {loadingTraffic ? '...' : trafficAnalytics?.totalPageViews || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-black/50 border border-white/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'rgba(0, 255, 136, 0.2)' }}>
                    <Users className="w-6 h-6" style={{ color: '#00ff88' }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Unique Users (Last 24h)</p>
                    <p className="text-2xl font-bold text-white">
                      {loadingTraffic ? '...' : trafficAnalytics?.uniqueUsersLast24h || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="countries" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: '#00bfff' }}>Country-Wise Analytics</h2>
              <div className="flex gap-2">
                {[1, 2, 5, 10, 15, 30].map((days) => (
                  <Button
                    key={days}
                    variant={selectedDays === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDays(days)}
                    className={selectedDays === days ? "bg-[#ffd700] text-black" : "border-white/20"}
                    data-testid={`button-days-${days}`}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
            
            <Card className="p-6 bg-black/50 border border-white/20">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffd700' }}>
                Users by Country (Last {selectedDays} days)
              </h3>
              
              {loadingCountries ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto" style={{ borderColor: '#ffd700', borderTopColor: 'transparent' }}></div>
                </div>
              ) : countryAnalytics && countryAnalytics.length > 0 ? (
                <div className="space-y-3">
                  {countryAnalytics.map((item: { country: string; count: number }, index: number) => (
                    <div key={item.country} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold" style={{ color: '#ffd700' }}>#{index + 1}</span>
                        <Globe className="w-5 h-5" style={{ color: '#00bfff' }} />
                        <span className="text-white">{item.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold" style={{ color: '#00ff88' }}>{item.count}</span>
                        <span className="text-sm text-gray-400">users</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No country data available for this period
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: '#00bfff' }}>Data Export (Excel)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-black/50 border border-white/20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 255, 136, 0.2)' }}>
                    <Download className="w-8 h-8" style={{ color: '#00ff88' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#ffd700' }}>Export All User Data</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Download complete user data including email, wallet, verification status, country, and token information.
                  </p>
                  <Button
                    onClick={handleExportUsers}
                    className="w-full"
                    style={{ background: '#00ff88', color: '#000' }}
                    data-testid="button-export-users"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Full User Data
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-black/50 border border-white/20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 191, 255, 0.2)' }}>
                    <Download className="w-8 h-8" style={{ color: '#00bfff' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#ffd700' }}>Export Emails Only</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Download only registered email addresses with wallet and verification status.
                  </p>
                  <Button
                    onClick={handleExportEmails}
                    className="w-full"
                    style={{ background: '#00bfff', color: '#000' }}
                    data-testid="button-export-emails"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Emails
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: '#00bfff' }}>News Ticker Management</h2>
            <p className="text-gray-400">Manage the scrolling news bar displayed on the dashboard. Only one ticker can be active at a time.</p>
            
            <Card className="p-6 bg-black/50 border border-white/20">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffd700' }}>Create New Ticker</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter news message..."
                  value={newTickerMessage}
                  onChange={(e) => setNewTickerMessage(e.target.value)}
                  className="flex-1 bg-black/50 border-white/20 text-white"
                  data-testid="input-new-ticker"
                />
                <Button
                  onClick={handleCreateTicker}
                  disabled={!newTickerMessage.trim() || createTickerMutation.isPending}
                  style={{ background: '#00ff88', color: '#000' }}
                  data-testid="button-create-ticker"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createTickerMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-black/50 border border-white/20">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffd700' }}>Existing Tickers</h3>
              
              {loadingTickers ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto" style={{ borderColor: '#ffd700', borderTopColor: 'transparent' }}></div>
                </div>
              ) : newsTickers && newsTickers.length > 0 ? (
                <div className="space-y-4">
                  {newsTickers.map((ticker: any) => (
                    <div key={ticker.id} className="p-4 rounded-lg bg-black/30 border border-white/10">
                      {editingTickerId === ticker.id ? (
                        <div className="flex gap-3">
                          <Input
                            value={editingMessage}
                            onChange={(e) => setEditingMessage(e.target.value)}
                            className="flex-1 bg-black/50 border-white/20 text-white"
                            data-testid={`input-edit-ticker-${ticker.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={() => updateTickerMutation.mutate({ id: ticker.id, message: editingMessage })}
                            disabled={updateTickerMutation.isPending}
                            style={{ background: '#00ff88', color: '#000' }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingTickerId(null); setEditingMessage(""); }}
                            className="border-white/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-white mb-2">{ticker.message}</p>
                            <div className="flex items-center gap-3">
                              <span 
                                className={`px-2 py-1 rounded text-xs font-medium ${ticker.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                              >
                                {ticker.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Updated: {new Date(ticker.updatedAt).toLocaleString('en-US')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTickerMutation.mutate({ id: ticker.id, isActive: !ticker.isActive })}
                              disabled={updateTickerMutation.isPending}
                              className="border-white/20"
                              title={ticker.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {ticker.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setEditingTickerId(ticker.id); setEditingMessage(ticker.message); }}
                              className="border-white/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteTickerMutation.mutate(ticker.id)}
                              disabled={deleteTickerMutation.isPending}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No news tickers yet. Create one above!</p>
                  <p className="text-sm mt-2">Default message will be shown: "Congratulations! We are live. Complete your task and claim your reward."</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: '#00bfff' }}>System Settings</h2>
            <p className="text-gray-400">Configure system-wide settings for the MEMES STAKE platform.</p>
            
            <Card className="p-6 bg-black/50 border border-white/20">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffd700' }}>Airdrop Verification Mode</h3>
              <p className="text-gray-400 mb-6">
                Switch between verification methods for airdrop claims. OTP mode sends email verification codes, 
                while Puzzle mode uses math puzzles for verification.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${verificationMode === 0 ? 'border-[#00ff88] bg-[#00ff88]/10' : 'border-white/20 hover:border-white/40'}`}
                  onClick={() => {
                    if (verificationMode !== 0 && !switchVerificationModeMutation.isPending) {
                      switchVerificationModeMutation.mutate(0);
                    }
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(0, 191, 255, 0.2)' }}>
                      <Mail className="w-6 h-6" style={{ color: '#00bfff' }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">OTP Mode</h4>
                      <p className="text-sm text-gray-400">Email verification codes</p>
                    </div>
                    {verificationMode === 0 && (
                      <div className="ml-auto">
                        <Check className="w-6 h-6" style={{ color: '#00ff88' }} />
                      </div>
                    )}
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>6-digit code sent to email</li>
                    <li>5-minute expiration</li>
                    <li>Max 3 sends per hour</li>
                  </ul>
                </div>

                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${verificationMode === 1 ? 'border-[#00ff88] bg-[#00ff88]/10' : 'border-white/20 hover:border-white/40'}`}
                  onClick={() => {
                    if (verificationMode !== 1 && !switchVerificationModeMutation.isPending) {
                      switchVerificationModeMutation.mutate(1);
                    }
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.2)' }}>
                      <Puzzle className="w-6 h-6" style={{ color: '#ffd700' }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Puzzle Mode</h4>
                      <p className="text-sm text-gray-400">Math puzzle verification</p>
                    </div>
                    {verificationMode === 1 && (
                      <div className="ml-auto">
                        <Check className="w-6 h-6" style={{ color: '#00ff88' }} />
                      </div>
                    )}
                  </div>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>Simple math puzzles</li>
                    <li>Instant verification</li>
                    <li>No email required</li>
                  </ul>
                </div>
              </div>

              {switchVerificationModeMutation.isPending && (
                <div className="mt-4 text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-gold-500 border-t-transparent rounded-full mx-auto" style={{ borderColor: '#ffd700', borderTopColor: 'transparent' }}></div>
                  <p className="text-sm text-gray-400 mt-2">Switching verification mode...</p>
                </div>
              )}
              
              <div className="mt-6 p-4 rounded-lg bg-black/30 border border-white/10">
                <p className="text-sm text-gray-400">
                  <strong style={{ color: '#ffd700' }}>Current Mode:</strong>{' '}
                  <span style={{ color: '#00ff88' }}>{verificationMode === 0 ? 'OTP (Email)' : 'Puzzle'}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Switching modes requires wallet signature for security. This affects all new airdrop verifications.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
