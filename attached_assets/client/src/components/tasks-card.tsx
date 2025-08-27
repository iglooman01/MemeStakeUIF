import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
  link?: string;
}

interface TasksCardProps {
  isEmailVerified: boolean;
  allTasksCompleted: boolean;
  onTasksComplete: (completed: boolean) => void;
  airdropClaimed: boolean;
  onAirdropClaim: (claimed: boolean) => void;
}

export function TasksCard({ 
  isEmailVerified, 
  allTasksCompleted, 
  onTasksComplete, 
  airdropClaimed, 
  onAirdropClaim 
}: TasksCardProps) {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, boolean>>({
    "1": false,
    "2": false,
    "3": false,
    "4": false,
    "5": false
  });

  const tasks: Task[] = [
    { 
      id: "1", 
      title: "Join our Telegram", 
      description: "Join our main community chat", 
      reward: "+250 MEMES", 
      completed: false,
      link: "https://t.me/memestake"
    },
    { 
      id: "2", 
      title: "Join our Telegram Channel", 
      description: "Stay updated with announcements", 
      reward: "+150 MEMES", 
      completed: false,
      link: "https://t.me/memestake_updates"
    },
    { 
      id: "3", 
      title: "Follow on Twitter", 
      description: "Follow @MemeStake for updates", 
      reward: "+200 MEMES", 
      completed: false,
      link: "https://twitter.com/memestake"
    },
    { 
      id: "4", 
      title: "Subscribe our YouTube Channel", 
      description: "Subscribe for video content", 
      reward: "+300 MEMES", 
      completed: false,
      link: "https://youtube.com/@memestake"
    },
    { 
      id: "5", 
      title: "Join our Discord", 
      description: "Connect with the community", 
      reward: "+200 MEMES", 
      completed: false,
      link: "https://discord.gg/memestake"
    },
  ];

  // Use dynamic task completion status
  const updatedTasks = tasks.map(task => ({
    ...task,
    completed: taskStatuses[task.id] || task.completed
  }));
  
  const completedTasks = updatedTasks.filter(task => task.completed).length;
  const progressPercentage = (completedTasks / updatedTasks.length) * 100;
  const totalRewards = updatedTasks.filter(task => task.completed)
    .reduce((total, task) => total + parseInt(task.reward.replace(/[^0-9]/g, '')), 0);

  // Check if all tasks are completed
  const allTasksDone = completedTasks === updatedTasks.length;
  
  // Update parent state when tasks change
  useEffect(() => {
    if (allTasksDone !== allTasksCompleted) {
      onTasksComplete(allTasksDone);
    }
  }, [allTasksDone, allTasksCompleted, onTasksComplete]);

  // Determine claim eligibility and button state
  const canClaimAirdrop = isEmailVerified && allTasksDone && !airdropClaimed;
  
  const getClaimButtonText = () => {
    if (airdropClaimed) return "Airdrop Claimed ✅";
    if (!isEmailVerified) return "Email Verification Required";
    if (!allTasksDone) return "Complete All Tasks First";
    return "🎉 Claim Airdrop Now";
  };

  const getErrorMessage = () => {
    if (!isEmailVerified) return "❌ Please verify your email to continue.";
    if (!allTasksDone) return "⚠️ To get your airdrop, please complete all social media tasks.";
    return null;
  };

  const handleClaimNow = () => {
    if (canClaimAirdrop) {
      onAirdropClaim(true);
      console.log("🎉 Congratulations! You have received 500 MEME tokens.");
    }
  };

  const handleTaskClick = (taskId: string, link?: string) => {
    if (link) {
      window.open(link, '_blank');
      // Mark task as completed after opening link
      setTimeout(() => {
        setTaskStatuses(prev => ({ ...prev, [taskId]: true }));
      }, 1000); // Small delay to simulate user completing the task
    }
  };

  return (
    <div className="glass-card rounded-xl p-6" data-testid="tasks-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Complete Your Tasks</h2>
        <div className="text-sm">
          <span className="text-accent font-medium" data-testid="text-completed-count">{completedTasks}/{updatedTasks.length}</span>
          <span className="text-muted-foreground"> completed</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-accent font-medium" data-testid="text-progress-percentage">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" data-testid="progress-tasks" />
      </div>
      
      {/* Rewards summary */}
      <div className="bg-muted/50 rounded-lg p-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Earned Rewards</span>
          <span className="font-semibold text-secondary" data-testid="text-total-rewards">+{totalRewards.toLocaleString()} MEMES</span>
        </div>
      </div>
      
      {/* Task list */}
      <div className="space-y-3 mb-6">
        {updatedTasks.map((task) => (
          <div 
            key={task.id} 
            className="border border-border rounded-lg p-4 hover:border-accent/50 transition-colors cursor-pointer"
            onClick={() => handleTaskClick(task.id, task.link)}
            data-testid={`task-${task.id}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-foreground">{task.title}</span>
                  {task.completed && <span className="text-secondary text-sm">✓</span>}
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.completed 
                    ? 'status-pill' 
                    : 'bg-muted text-muted-foreground border border-border'
                }`} data-testid={`status-${task.id}`}>
                  {task.completed ? 'Completed' : 'Pending'}
                </span>
                <div className="text-xs text-secondary mt-1" data-testid={`reward-${task.id}`}>
                  {task.reward}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Error Message */}
      {getErrorMessage() && (
        <Alert className="mb-4 border-yellow-500/50 bg-yellow-500/10" data-testid="airdrop-error-message">
          <AlertDescription className="text-yellow-200">
            {getErrorMessage()}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {airdropClaimed && (
        <Alert className="mb-4 border-secondary/50 bg-secondary/10" data-testid="airdrop-success-message">
          <AlertDescription className="text-secondary">
            🎉 Congratulations! You have received 500 MEME tokens.
          </AlertDescription>
        </Alert>
      )}

      {/* Claim button */}
      <Button 
        onClick={handleClaimNow}
        className={`w-full py-4 rounded-lg text-lg font-semibold transition-all ${
          canClaimAirdrop 
            ? 'gradient-button transform hover:scale-105 shadow-lg' 
            : airdropClaimed
            ? 'bg-secondary/20 text-secondary cursor-not-allowed'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
        disabled={!canClaimAirdrop}
        data-testid="button-claim-airdrop"
      >
        {getClaimButtonText()}
      </Button>
    </div>
  );
}