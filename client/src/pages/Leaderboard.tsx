import { useLocation } from "wouter";
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

  // Mock leaderboard data for demo
  const leaderboard: LeaderboardEntry[] = [
    {
      user: { id: "1", email: "alex@example.com", firstName: "Alex" },
      stats: { totalScore: 2850, bestScore: 450, totalGames: 12, currentStreak: 5, longestStreak: 8, totalWordsCorrect: 85 },
      rank: 1
    },
    {
      user: { id: "2", email: "jordan@example.com", firstName: "Jordan" },
      stats: { totalScore: 2640, bestScore: 420, totalGames: 15, currentStreak: 3, longestStreak: 6, totalWordsCorrect: 78 },
      rank: 2
    },
    {
      user: { id: "3", email: "casey@example.com", firstName: "Casey" },
      stats: { totalScore: 2450, bestScore: 380, totalGames: 18, currentStreak: 2, longestStreak: 7, totalWordsCorrect: 72 },
      rank: 3
    },
    {
      user: { id: "4", email: "sam@example.com", firstName: "Sam" },
      stats: { totalScore: 2280, bestScore: 350, totalGames: 14, currentStreak: 1, longestStreak: 5, totalWordsCorrect: 68 },
      rank: 4
    },
    {
      user: { id: "5", email: "taylor@example.com", firstName: "Taylor" },
      stats: { totalScore: 2150, bestScore: 340, totalGames: 16, currentStreak: 0, longestStreak: 4, totalWordsCorrect: 64 },
      rank: 5
    },
    {
      user: { id: "6", email: "morgan@example.com", firstName: "Morgan" },
      stats: { totalScore: 1980, bestScore: 320, totalGames: 13, currentStreak: 2, longestStreak: 6, totalWordsCorrect: 59 },
      rank: 6
    },
    {
      user: { id: "7", email: "riley@example.com", firstName: "Riley" },
      stats: { totalScore: 1850, bestScore: 310, totalGames: 11, currentStreak: 1, longestStreak: 3, totalWordsCorrect: 55 },
      rank: 7
    },
    {
      user: { id: "8", email: "avery@example.com", firstName: "Avery" },
      stats: { totalScore: 1720, bestScore: 295, totalGames: 9, currentStreak: 0, longestStreak: 4, totalWordsCorrect: 51 },
      rank: 8
    }
  ];
  const isLoading = false;
  const error = null;

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
        return "border-l-game-primary bg-game-primary/5";
    }
  };

  const getUserAvatar = (user: LeaderboardEntry['user']) => {
    if (user.profileImageUrl) {
      return (
        <img
          src={user.profileImageUrl}
          alt={`${getUserDisplayName(user)}'s avatar`}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
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
    return false; // No user authentication in demo mode
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

      {/* Main Content */}
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-game-primary to-game-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              See how you stack up against other word warriors!
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="bg-gray-800 rounded-lg h-20 mb-4"></div>
                <div className="bg-gray-800 rounded-lg h-16 mb-4"></div>
                <div className="bg-gray-800 rounded-lg h-16 mb-4"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-red-400 font-semibold mb-2">Unable to Load Leaderboard</h3>
                <p className="text-gray-400 text-sm">
                  Please try again later or check your connection.
                </p>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {!isLoading && !error && leaderboard && (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-game-primary mb-2">
                      {leaderboard.length}
                    </div>
                    <div className="text-gray-400">Total Players</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-game-secondary mb-2">
                      {leaderboard[0]?.stats.totalScore || 0}
                    </div>
                    <div className="text-gray-400">Highest Score</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-game-accent mb-2">
                      {Math.round(leaderboard.reduce((sum, entry) => sum + entry.stats.totalScore, 0) / leaderboard.length)}
                    </div>
                    <div className="text-gray-400">Average Score</div>
                  </CardContent>
                </Card>
              </div>

              {/* Leaderboard List */}
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <Card 
                    key={entry.user.id} 
                    className={`bg-gray-800 border-gray-700 border-l-4 ${getRankColor(entry.rank)} ${
                      isCurrentUser(entry) ? 'ring-2 ring-game-primary' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(entry.rank)}
                          </div>

                          {/* Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-game-primary to-game-secondary rounded-full flex items-center justify-center text-white font-bold">
                            {typeof getUserAvatar(entry.user) === 'string' ? (
                              getUserAvatar(entry.user)
                            ) : (
                              getUserAvatar(entry.user)
                            )}
                          </div>

                          {/* User Info */}
                          <div>
                            <div className="font-semibold text-white flex items-center space-x-2">
                              <span>{getUserDisplayName(entry.user)}</span>
                              {isCurrentUser(entry) && (
                                <Badge variant="outline" className="text-xs border-game-primary text-game-primary">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              {entry.stats.totalGames} games played
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-8">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-game-primary">
                              {entry.stats.totalScore.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">Total Score</div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-game-secondary">
                              {entry.stats.bestScore}
                            </div>
                            <div className="text-xs text-gray-400">Best Score</div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-game-accent">
                              {entry.stats.longestStreak}
                            </div>
                            <div className="text-xs text-gray-400">Best Streak</div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-game-teal">
                              {Math.round((entry.stats.totalWordsCorrect / (entry.stats.totalGames * 5)) * 100)}%
                            </div>
                            <div className="text-xs text-gray-400">Accuracy</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center py-12">
                <Card className="bg-gradient-to-r from-game-primary/10 to-game-secondary/10 border-game-primary/20 max-w-md mx-auto">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Ready to Climb the Ranks?
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Play more games to improve your score and move up the leaderboard!
                    </p>
                    <Button
                      onClick={() => setLocation("/")}
                      className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/90 hover:to-game-secondary/90 text-white w-full"
                    >
                      Start Playing
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}