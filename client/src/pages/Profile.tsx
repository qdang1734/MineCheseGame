import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "../components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Gem, 
  Shell, 
  Trophy, 
  User as UserIcon, 
  Loader2, 
  CalendarCheck 
} from "lucide-react";
import LoginRewards from "../components/LoginRewards";

type User = {
  id: number;
  username: string;
  balance: number;
  totalReward: number;
  rank: string;
  totalEggs: number;
  openedEggs: number;
  avatar?: string;
  telegramUsername?: string;
  totalLogins?: number;
  loginStreak?: number;
};

const Profile: React.FC = () => {
  // Fetch user data
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header title="Profile" />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header title="Profile" />
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  // Format username with @ if it's a Telegram username
  const displayName = user.telegramUsername 
    ? `@${user.telegramUsername}` 
    : user.username;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Header title="Profile" />
      
      <div className="mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="bg-primary/10 text-2xl font-bold">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
                  {displayName}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {user.rank}
                  </Badge>
                </h2>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                  <div className="flex items-center text-muted-foreground">
                    <Shell className="h-4 w-4 mr-1" />
                    <span className="text-sm">{user.balance?.toFixed(2) || "0"} TON</span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="text-sm">Total earnings: {user.totalReward?.toFixed(2) || "0"} TON</span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Gem className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {user.openedEggs || 0}/{user.totalEggs || 0} eggs opened
                    </span>
                  </div>
                  
                  {user.loginStreak !== undefined && (
                    <div className="flex items-center text-muted-foreground">
                      <CalendarCheck className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {user.loginStreak} day streak
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Daily Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>User Stats</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="rewards" className="space-y-4">
          <LoginRewards />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">Total Logins</span>
                  <Badge variant="secondary">{user.totalLogins || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">Current Streak</span>
                  <Badge variant="secondary">{user.loginStreak || 0} days</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">Eggs Owned</span>
                  <Badge variant="secondary">{user.totalEggs || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">Eggs Opened</span>
                  <Badge variant="secondary">{user.openedEggs || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;