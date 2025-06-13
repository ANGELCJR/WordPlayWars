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
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    return () => {
      if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
      }
    };
  }, [gameState.gameTimer]);

  const resetGame = useCallback(() => {
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
    setShowHint(false);
  }, [gameState.gameTimer]);

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
    }));
    
    setAnswer("");
    setShowHint(false);
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameStarted: true }));
    startNewRound();
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
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
    } else {
      endGame();
    }
  }, [gameState.currentRound, gameState.totalRounds, startNewRound, endGame]);

  useEffect(() => {
    if (gameState.timeRemaining === 0 && gameState.gameStarted && !gameState.gameEnded) {
      endGame();
    }
  }, [gameState.timeRemaining, gameState.gameStarted, gameState.gameEnded, endGame]);

  const checkAnswer = useCallback(() => {
    const userAnswer = answer.toLowerCase().trim();
    const correctAnswer = gameState.currentWord.toLowerCase();
    
    if (userAnswer === correctAnswer) {
      const timeBonus = Math.max(0, gameState.timeRemaining * 10);
      const basePoints = 100;
      const totalPoints = basePoints + timeBonus;
      
      const newAnswer = {
        word: gameState.currentWord,
        time: 60 - gameState.timeRemaining,
        points: totalPoints,
      };
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + totalPoints,
        correctAnswers: [...prev.correctAnswers, newAnswer],
      }));
      
      toast({
        title: "Correct! 🎉",
        description: `+${totalPoints} points (${basePoints} base + ${timeBonus} time bonus)`,
      });
      
      setTimeout(() => {
        nextRound();
      }, 1500);
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
        variant: "destructive",
      });
      setAnswer("");
    }
  }, [answer, gameState.currentWord, gameState.timeRemaining, nextRound, toast]);

  const useHint = useCallback(() => {
    if (gameState.hintsUsed < gameState.maxHints && !showHint) {
      setShowHint(true);
      setGameState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    }
  }, [gameState.hintsUsed, gameState.maxHints, showHint]);

  const shareScore = () => {
    const text = `I just scored ${gameState.score} points in WordPlay Wars! 🎮\n\nCorrect answers: ${gameState.correctAnswers.length}/${gameState.totalRounds}\nPlay now and beat my score!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'WordPlay Wars Score',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: "Score copied!",
        description: "Share your achievement with friends",
      });
    }
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
          
          {!gameState.gameStarted && !gameState.gameEnded && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-game-primary to-game-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <Target className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
                  Anagram Attack
                </h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  Unscramble the letters to form the correct word as fast as you can! 
                  Earn bonus points for speed and accuracy.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-game-primary/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Target className="w-6 h-6 text-game-primary" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">5 Rounds</h3>
                    <p className="text-sm text-gray-400">Challenge yourself with increasing difficulty</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-game-secondary/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-game-secondary" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">60 Seconds</h3>
                    <p className="text-sm text-gray-400">Beat the clock for bonus points</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-game-accent/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-game-accent" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Speed Bonus</h3>
                    <p className="text-sm text-gray-400">Faster solutions = higher scores</p>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/90 hover:to-game-secondary/90 text-white px-8 py-3 text-lg font-semibold"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameState.gameStarted && !gameState.gameEnded && (
            <div className="py-8">
              {/* Game Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-6">
                  <Badge variant="outline" className="text-game-primary border-game-primary">
                    Round {gameState.currentRound}/{gameState.totalRounds}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-game-accent" />
                    <span className="text-xl font-bold text-game-accent">{gameState.score}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-game-secondary" />
                    <span className="text-xl font-bold text-game-secondary">{gameState.timeRemaining}s</span>
                  </div>
                  <Button
                    onClick={useHint}
                    disabled={gameState.hintsUsed >= gameState.maxHints || showHint}
                    variant="outline"
                    size="sm"
                    className="border-game-teal text-game-teal hover:bg-game-teal hover:text-gray-900"
                  >
                    Hint ({gameState.maxHints - gameState.hintsUsed} left)
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <Progress 
                  value={(gameState.timeRemaining / 60) * 100} 
                  className="h-3 bg-gray-800"
                />
              </div>

              {/* Game Area */}
              <Card className="bg-gray-800 border-gray-700 mb-6">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Unscramble the letters:
                    </h2>
                    
                    {/* Scrambled Letters */}
                    <div className="flex justify-center space-x-3 mb-6 flex-wrap">
                      {gameState.scrambledLetters.map((letter, index) => (
                        <button
                          key={index}
                          onClick={() => handleLetterClick(letter)}
                          className="w-14 h-14 bg-gradient-to-br from-game-primary to-game-secondary text-white font-bold text-xl rounded-lg hover:scale-105 transition-transform cursor-pointer"
                        >
                          {letter}
                        </button>
                      ))}
                    </div>

                    {/* Hint */}
                    {showHint && (
                      <div className="mb-6 p-4 bg-game-teal/10 border border-game-teal rounded-lg">
                        <p className="text-game-teal font-medium">
                          💡 Hint: The word starts with "{gameState.currentWord[0].toUpperCase()}"
                        </p>
                      </div>
                    )}

                    {/* Answer Input */}
                    <div className="mb-6">
                      <Input
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                        placeholder="Type your answer here..."
                        className="text-center text-2xl py-6 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        autoFocus
                      />
                    </div>

                    <Button
                      onClick={checkAnswer}
                      disabled={!answer.trim()}
                      className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/90 hover:to-game-secondary/90 text-white px-8 py-3"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Submit Answer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Score Summary */}
              {gameState.correctAnswers.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Correct Answers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {gameState.correctAnswers.map((answer, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-3">
                          <div className="font-medium text-game-primary">{answer.word}</div>
                          <div className="text-sm text-gray-400">{answer.time}s - {answer.points} pts</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {gameState.gameEnded && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-game-primary to-game-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
                  Game Complete!
                </h1>
                <p className="text-xl text-gray-400 mb-8">
                  Great job! Here's how you performed:
                </p>
              </div>

              {/* Final Score */}
              <Card className="bg-gray-800 border-gray-700 mb-8 max-w-2xl mx-auto">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-game-primary mb-2">{gameState.score}</div>
                      <div className="text-gray-400">Total Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-game-secondary mb-2">
                        {gameState.correctAnswers.length}/{gameState.totalRounds}
                      </div>
                      <div className="text-gray-400">Correct Answers</div>
                    </div>
                  </div>

                  {gameState.correctAnswers.length > 0 && (
                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-700">
                      <div className="text-center">
                        <div className="text-xl font-bold text-game-accent mb-2">
                          {Math.round(gameState.correctAnswers.reduce((sum, answer) => sum + answer.time, 0) / gameState.correctAnswers.length)}s
                        </div>
                        <div className="text-gray-400">Avg. Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-game-teal mb-2">
                          {Math.round(gameState.score / gameState.correctAnswers.length)}
                        </div>
                        <div className="text-gray-400">Avg. Points</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-game-primary to-game-secondary hover:from-game-primary/90 hover:to-game-secondary/90 text-white px-6 py-3"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
                
                <Button
                  onClick={shareScore}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3"
                >
                  <Share className="w-5 h-5 mr-2" />
                  Share Score
                </Button>
                
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Main Menu
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}