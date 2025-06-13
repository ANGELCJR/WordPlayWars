import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad, Play, Users, RotateCcw, Link2, Zap, Trophy, User } from "lucide-react";

// Custom Game Icons
const AnagramIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="anagram-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff6b35" />
        <stop offset="100%" stopColor="#f7931e" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow)">
      <circle cx="32" cy="32" r="28" fill="url(#anagram-grad)" opacity="0.3"/>
      <text x="18" y="28" fontSize="16" fontWeight="bold" fill="white" className="animate-pulse">A</text>
      <text x="38" y="28" fontSize="16" fontWeight="bold" fill="white" className="animate-pulse" style={{animationDelay: '0.2s'}}>N</text>
      <text x="28" y="44" fontSize="16" fontWeight="bold" fill="white" className="animate-pulse" style={{animationDelay: '0.4s'}}>T</text>
      <path d="M 20,35 Q 32,25 44,35" stroke="white" strokeWidth="2" fill="none" strokeDasharray="4,2" className="animate-pulse"/>
    </g>
  </svg>
);

const WordLadderIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="ladder-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#14b8a6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    <g>
      <rect x="16" y="12" width="32" height="6" rx="3" fill="url(#ladder-grad)" className="animate-pulse"/>
      <rect x="16" y="22" width="32" height="6" rx="3" fill="url(#ladder-grad)" className="animate-pulse" style={{animationDelay: '0.3s'}}/>
      <rect x="16" y="32" width="32" height="6" rx="3" fill="url(#ladder-grad)" className="animate-pulse" style={{animationDelay: '0.6s'}}/>
      <rect x="16" y="42" width="32" height="6" rx="3" fill="url(#ladder-grad)" className="animate-pulse" style={{animationDelay: '0.9s'}}/>
      <path d="M 20,15 L 20,45" stroke="white" strokeWidth="3" fill="none"/>
      <path d="M 44,15 L 44,45" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="32" cy="8" r="3" fill="#fbbf24" className="animate-bounce"/>
    </g>
  </svg>
);

const SpeedTypeIcon = () => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <defs>
      <linearGradient id="speed-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <g>
      <circle cx="32" cy="32" r="26" fill="none" stroke="url(#speed-grad)" strokeWidth="4"/>
      <circle cx="32" cy="32" r="20" fill="none" stroke="white" strokeWidth="2" opacity="0.5"/>
      <circle cx="32" cy="32" r="14" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
      <line x1="32" y1="32" x2="32" y2="16" stroke="white" strokeWidth="3" strokeLinecap="round" className="animate-spin" style={{transformOrigin: '32px 32px', animationDuration: '2s'}}/>
      <circle cx="32" cy="32" r="3" fill="white"/>
      <text x="32" y="52" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle">WPM</text>
    </g>
  </svg>
);

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();
  const isAuthenticated = !!user;

  const gameModesData = [
    {
      id: "anagram",
      title: "Anagram Attack",
      description: "Unscramble letters to form words as fast as possible",
      icon: AnagramIcon,
      color: "game-coral",
      available: true,
    },
    {
      id: "word_ladder",
      title: "Word Ladder",
      description: "Transform words by changing one letter at a time",
      icon: WordLadderIcon,
      color: "game-teal",
      available: true,
    },
    {
      id: "speed_type",
      title: "Speed Type",
      description: "Type valid words as fast as you can in 60 seconds",
      icon: SpeedTypeIcon,
      color: "game-accent",
      available: true,
    },
  ];

  const handleQuickPlay = () => {
    setLocation("/game?mode=anagram");
  };

  const handleGameModeSelect = (mode: string) => {
    switch (mode) {
      case "anagram":
        setLocation(`/game?mode=${mode}`);
        break;
      case "word_ladder":
        setLocation("/word-ladder");
        break;
      case "speed_type":
        setLocation("/speed-type");
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
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
              <button 
                onClick={() => setLocation("/leaderboard")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Leaderboard
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <>
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
                      0 pts
                    </span>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="border-2 border-red-500 text-red-400 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all duration-300 bg-gray-800/50 backdrop-blur-sm"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setLocation("/auth")}
                  variant="outline"
                  size="sm"
                  className="border-2 border-purple-500 text-purple-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 bg-gray-800/50 backdrop-blur-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Enhanced animated background with gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse-slow opacity-20 blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full animate-bounce-slow opacity-25 blur-lg"></div>
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-spin-slow opacity-20 blur-lg"></div>
          <div className="absolute bottom-20 right-10 w-36 h-36 bg-gradient-to-br from-green-400 to-teal-500 rounded-full animate-pulse-slow opacity-15 blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-bounce-slow opacity-20 blur-md"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full animate-pulse-slow opacity-15 blur-xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-2xl">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
                WordPlay
              </span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"> Wars</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-semibold drop-shadow-lg">
              Battle opponents in real-time word puzzles. Unscramble, race, and dominate the leaderboard!
            </p>
          </div>
          
          <div className="flex justify-center mb-12">
            <Button
              onClick={handleQuickPlay}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 px-10 py-6 text-xl font-bold transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-purple-500/50 border-0 text-white"
              size="lg"
            >
              <Play className="w-6 h-6 mr-3" />
              Quick Play
            </Button>
          </div>
          
          {/* Game Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {gameModesData.map((mode) => {
              const IconComponent = mode.icon;
              const gradientColors = {
                "game-coral": "from-orange-400 to-red-500",
                "game-teal": "from-teal-400 to-cyan-500", 
                "game-accent": "from-yellow-400 to-amber-500"
              };
              return (
                <Card
                  key={mode.id}
                  className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border-2 border-gray-600/50 hover:border-transparent hover:shadow-2xl transition-all duration-500 cursor-pointer group transform hover:scale-105 ${
                    !mode.available ? "opacity-60 cursor-not-allowed" : "hover:shadow-purple-500/25"
                  }`}
                  onClick={() => mode.available && handleGameModeSelect(mode.id)}
                >
                  <CardContent className="p-8 text-center relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[mode.color as keyof typeof gradientColors]} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    <div className={`text-4xl mb-6 group-hover:scale-110 transition-all duration-500 relative z-10`}>
                      <div className="w-20 h-20 mx-auto">
                        <IconComponent />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white relative z-10">{mode.title}</h3>
                    <p className="text-gray-300 text-base leading-relaxed relative z-10">{mode.description}</p>
                    {!mode.available && (
                      <div className="mt-4 relative z-10">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-sm font-bold">Coming Soon</span>
                      </div>
                    )}
                    {mode.available && (
                      <div className="mt-4 relative z-10">
                        <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent text-sm font-bold">Available Now</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
