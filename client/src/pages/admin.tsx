import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, User, Wallet, TrendingUp, Users, Newspaper, Mail, LogOut, Trash2, Edit } from "lucide-react";
import { createPublicClient, http } from 'viem';
import { bsc } from 'viem/chains';
import { CONTRACTS } from '../config/contracts';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Authentication check
  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (!auth) {
      toast({
        title: "🔒 Unauthorized",
        description: "Please login to access admin panel",
        variant: "destructive",
      });
      setLocation("/kb-admin-login");
    }
  }, []);

  // User Search State
  const [searchAddress, setSearchAddress] = useState("");
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // News State
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsPublished, setNewsPublished] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  // Fetch news
  const { data: allNews = [], refetch: refetchNews } = useQuery<any[]>({
    queryKey: ["/api/admin/news"],
  });

  // Fetch subscriptions
  const { data: subscriptions = [], refetch: refetchSubscriptions } = useQuery<any[]>({
    queryKey: ["/api/admin/subscriptions"],
  });

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminUser");
    toast({
      title: "👋 Logged Out",
      description: "You have been logged out successfully",
    });
    setLocation("/");
  };

  const searchUser = async () => {
    if (!searchAddress || !searchAddress.startsWith('0x')) {
      toast({
        title: "❌ Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const publicClient = createPublicClient({
        chain: bsc,
        transport: http('https://bsc-dataseed.binance.org/')
      });

      const tokenBalance = await publicClient.readContract({
        address: CONTRACTS.MEMES_TOKEN.address as `0x${string}`,
        abi: CONTRACTS.MEMES_TOKEN.abi,
        functionName: 'balanceOf',
        args: [searchAddress as `0x${string}`]
      }) as bigint;

      const userStakes = await publicClient.readContract({
        address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_STAKE.abi,
        functionName: 'getUserStakes',
        args: [searchAddress as `0x${string}`]
      }) as any[];

      let totalStaked = 0;
      for (const stake of userStakes) {
        if (!stake.capitalWithdrawn) {
          totalStaked += Number(stake.stakedAmount) / 1e18;
        }
      }

      const pendingRewards = await publicClient.readContract({
        address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_STAKE.abi,
        functionName: 'getPendingRewards',
        args: [searchAddress as `0x${string}`]
      }) as bigint;

      const referralRewards = await publicClient.readContract({
        address: CONTRACTS.MEMES_STAKE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_STAKE.abi,
        functionName: 'getTotalRewardsByReferralLevel',
        args: [searchAddress as `0x${string}`]
      }) as any;

      const sponsor = await publicClient.readContract({
        address: CONTRACTS.MEMES_PRESALE.address as `0x${string}`,
        abi: CONTRACTS.MEMES_PRESALE.abi,
        functionName: 'referrerOf',
        args: [searchAddress as `0x${string}`]
      }) as string;

      setUserDetails({
        address: searchAddress,
        tokenBalance: Number(tokenBalance) / 1e18,
        totalStaked,
        pendingRewards: Number(pendingRewards) / 1e18,
        referralRewards: Number(referralRewards[0] || 0) / 1e18,
        level1Rewards: Number(referralRewards[1] || 0) / 1e18,
        level2Rewards: Number(referralRewards[2] || 0) / 1e18,
        level3Rewards: Number(referralRewards[3] || 0) / 1e18,
        sponsor,
        stakes: userStakes
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast({
        title: "❌ Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // News mutations
  const createNewsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/news", data);
    },
    onSuccess: () => {
      toast({ title: "✅ News Created", description: "News article created successfully" });
      setNewsTitle("");
      setNewsContent("");
      setNewsPublished(false);
      refetchNews();
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PUT", `/api/admin/news/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "✅ News Updated", description: "News article updated successfully" });
      setNewsTitle("");
      setNewsContent("");
      setNewsPublished(false);
      setEditingNewsId(null);
      refetchNews();
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/news/${id}`);
    },
    onSuccess: () => {
      toast({ title: "✅ News Deleted", description: "News article deleted successfully" });
      refetchNews();
    },
  });

  const handleSaveNews = () => {
    if (!newsTitle || !newsContent) {
      toast({
        title: "❌ Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    const newsData = {
      title: newsTitle,
      content: newsContent,
      published: newsPublished,
    };

    if (editingNewsId) {
      updateNewsMutation.mutate({ id: editingNewsId, data: newsData });
    } else {
      createNewsMutation.mutate(newsData);
    }
  };

  const handleEditNews = (news: any) => {
    setNewsTitle(news.title);
    setNewsContent(news.content);
    setNewsPublished(news.published);
    setEditingNewsId(news.id);
  };

  const handleCancelEdit = () => {
    setNewsTitle("");
    setNewsContent("");
    setNewsPublished(false);
    setEditingNewsId(null);
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #000000 0%, #0a0e1a 50%, #000000 100%)'}}>
      {/* Header */}
      <header className="border-b" style={{background: 'rgba(15, 20, 35, 0.95)', borderColor: 'rgba(255, 215, 0, 0.15)'}}>
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: '#ffd700'}}>
                <span className="text-xl">⚙️</span>
              </div>
              <h1 className="text-2xl font-bold" style={{color: '#ffd700'}}>Admin Control Panel</h1>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              style={{borderColor: 'rgba(255, 215, 0, 0.3)', color: '#ffd700'}}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto" style={{background: 'rgba(15, 20, 35, 0.8)'}}>
            <TabsTrigger value="users" data-testid="tab-users" style={{color: '#ffd700'}}>
              <User className="w-4 h-4 mr-2" />
              User Reports
            </TabsTrigger>
            <TabsTrigger value="news" data-testid="tab-news" style={{color: '#ffd700'}}>
              <Newspaper className="w-4 h-4 mr-2" />
              News Updates
            </TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions" style={{color: '#ffd700'}}>
              <Mail className="w-4 h-4 mr-2" />
              Email Subscribers
            </TabsTrigger>
          </TabsList>

          {/* User Reports Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="p-6" style={{
              background: 'rgba(15, 20, 35, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{color: '#ffd700'}}>🔍 Search User by Wallet Address</h2>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter wallet address (0x...)"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="flex-1"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderColor: 'rgba(255, 215, 0, 0.3)',
                    color: 'white'
                  }}
                  data-testid="input-search-address"
                />
                <Button
                  onClick={searchUser}
                  disabled={isLoading}
                  style={{background: '#ffd700', color: '#000'}}
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </Card>

            {userDetails && (
              <div className="space-y-6">
                <Card className="p-6" style={{
                  background: 'rgba(15, 20, 35, 0.8)',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#ffd700'}}>
                    <User className="w-5 h-5" />
                    User Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                      <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                      <div className="font-mono text-sm" style={{color: '#ffd700'}} data-testid="text-user-address">
                        {userDetails.address}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                      <div className="text-sm text-gray-400 mb-1">Sponsor Address</div>
                      <div className="font-mono text-sm" style={{color: '#00bfff'}} data-testid="text-sponsor-address">
                        {userDetails.sponsor === '0x0000000000000000000000000000000000000000' ? 'No Sponsor' : userDetails.sponsor}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6" style={{
                    background: 'rgba(15, 20, 35, 0.8)',
                    border: '1px solid rgba(255, 215, 0, 0.2)'
                  }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgba(255, 215, 0, 0.2)'}}>
                        <Wallet className="w-5 h-5" style={{color: '#ffd700'}} />
                      </div>
                      <div className="text-sm text-gray-400">Token Balance</div>
                    </div>
                    <div className="text-2xl font-bold" style={{color: '#ffd700'}} data-testid="text-token-balance">
                      {userDetails.tokenBalance.toLocaleString('en-US')} $MEMES
                    </div>
                  </Card>

                  <Card className="p-6" style={{
                    background: 'rgba(15, 20, 35, 0.8)',
                    border: '1px solid rgba(0, 191, 255, 0.2)'
                  }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgba(0, 191, 255, 0.2)'}}>
                        <TrendingUp className="w-5 h-5" style={{color: '#00bfff'}} />
                      </div>
                      <div className="text-sm text-gray-400">Total Staked</div>
                    </div>
                    <div className="text-2xl font-bold" style={{color: '#00bfff'}} data-testid="text-total-staked">
                      {userDetails.totalStaked.toLocaleString('en-US')} $MEMES
                    </div>
                  </Card>

                  <Card className="p-6" style={{
                    background: 'rgba(15, 20, 35, 0.8)',
                    border: '1px solid rgba(0, 255, 136, 0.2)'
                  }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgba(0, 255, 136, 0.2)'}}>
                        <span className="text-xl">💰</span>
                      </div>
                      <div className="text-sm text-gray-400">Pending Rewards</div>
                    </div>
                    <div className="text-2xl font-bold" style={{color: '#00ff88'}} data-testid="text-pending-rewards">
                      {userDetails.pendingRewards.toLocaleString('en-US')} $MEMES
                    </div>
                  </Card>
                </div>

                <Card className="p-6" style={{
                  background: 'rgba(15, 20, 35, 0.8)',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{color: '#ffd700'}}>
                    <Users className="w-5 h-5" />
                    Referral Rewards (3-Level System)
                  </h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
                      <div className="text-sm text-gray-400 mb-2">Total Referral</div>
                      <div className="text-xl font-bold" style={{color: '#ffd700'}} data-testid="text-total-referral">
                        {userDetails.referralRewards.toLocaleString('en-US')}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{background: 'rgba(0, 191, 255, 0.1)'}}>
                      <div className="text-sm text-gray-400 mb-2">Level 1 (5%)</div>
                      <div className="text-xl font-bold" style={{color: '#00bfff'}} data-testid="text-level1-rewards">
                        {userDetails.level1Rewards.toLocaleString('en-US')}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{background: 'rgba(0, 255, 136, 0.1)'}}>
                      <div className="text-sm text-gray-400 mb-2">Level 2 (3%)</div>
                      <div className="text-xl font-bold" style={{color: '#00ff88'}} data-testid="text-level2-rewards">
                        {userDetails.level2Rewards.toLocaleString('en-US')}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg" style={{background: 'rgba(255, 165, 0, 0.1)'}}>
                      <div className="text-sm text-gray-400 mb-2">Level 3 (2%)</div>
                      <div className="text-xl font-bold" style={{color: '#ffa500'}} data-testid="text-level3-rewards">
                        {userDetails.level3Rewards.toLocaleString('en-US')}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6" style={{
                  background: 'rgba(15, 20, 35, 0.8)',
                  border: '1px solid rgba(255, 215, 0, 0.2)'
                }}>
                  <h3 className="text-lg font-bold mb-4" style={{color: '#ffd700'}}>📊 Active Stakes</h3>
                  {userDetails.stakes.length > 0 ? (
                    <div className="space-y-3">
                      {userDetails.stakes.map((stake: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg"
                          style={{
                            background: stake.capitalWithdrawn ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                            border: `1px solid ${stake.capitalWithdrawn ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`
                          }}
                          data-testid={`stake-${index}`}
                        >
                          <div className="grid md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-gray-400">Amount</div>
                              <div className="font-bold" style={{color: '#ffd700'}}>
                                {(Number(stake.stakedAmount) / 1e18).toLocaleString('en-US')} $MEMES
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Start Time</div>
                              <div className="text-sm text-white">
                                {new Date(Number(stake.startTime) * 1000).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Total Claimed</div>
                              <div className="text-sm" style={{color: '#00ff88'}}>
                                {(Number(stake.totalRewardsClaimed) / 1e18).toLocaleString('en-US')} $MEMES
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Status</div>
                              <div className={`text-sm font-bold ${stake.capitalWithdrawn ? 'text-red-400' : 'text-green-400'}`}>
                                {stake.capitalWithdrawn ? '❌ Withdrawn' : '✅ Active'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">No active stakes found</div>
                  )}
                </Card>
              </div>
            )}
          </TabsContent>

          {/* News Updates Tab */}
          <TabsContent value="news" className="space-y-6">
            <Card className="p-6" style={{
              background: 'rgba(15, 20, 35, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{color: '#ffd700'}}>
                {editingNewsId ? '✏️ Edit News Article' : '📝 Create News Article'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Title</label>
                  <Input
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Enter news title"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                      color: 'white'
                    }}
                    data-testid="input-news-title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Content</label>
                  <Textarea
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Enter news content"
                    rows={6}
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                      color: 'white'
                    }}
                    data-testid="input-news-content"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={newsPublished}
                    onCheckedChange={setNewsPublished}
                    data-testid="switch-news-published"
                  />
                  <label className="text-sm text-gray-300">Publish immediately</label>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveNews}
                    disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
                    style={{background: '#ffd700', color: '#000'}}
                    data-testid="button-save-news"
                  >
                    {editingNewsId ? 'Update News' : 'Create News'}
                  </Button>
                  {editingNewsId && (
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      style={{borderColor: 'rgba(255, 215, 0, 0.3)', color: '#ffd700'}}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6" style={{
              background: 'rgba(15, 20, 35, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <h2 className="text-xl font-bold mb-4" style={{color: '#ffd700'}}>📰 All News Articles</h2>
              {allNews.length > 0 ? (
                <div className="space-y-3">
                  {allNews.map((news: any) => (
                    <div
                      key={news.id}
                      className="p-4 rounded-lg"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${news.published ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 165, 0, 0.3)'}`
                      }}
                      data-testid={`news-${news.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold" style={{color: '#ffd700'}}>{news.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${news.published ? 'bg-green-500' : 'bg-orange-500'}`}>
                              {news.published ? '✅ Published' : '⏳ Draft'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{news.content}</p>
                          <div className="text-xs text-gray-400">
                            Created: {new Date(news.createdAt).toLocaleString('en-US')}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditNews(news)}
                            style={{borderColor: 'rgba(0, 191, 255, 0.3)', color: '#00bfff'}}
                            data-testid={`button-edit-news-${news.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteNewsMutation.mutate(news.id)}
                            style={{borderColor: 'rgba(255, 0, 0, 0.3)', color: '#ff0000'}}
                            data-testid={`button-delete-news-${news.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No news articles yet</div>
              )}
            </Card>
          </TabsContent>

          {/* Email Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card className="p-6" style={{
              background: 'rgba(15, 20, 35, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{color: '#ffd700'}}>📧 Email Subscriptions Report</h2>
                <div className="text-2xl font-bold" style={{color: '#00ff88'}}>
                  {subscriptions.filter((s: any) => s.subscribed).length} Active
                </div>
              </div>

              {subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-lg"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: `1px solid ${sub.subscribed ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`
                      }}
                      data-testid={`subscription-${sub.id}`}
                    >
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Email</div>
                          <div className="font-medium" style={{color: '#ffd700'}}>{sub.email}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Wallet Address</div>
                          <div className="font-mono text-sm text-white">
                            {sub.walletAddress || 'Not provided'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Status</div>
                          <div className={`text-sm font-bold ${sub.subscribed ? 'text-green-400' : 'text-red-400'}`}>
                            {sub.subscribed ? '✅ Active' : '❌ Unsubscribed'}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Subscribed: {new Date(sub.subscribedAt).toLocaleString('en-US')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No email subscriptions yet</div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
