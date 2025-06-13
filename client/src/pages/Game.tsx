import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad, 
  Check, 
  RotateCcw, 
  Home, 
  Share, 
  Trophy, 
  Target, 
  Clock, 
  Zap 
} from "lucide-react";
import { generateAnagram } from "@/lib/gameLogic";
import { getRandomWord } from "@/lib/words";

interface GameState {
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  score: number;
  currentWord: string;
  scrambledLetters: string[];
  correctAnswers: Array<{
    word: string;
    time: number;
    points: number;
  }>;
  gameStarted: boolean;
  gameEnded: boolean;
  gameTimer: NodeJS.Timeout | null;
  hintsUsed: number;
  maxHints: number;
}

export default function Game() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalRounds: 5,
    timeRemaining: 60,
    score: 0,
    currentWord: "",
    scrambledLetters: [],
    correctAnswers: [],
    gameStarted: false,
    gameEnded: false,
    gameTimer: null,
    hintsUsed: 0,
    maxHints: 3,
  });
  
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);

  // Hint functionality
  const useHint = () => {
    if (gameState.hintsUsed < gameState.maxHints) {
      const currentHintNumber = gameState.hintsUsed + 1;
      let hintMessage = "";
      
      switch (currentHintNumber) {
        case 1:
          hintMessage = `The word starts with "${gameState.currentWord[0]}"`;
          break;
        case 2:
          hintMessage = `The word ends with "${gameState.currentWord[gameState.currentWord.length - 1]}"`;
          break;
        case 3:
          // Show the second letter as the final hint
          hintMessage = `The second letter is "${gameState.currentWord[1]}"`;
          break;
        default:
          hintMessage = `The word starts with "${gameState.currentWord[0]}"`;
      }
      
      setGameState(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1
      }));
      
      toast({
        title: `Hint ${currentHintNumber}`,
        description: hintMessage,
        duration: 4000,
      });
    }
  };

  // Letter clicking functionality
  const handleLetterClick = (letter: string) => {
    if (gameState.gameStarted && !gameState.gameEnded) {
      setAnswer(prev => prev + letter);
    }
  };

  // For demo purposes, we'll skip authentication
  // In a full version, this would redirect to login

  const saveGameScore = useMutation({
    mutationFn: async (scoreData: any) => {
      return await apiRequest("POST", "/api/game/score", scoreData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Score Saved!",
        description: "Your game results have been recorded.",
      });
    },
    onError: (error) => {
      // For demo purposes, just show the score locally without saving
      console.log("Score saving disabled for demo:", error);
    },
  });

  const startNewRound = useCallback(() => {
    const word = getRandomWord();
    const scrambled = generateAnagram(word);
    
    setGameState(prev => ({
      ...prev,
      currentWord: word,
      scrambledLetters: scrambled,
      timeRemaining: 60,
      hintsUsed: 0, // Reset hints for new round
    }));
    
    setAnswer("");
    setShowResult(null);
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      currentRound: 1,
      score: 0,
      correctAnswers: [],
      gameEnded: false,
    }));
    
    startNewRound();
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timer);
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    
    setGameState(prev => ({ ...prev, gameTimer: timer }));
  }, [startNewRound]);

  const endGame = useCallback(() => {
    if (gameState.gameTimer) {
      clearInterval(gameState.gameTimer);
    }
    
    setGameState(prev => ({ ...prev, gameEnded: true, gameTimer: null }));
    
    // Save game score (if user is authenticated)
    if (isAuthenticated) {
      const gameData = {
        gameMode: "anagram",
        score: gameState.score,
        wordsCorrect: gameState.correctAnswers.length,
        totalWords: gameState.totalRounds,
        averageTime: gameState.correctAnswers.length > 0 
          ? Math.round(gameState.correctAnswers.reduce((sum, answer) => sum + answer.time, 0) / gameState.correctAnswers.length * 1000)
          : 0,
        longestStreak: gameState.correctAnswers.length,
        gameData: {
          rounds: gameState.correctAnswers,
          totalRounds: gameState.totalRounds,
        },
      };
      
      saveGameScore.mutate(gameData);
    }
  }, [gameState, saveGameScore]);

  const nextRound = useCallback(() => {
    if (gameState.currentRound < gameState.totalRounds) {
      setGameState(prev => ({ ...prev, currentRound: prev.currentRound + 1 }));
      startNewRound();
      
      const timer = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            clearInterval(timer);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
      
      setGameState(prev => ({ ...prev, gameTimer: timer }));
    } else {
      endGame();
    }
  }, [gameState.currentRound, gameState.totalRounds, startNewRound, endGame]);

  useEffect(() => {
    if (gameState.timeRemaining === 0 && gameState.gameStarted && !gameState.gameEnded) {
      if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
      }
      setTimeout(() => {
        nextRound();
      }, 2000);
    }
  }, [gameState.timeRemaining, gameState.gameStarted, gameState.gameEnded, gameState.gameTimer, nextRound]);

  const checkAnswer = () => {
    const userAnswer = answer.toUpperCase().trim();
    
    if (userAnswer === gameState.currentWord) {
      const timeTaken = 60 - gameState.timeRemaining;
      const points = Math.max(100 - timeTaken * 2, 20);
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        correctAnswers: [
          ...prev.correctAnswers,
          {
            word: userAnswer,
            time: timeTaken,
            points: points,
          },
        ],
      }));
      
      setShowResult("correct");
      
      if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
      }
      
      setTimeout(() => {
        nextRound();
      }, 2000);
    } else {
      setShowResult("incorrect");
      setAnswer("");
      
      setTimeout(() => {
        setShowResult(null);
      }, 1500);
    }
  };

  const resetGame = () => {
    if (gameState.gameTimer) {
      clearInterval(gameState.gameTimer);
    }
    
    setGameState({
      currentRound: 1,
      totalRounds: 5,
      timeRemaining: 60,
      score: 0,
      currentWord: "",
      scrambledLetters: [],
      correctAnswers: [],
      gameStarted: false,
      gameEnded: false,
      gameTimer: null,
      hintsUsed: 0,
      maxHints: 3,
    });
    
    setAnswer("");
    setShowResult(null);
  };

  // Game works without authentication for demo purposes

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800/50 relative">
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
            
            <div className="flex items-center space-x-3">
              {user && (
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

      <div className="pt-20 pb-8 relative z-10">
        {!gameState.gameStarted ? (
          // Game Start Screen
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h2 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-2xl">
                <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  Anagram
                </span>
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent"> Attack</span>
              </h2>
              <p className="text-xl text-gray-300">
                Unscramble letters to form words as fast as possible!
              </p>
            </div>
            
            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-orange-500/30 mb-8 backdrop-blur-sm shadow-2xl shadow-orange-500/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">Game Rules</h3>
                <div className="text-left space-y-3 text-gray-300">
                  <p className="flex items-center"><span className="text-orange-400 mr-2">•</span> You have 60 seconds per round to solve each anagram</p>
                  <p className="flex items-center"><span className="text-pink-400 mr-2">•</span> Score more points by solving faster</p>
                  <p className="flex items-center"><span className="text-purple-400 mr-2">•</span> Complete {gameState.totalRounds} rounds to finish the game</p>
                  <p className="flex items-center"><span className="text-cyan-400 mr-2">•</span> Each correct answer adds to your streak</p>
                </div>
              </CardContent>
            </Card>
            
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-pink-500 hover:via-red-500 hover:to-orange-500 px-12 py-6 text-xl font-bold transition-all duration-500 transform hover:scale-110 shadow-2xl shadow-orange-500/50 animate-pulse hover:animate-none border-2 border-white/20"
              size="lg"
            >
              <Zap className="w-6 h-6 mr-3 animate-spin" />
              Start Attack!
            </Button>
          </div>
        ) : gameState.gameEnded ? (
          // Results Screen
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-4xl font-bold mb-2">Game Complete!</h2>
              <p className="text-xl text-gray-400">Great job!</p>
            </div>
            
            {/* Final Score */}
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6">Final Score</h3>
                <div className="text-6xl font-bold text-game-accent mb-4">
                  {gameState.score}
                </div>
                <p className="text-gray-400">points</p>
              </CardContent>
            </Card>
            
            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-game-primary" />
                  <div className="text-3xl font-bold text-game-primary mb-2">
                    {gameState.correctAnswers.length}
                  </div>
                  <div className="text-gray-400">Words Correct</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-game-secondary" />
                  <div className="text-3xl font-bold text-game-secondary mb-2">
                    {gameState.correctAnswers.length > 0
                      ? `${(gameState.correctAnswers.reduce((sum, answer) => sum + answer.time, 0) / gameState.correctAnswers.length).toFixed(1)}s`
                      : "N/A"
                    }
                  </div>
                  <div className="text-gray-400">Avg. Solve Time</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-game-accent" />
                  <div className="text-3xl font-bold text-game-accent mb-2">
                    {gameState.correctAnswers.length}
                  </div>
                  <div className="text-gray-400">Best Streak</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-secondary hover:to-game-primary px-8 py-3 font-semibold transition-all duration-300"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Play Again
              </Button>
              
              <Button
                variant="outline"
                className="border-2 border-game-primary text-game-primary hover:bg-game-primary hover:text-white px-8 py-3 font-semibold transition-all duration-300"
                disabled
              >
                <Share className="w-5 h-5 mr-2" />
                Share Results
              </Button>
              
              <Button
                onClick={() => setLocation("/")}
                variant="ghost"
                className="text-gray-400 hover:text-white px-8 py-3 font-semibold transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Main Menu
              </Button>
            </div>
          </div>
        ) : (
          // Gameplay Screen
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Game Header */}
            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-orange-500/30 mb-8 backdrop-blur-sm shadow-2xl shadow-orange-500/20">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                        Round {gameState.currentRound}
                      </div>
                      <div className="text-sm text-gray-400">
                        of {gameState.totalRounds}
                      </div>
                    </div>
                    
                    <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center relative shadow-lg shadow-red-500/50">
                      <span className="text-2xl font-bold text-red-400">
                        {gameState.timeRemaining}
                      </span>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-400 animate-spin"></div>
                    </div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-green-500/20 to-cyan-500/20 border border-green-500/30 rounded-lg px-6 py-3 shadow-lg shadow-green-500/20">
                    <div className="text-sm text-green-400">Score</div>
                    <div className="text-2xl font-bold text-green-300">
                      {gameState.score}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Progress 
                    value={(gameState.currentRound / gameState.totalRounds) * 100} 
                    className="h-3 bg-gray-700 rounded-full overflow-hidden"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Main Game Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-orange-500/30 backdrop-blur-sm shadow-2xl shadow-orange-500/20">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">Anagram Attack</h2>
                    <p className="text-gray-300 mb-8 text-lg">
                      Unscramble the letters to form a word
                    </p>
                    
                    {/* Scrambled Letters */}
                    <div className="flex justify-center space-x-4 mb-8 flex-wrap gap-y-4">
                      {gameState.scrambledLetters.map((letter, index) => (
                        <div
                          key={index}
                          onClick={() => handleLetterClick(letter)}
                          className="w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-orange-500/30 transform hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-white/10 hover:shadow-xl hover:shadow-orange-500/50 active:scale-95"
                        >
                          <span className="text-white drop-shadow-lg">{letter}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Answer Input */}
                    <div className="mb-8">
                      <Input
                        type="text"
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                        className="w-full max-w-lg mx-auto bg-gradient-to-r from-gray-700/90 to-gray-800/90 border-2 border-orange-500/50 text-2xl text-center text-white placeholder-gray-400 focus:border-orange-400 focus:shadow-lg focus:shadow-orange-400/30 rounded-xl py-4 backdrop-blur-sm"
                        autoFocus
                      />
                    </div>
                    
                    <Button
                      onClick={checkAnswer}
                      className="bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 hover:from-cyan-500 hover:via-emerald-500 hover:to-green-500 px-12 py-4 text-lg font-bold transition-all duration-500 transform hover:scale-110 shadow-2xl shadow-green-500/50 border-2 border-white/20 animate-pulse hover:animate-none"
                    >
                      <Check className="w-6 h-6 mr-3" />
                      Submit Answer
                    </Button>
                    
                    {/* Hint Button */}
                    <div className="mt-8 flex justify-center">
                      <Button
                        onClick={useHint}
                        disabled={gameState.hintsUsed >= gameState.maxHints || !gameState.gameStarted || gameState.gameEnded}
                        className={`px-8 py-3 text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-xl ${
                          gameState.hintsUsed >= gameState.maxHints 
                            ? "bg-gray-500 cursor-not-allowed opacity-50" 
                            : "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 shadow-yellow-500/50"
                        }`}
                      >
                        💡 Get Hint ({gameState.maxHints - gameState.hintsUsed} left)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Activity Feed */}
              <div>
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-purple-500/30 backdrop-blur-sm shadow-2xl shadow-purple-500/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Progress</h3>
                    
                    <div className="space-y-3 text-sm">
                      {gameState.correctAnswers.map((answer, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg">
                          <span className="text-green-300 font-semibold">{answer.word}</span>
                          <Badge className="bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold shadow-lg shadow-green-500/30">
                            +{answer.points}
                          </Badge>
                        </div>
                      ))}
                      
                      {gameState.correctAnswers.length === 0 && (
                        <div className="text-gray-400 text-center py-8 bg-gradient-to-r from-gray-700/30 to-gray-800/30 border border-gray-600/30 rounded-lg">
                          <span className="text-lg">🎯</span>
                          <div className="mt-2">No words solved yet</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        
        {/* Feedback Modal */}
        {showResult && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className={`px-8 py-4 rounded-xl text-xl font-bold transition-all duration-500 ${
              showResult === "correct" 
                ? "bg-game-success text-white" 
                : "bg-game-danger text-white"
            }`}>
              {showResult === "correct" ? "Correct! 🎉" : "Try again! 🤔"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
