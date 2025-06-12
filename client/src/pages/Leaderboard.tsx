import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad, Home, Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  stats: {
    totalScore: number;
    bestScore: number;
    totalGames: number;
    currentStreak: number;
    longestStreak: number;
    totalWordsCorrect: number;
  };
  rank: number;
}

export default function Leaderboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: leaderboard, isLoading, error } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
    retry: 2,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-game-accent">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-l-yellow-500 bg-yellow-500/10";
      case 2:
        return "border-l-gray-400 bg-gray-400/10";
      case 3:
        return "border-l-amber-600 bg-amber-600/10";
      default:
        return "border-l-gray-600";
    }
  };

  const getUserInitials = (user: LeaderboardEntry['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user.firstName) {
      return user.firstName[0];
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = (user: LeaderboardEntry['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.email) {
      return user.email.split("@")[0];
    }
    return "Unknown User";
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return isAuthenticated && user && entry.user.id === user.id;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-game-primary to-game-secondary rounded-lg flex items-center justify-center">
                <Gamepad className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
                WordPlay Wars
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setLocation("/")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Play
              </button>
              <button className="text-white font-semibold">
                Leaderboard
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {isAuthenticated && user && (
                <div className="hidden sm:flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
                  <div className="w-6 h-6 bg-game-teal rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">
                      {user.firstName?.[0] || user.email?.[0] || "U"}
                    </span>
                  </div>
                  <span className="text-sm text-gray-300">
                    {user.firstName || user.email?.split("@")[0] || "User"}
                  </span>
                  <span className="text-xs text-game-accent">
                    {user.stats?.totalScore || 0} pts
                  </span>
                </div>
              )}
              
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Global Leaderboard</h2>
            <p className="text-gray-400">Top players from around the world</p>
          </div>
          
          {/* Time Filter - Static for now */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-xl p-2 border border-gray-700">
              <Button
                variant="default"
                size="sm"
                className="bg-game-primary text-white font-semibold"
              >
                All Time
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                disabled
              >
                Weekly
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                disabled
              >
                Daily
              </Button>
            </div>
          </div>
          
          {/* Leaderboard List */}
          <Card className="bg-gray-800 border-gray-700 overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-primary mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading leaderboard...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-400 mb-4">Failed to load leaderboard</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              ) : !leaderboard || leaderboard.length === 0 ? (
                <div className="p-8 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">No scores yet!</p>
                  <p className="text-sm text-gray-500">Be the first to play and set a high score.</p>
                  <Button
                    onClick={() => setLocation("/game?mode=anagram")}
                    className="mt-4 bg-gradient-to-r from-game-primary to-game-secondary"
                  >
                    Start Playing
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.user.id}
                      className={`flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors border-l-4 ${
                        getRankColor(entry.rank)
                      } ${isCurrentUser(entry) ? "bg-game-primary/10" : ""}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(entry.rank)}
                        </div>
                        
                        <div className="w-10 h-10 bg-gradient-to-br from-game-primary to-game-secondary rounded-full flex items-center justify-center">
                          <span className="font-bold text-sm">
                            {getUserInitials(entry.user)}
                          </span>
                        </div>
                        
                        <div>
                          <div className="font-semibold flex items-center space-x-2">
                            <span>{getUserDisplayName(entry.user)}</span>
                            {isCurrentUser(entry) && (
                              <Badge variant="outline" className="text-xs border-game-primary text-game-primary">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center space-x-3">
                            <span>{entry.stats.totalGames} games</span>
                            {entry.stats.currentStreak > 0 && (
                              <span className="text-game-accent">
                                {entry.stats.currentStreak} streak
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-game-accent">
                          {entry.stats.bestScore.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">best score</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Stats Summary */}
          {leaderboard && leaderboard.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-400">
              <p>
                Showing {leaderboard.length} player{leaderboard.length !== 1 ? "s" : ""} • 
                Total games played: {leaderboard.reduce((sum, entry) => sum + entry.stats.totalGames, 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
