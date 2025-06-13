import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

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
  const { toast } = useToast();
  
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

  // Game scoring (local only for demo)
  const saveGameScore = (scoreData: any) => {
    console.log("Game completed with score:", scoreData);
    toast({
      title: "Game Completed!",
      description: `Final Score: ${scoreData.score} points`,
    });
  };

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
    
    // Save game score locally
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
    
    saveGameScore(gameData);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      {/* Cosmic Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Gamepad className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                WordPlay Wars
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                size="sm"
                className="border-white/20 text-white/80 hover:bg-white/10 hover:border-white/40"
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
                          <span className="drop-shadow-lg text-white select-none">
                            {letter}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Answer Input Area */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-600/30 mb-6 backdrop-blur-sm">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="text-lg text-gray-300 font-medium">Your Answer:</div>
                        <div className="min-h-[60px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border-2 border-indigo-500/30 flex items-center justify-center px-4 py-3 text-2xl font-bold tracking-widest text-indigo-200 min-w-[300px] shadow-inner">
                          {answer || "Type your answer..."}
                        </div>
                        
                        <div className="flex space-x-4">
                          <Input
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                            placeholder="Enter your answer"
                            className="bg-slate-800/50 border-slate-600 text-white text-xl text-center font-bold tracking-wide focus:border-orange-500 focus:ring-orange-500/20"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                checkAnswer();
                              }
                            }}
                            disabled={showResult !== null}
                          />
                          <Button
                            onClick={checkAnswer}
                            disabled={!answer.trim() || showResult !== null}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-8 font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                          >
                            <Check className="w-5 h-5 mr-2" />
                            Submit
                          </Button>
                        </div>
                        
                        <Button
                          onClick={() => setAnswer("")}
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Result Feedback */}
                    {showResult && (
                      <div className="mb-6">
                        {showResult === "correct" ? (
                          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 shadow-lg shadow-green-500/20">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🎉</div>
                              <h3 className="text-2xl font-bold text-green-400 mb-2">Correct!</h3>
                              <p className="text-green-300">Great job! Moving to next round...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl p-6 shadow-lg shadow-red-500/20">
                            <div className="text-center">
                              <div className="text-4xl mb-2">❌</div>
                              <h3 className="text-2xl font-bold text-red-400 mb-2">Try Again!</h3>
                              <p className="text-red-300">That's not correct. Keep trying!</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Hints Panel */}
                <Card className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 border-purple-500/30 backdrop-blur-sm shadow-lg shadow-purple-500/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-purple-300">Hints Available</h3>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-purple-200">
                        {gameState.maxHints - gameState.hintsUsed}
                      </div>
                      <div className="text-purple-400">remaining</div>
                    </div>
                    <Button
                      onClick={useHint}
                      disabled={gameState.hintsUsed >= gameState.maxHints}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50"
                    >
                      Get Hint
                    </Button>
                  </CardContent>
                </Card>

                {/* Current Stats */}
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-slate-300">Current Game</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Words Solved:</span>
                        <span className="font-bold text-green-400">{gameState.correctAnswers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Hints Used:</span>
                        <span className="font-bold text-purple-400">{gameState.hintsUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Progress:</span>
                        <span className="font-bold text-blue-400">
                          {Math.round((gameState.currentRound / gameState.totalRounds) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-slate-300">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button
                        onClick={resetGame}
                        variant="outline"
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restart Game
                      </Button>
                      <Button
                        onClick={() => setLocation("/")}
                        variant="ghost"
                        className="w-full text-gray-400 hover:text-white"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Main Menu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}