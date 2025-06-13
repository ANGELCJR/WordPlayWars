import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad, Play, Users, RotateCcw, Link2, Zap, Trophy } from "lucide-react";

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
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <g>
      <circle cx="32" cy="32" r="26" fill="none" stroke="url(#speed-grad)" strokeWidth="4" strokeDasharray="8,4" className="animate-spin"/>
      <rect x="20" y="28" width="24" height="8" rx="4" fill="url(#speed-grad)" className="animate-pulse"/>
      <circle cx="16" cy="32" r="2" fill="#fbbf24" className="animate-ping"/>
      <circle cx="48" cy="32" r="2" fill="#fbbf24" className="animate-ping" style={{animationDelay: '0.5s'}}/>
    </g>
  </svg>
);

export default function Landing() {
  const [, setLocation] = useLocation();

  const gameModes = [
    {
      id: "anagram",
      title: "Anagram Attack",
      description: "Unscramble letters to form words as fast as you can!",
      icon: <AnagramIcon />,
      color: "from-orange-500 to-red-500",
      stats: "🎯 Word Puzzles",
      available: true,
    },
    {
      id: "word_ladder",
      title: "Word Ladder",
      description: "Transform one word into another by changing one letter at a time.",
      icon: <WordLadderIcon />,
      color: "from-teal-500 to-cyan-500",
      stats: "🔗 Logic Challenge",
      available: true,
    },
    {
      id: "speed_type",
      title: "Speed Type",
      description: "Type words as fast and accurately as possible!",
      icon: <SpeedTypeIcon />,
      color: "from-purple-500 to-pink-500",
      stats: "⚡ Speed Challenge",
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
            
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setLocation("/leaderboard")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/40 to-teal-900/30"></div>
        
        {/* Floating Circles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>

        {/* Orbiting Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 border border-purple-500/20 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
            <div className="absolute top-8 left-8 w-80 h-80 border border-teal-500/20 rounded-full animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
            <div className="absolute top-16 left-16 w-64 h-64 border border-blue-500/20 rounded-full animate-spin" style={{animationDuration: '25s'}}></div>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="space-y-8">
            <div className="space-y-6">
              {/* Animated WordPlay Wars Title */}
              <div className="relative">
                <h2 className="text-6xl md:text-8xl font-bold leading-tight">
                  <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                    Word
                  </span>
                  <span className="inline-block bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent animate-pulse" style={{animationDelay: '0.5s'}}>
                    Play
                  </span>
                  <br />
                  <span className="inline-block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent animate-pulse" style={{animationDelay: '1s'}}>
                    Wars
                  </span>
                </h2>
                
                {/* Glowing effect behind text */}
                <div className="absolute inset-0 -z-10">
                  <h2 className="text-6xl md:text-8xl font-bold leading-tight blur-2xl opacity-30">
                    <span className="inline-block text-purple-400">Word</span>
                    <span className="inline-block text-teal-400">Play</span>
                    <br />
                    <span className="inline-block text-orange-400">Wars</span>
                  </h2>
                </div>
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Challenge your mind with anagram puzzles, compete with players worldwide, 
                and climb the leaderboard
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleQuickPlay}
                size="lg"
                className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/80 hover:to-game-secondary/80 text-white border-0 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-game-primary/25 transition-all duration-300 transform hover:scale-105"
              >
                <Play className="mr-2 h-5 w-5" />
                Quick Play
              </Button>
              
              <Button 
                onClick={() => setLocation("/leaderboard")}
                variant="outline" 
                size="lg"
                className="border-2 border-game-accent text-game-accent hover:bg-game-accent hover:text-gray-900 px-8 py-6 text-lg font-semibold bg-gray-800/50 backdrop-blur-sm transition-all duration-300"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Challenge
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Test your skills across different word game modes, each offering unique challenges and rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {gameModes.map((mode) => (
              <Card 
                key={mode.id}
                className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 group cursor-pointer backdrop-blur-sm"
                onClick={() => handleGameModeSelect(mode.id)}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <div className="w-20 h-20 mx-auto">
                      {mode.icon}
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-white mb-3">
                    {mode.title}
                  </h4>
                  
                  <p className="text-gray-400 mb-4 text-base leading-relaxed">
                    {mode.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <span className="text-sm text-gray-500">{mode.stats}</span>
                  </div>
                  
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGameModeSelect(mode.id);
                    }}
                    className={`w-full bg-gradient-to-r ${mode.color} hover:opacity-90 text-white border-0 font-semibold py-3 transition-all duration-300 transform group-hover:scale-105`}
                    disabled={!mode.available}
                  >
                    {mode.available ? 'Play Now' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why WordPlay Wars?
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              More than just word games - it's a complete brain training experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-game-primary to-game-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Fast-Paced</h4>
              <p className="text-gray-400">Quick rounds that fit your schedule</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-game-secondary to-game-accent rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Competitive</h4>
              <p className="text-gray-400">Challenge players from around the world</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-game-accent to-game-teal rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Rewarding</h4>
              <p className="text-gray-400">Climb leaderboards and earn achievements</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-game-teal to-game-primary rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Endless</h4>
              <p className="text-gray-400">New challenges every time you play</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-3xl p-12 backdrop-blur-sm border border-gray-600">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Test Your Word Skills?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of players in the ultimate word game challenge. 
              Start playing now and see how you rank!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleQuickPlay}
                size="lg"
                className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/80 hover:to-game-secondary/80 text-white border-0 px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Playing Now
              </Button>
              
              <Button 
                onClick={() => setLocation("/leaderboard")}
                variant="outline" 
                size="lg"
                className="border-2 border-gray-400 text-gray-300 hover:bg-gray-400 hover:text-gray-900 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                <Trophy className="mr-2 h-5 w-5" />
                View Leaderboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-game-primary to-game-secondary rounded-lg flex items-center justify-center">
                <Gamepad className="text-white w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
                WordPlay Wars
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              The ultimate word game experience for players of all skill levels.
            </p>
            <div className="flex justify-center space-x-6">
              <button 
                onClick={() => setLocation("/leaderboard")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}