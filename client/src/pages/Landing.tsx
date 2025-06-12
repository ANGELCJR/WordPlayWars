import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad, Play, Users, RotateCcw, Link, Keyboard, Trophy, User } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const gameModesData = [
    {
      id: "anagram",
      title: "Anagram Attack",
      description: "Unscramble letters to form words as fast as possible",
      icon: RotateCcw,
      color: "game-coral",
      available: true,
    },
    {
      id: "word_ladder",
      title: "Word Ladder",
      description: "Transform words by changing one letter at a time",
      icon: Link,
      color: "game-teal",
      available: false,
    },
    {
      id: "speed_type",
      title: "Speed Type",
      description: "Type valid words as fast as you can in 60 seconds",
      icon: Keyboard,
      color: "game-accent",
      available: false,
    },
  ];

  const handleQuickPlay = () => {
    setLocation("/game?mode=anagram");
  };

  const handleGameModeSelect = (mode: string) => {
    if (mode === "anagram") {
      setLocation(`/game?mode=${mode}`);
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
              ) : (
                <Button
                  onClick={() => window.location.href = "/api/login"}
                  variant="outline"
                  size="sm"
                  className="border-game-primary text-game-primary hover:bg-game-primary hover:text-white"
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
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-game-primary rounded-full animate-pulse-slow"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-game-secondary rounded-full animate-bounce-slow"></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-game-coral rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-game-teal rounded-full animate-pulse-slow"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-game-primary via-game-secondary to-game-coral bg-clip-text text-transparent">
                WordPlay
              </span>
              <span className="text-white"> Wars</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Battle opponents in real-time word puzzles. Unscramble, race, and dominate the leaderboard!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={handleQuickPlay}
              className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-secondary hover:to-game-primary px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Quick Play
            </Button>
            <Button
              variant="outline"
              className="border-2 border-game-primary text-game-primary hover:bg-game-primary hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
              size="lg"
              disabled
            >
              <Users className="w-5 h-5 mr-2" />
              Multiplayer (Coming Soon)
            </Button>
          </div>
          
          {/* Game Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {gameModesData.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <Card
                  key={mode.id}
                  className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-game-primary transition-all duration-300 cursor-pointer group ${
                    !mode.available ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => mode.available && handleGameModeSelect(mode.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`text-3xl mb-4 text-${mode.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{mode.title}</h3>
                    <p className="text-gray-400 text-sm">{mode.description}</p>
                    {!mode.available && (
                      <p className="text-game-accent text-xs mt-2 font-semibold">Coming Soon</p>
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
