import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle2,
  Gift,
  CalendarDays,
  TrendingUp,
  Loader2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type LoginHistoryItem = {
  id: number;
  userId: number;
  loginDate: string;
  dayNumber: number;
  streakComplete: boolean;
  rewardAmount: number;
  claimed: boolean;
  createdAt: string;
};

type LoginHistoryResponse = {
  currentStreak: number;
  history: LoginHistoryItem[];
  nextRewardAmount: number;
};

const LoginRewards: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(false);

  // Fetch login history
  const {
    data: loginData,
    isLoading,
    error,
    refetch
  } = useQuery<LoginHistoryResponse>({
    queryKey: ["/api/login-history"],
    retry: 1,
  });

  // Response type for claim reward
  interface ClaimRewardResponse {
    success: boolean;
    message?: string;
    rewardAmount: number;
  }

  // Claim reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: (loginHistoryId: number) => {
      setClaiming(true);
      return apiRequest<ClaimRewardResponse>("/api/claim-login-reward", "POST", { loginHistoryId });
    },
    onSuccess: (data) => {
      setClaiming(false);
      toast({
        title: "Reward Claimed!",
        description: data.message || `You've received ${data.rewardAmount} TON!`,
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/login-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      refetch();
    },
    onError: (error: any) => {
      setClaiming(false);
      toast({
        title: "Failed to claim reward",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle claim reward
  const handleClaimReward = (loginHistoryId: number) => {
    claimRewardMutation.mutate(loginHistoryId);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Daily Login Rewards
          </CardTitle>
          <CardDescription>Loading your login streak...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Login Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load your login history. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Check if there's an unclaimed reward available
  const hasUnclaimedReward = loginData?.history.some(item => !item.claimed);
  const firstUnclaimedReward = loginData?.history.find(item => !item.claimed);

  // Calculate progress to next streak milestone (7 days)
  const streakProgress = ((loginData?.currentStreak || 0) % 7) / 7 * 100;
  const daysToComplete = 7 - ((loginData?.currentStreak || 0) % 7);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" /> 
          Daily Login Rewards
        </CardTitle>
        <CardDescription>
          Log in daily to earn TON rewards. Complete a 7-day streak for bonus rewards!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current streak info */}
        <div className="rounded-lg bg-muted p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">Current Streak</span>
            </div>
            <Badge variant="outline" className="font-bold">
              {loginData?.currentStreak || 0} Day{(loginData?.currentStreak || 0) !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <Progress value={streakProgress} className="h-2 mb-2" />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{daysToComplete > 0 ? `${daysToComplete} day${daysToComplete !== 1 ? 's' : ''} to complete` : "Streak complete!"}</span>
            <span>Next reward: {loginData?.nextRewardAmount} TON</span>
          </div>
        </div>
        
        {/* Reward claim section */}
        {hasUnclaimedReward && firstUnclaimedReward && (
          <div className="rounded-lg bg-accent/20 p-4 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Gift className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <h4 className="font-medium">Day {firstUnclaimedReward.dayNumber} Reward Available!</h4>
                  <p className="text-sm text-muted-foreground">
                    {firstUnclaimedReward.rewardAmount} TON waiting for you
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => handleClaimReward(firstUnclaimedReward.id)}
                disabled={claiming}
                className="ml-2"
              >
                {claiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>Claim</>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Login history */}
        <div className="space-y-2 mt-4">
          <h4 className="font-medium text-sm">Recent Login History</h4>
          <div className="space-y-2">
            {loginData?.history.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-3">
                          <span className="text-xs font-medium">{item.dayNumber}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Day {item.dayNumber} of streak
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div>
                    <div className="text-sm font-medium">
                      {new Date(item.loginDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.rewardAmount} TON reward
                    </div>
                  </div>
                </div>
                <div>
                  {item.claimed ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Claimed
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleClaimReward(item.id)}
                      disabled={claiming}
                    >
                      {claiming ? <Loader2 className="h-3 w-3 animate-spin" /> : "Claim"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginRewards;