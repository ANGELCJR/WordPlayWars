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
  });
  
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);

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
    });
    
    setAnswer("");
    setShowResult(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-game-primary mx-auto mb-4"></div>
          <p className="text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

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

      <div className="pt-20 pb-8">
        {!gameState.gameStarted ? (
          // Game Start Screen
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4">Anagram Attack</h2>
              <p className="text-xl text-gray-300">
                Unscramble letters to form words as fast as possible!
              </p>
            </div>
            
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Game Rules</h3>
                <div className="text-left space-y-3 text-gray-300">
                  <p>• You have 60 seconds per round to solve each anagram</p>
                  <p>• Score more points by solving faster</p>
                  <p>• Complete {gameState.totalRounds} rounds to finish the game</p>
                  <p>• Each correct answer adds to your streak</p>
                </div>
              </CardContent>
            </Card>
            
            <Button
              onClick={startGame}
              className="bg-gradient-to-r from-game-success to-game-teal hover:from-game-teal hover:to-game-success px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Start Game
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
            <Card className="bg-gray-800 border-gray-700 mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-game-accent">
                        Round {gameState.currentRound}
                      </div>
                      <div className="text-sm text-gray-400">
                        of {gameState.totalRounds}
                      </div>
                    </div>
                    
                    <div className="w-16 h-16 rounded-full border-4 border-game-danger flex items-center justify-center relative">
                      <span className="text-2xl font-bold text-game-danger">
                        {gameState.timeRemaining}
                      </span>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-game-danger animate-spin"></div>
                    </div>
                  </div>
                  
                  <div className="text-center bg-gray-700 rounded-lg px-6 py-3">
                    <div className="text-sm text-gray-400">Score</div>
                    <div className="text-2xl font-bold text-game-success">
                      {gameState.score}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Progress 
                    value={(gameState.currentRound / gameState.totalRounds) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Main Game Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">Anagram Attack</h2>
                    <p className="text-gray-400 mb-8">
                      Unscramble the letters to form a word
                    </p>
                    
                    {/* Scrambled Letters */}
                    <div className="flex justify-center space-x-3 mb-8 flex-wrap gap-y-3">
                      {gameState.scrambledLetters.map((letter, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 bg-gradient-to-br from-game-primary to-game-secondary rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg transform hover:scale-105 transition-transform cursor-pointer"
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                    
                    {/* Answer Input */}
                    <div className="mb-6">
                      <Input
                        type="text"
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === "Enter" && checkAnswer()}
                        className="w-full max-w-md mx-auto bg-gray-700 border-2 border-gray-600 text-xl text-center text-white placeholder-gray-400 focus:border-game-primary"
                        autoFocus
                      />
                    </div>
                    
                    <Button
                      onClick={checkAnswer}
                      className="bg-gradient-to-r from-game-success to-game-teal hover:from-game-teal hover:to-game-success px-8 py-3 font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Submit Answer
                    </Button>
                    
                    {/* Hint */}
                    <div className="mt-6 text-gray-400">
                      💡 Hint: {gameState.currentWord.length} letters
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Activity Feed */}
              <div>
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4">Progress</h3>
                    
                    <div className="space-y-3 text-sm">
                      {gameState.correctAnswers.map((answer, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-300">{answer.word}</span>
                          <Badge variant="secondary" className="bg-game-success text-white">
                            +{answer.points}
                          </Badge>
                        </div>
                      ))}
                      
                      {gameState.correctAnswers.length === 0 && (
                        <div className="text-gray-400 text-center py-4">
                          No words solved yet
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
