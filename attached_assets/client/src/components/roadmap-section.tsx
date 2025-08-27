import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RoadmapSection() {
  const roadmapData = [
    {
      quarter: "Q1",
      title: "Meme Staking Launch",
      status: "completed"
    },
    {
      quarter: "Q2", 
      title: "Meme NFT Pools",
      status: "in-progress"
    },
    {
      quarter: "Q3",
      title: "Meme Gaming Integration", 
      status: "upcoming"
    },
    {
      quarter: "Q4",
      title: "Cross-chain Staking",
      status: "upcoming"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-secondary text-secondary-foreground";
      case "in-progress":
        return "bg-accent text-accent-foreground";
      case "upcoming":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in-progress": 
        return "🔄";
      case "upcoming":
        return "🚀";
      default:
        return "⏳";
    }
  };

  return (
    <div className="space-y-6" data-testid="roadmap-section">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Roadmap</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roadmapData.map((quarter, index) => (
          <Card 
            key={quarter.quarter}
            className={`glass-card border-border relative ${
              quarter.status === 'in-progress' ? 'border-accent/50' : ''
            }`}
            data-testid={`roadmap-q${index + 1}`}
          >
            <CardContent className="p-6 text-center">
              {/* Quarter Header */}
              <div className="mb-4">
                <Badge 
                  className={`text-sm font-medium mb-3 ${getStatusColor(quarter.status)}`}
                  data-testid={`status-q${index + 1}`}
                >
                  {quarter.quarter}
                </Badge>
                <h3 className="text-lg font-semibold text-white" data-testid={`title-q${index + 1}`}>
                  {quarter.title}
                </h3>
              </div>

              {/* Status Icon */}
              <div className="text-2xl mb-2">
                {getStatusIcon(quarter.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}