import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Timer, Home, RefreshCw, Zap, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getRandomWord, isValidWord } from "@/lib/words";

interface SpeedTypeState {
  timeRemaining: number;
  gameStarted: boolean;
  gameEnded: boolean;
  score: number;
  wordsTyped: string[];
  currentInput: string;
  wpm: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  startTime: number | null;
}

export default function SpeedType() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [gameState, setGameState] = useState<SpeedTypeState>({
    timeRemaining: 60,
    gameStarted: false,
    gameEnded: false,
    score: 0,
    wordsTyped: [],
    currentInput: "",
    wpm: 0,
    accuracy: 100,
    totalCharacters: 0,
    correctCharacters: 0,
    startTime: null,
  });

  useEffect(() => {
    // Speed Type is available for all users
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.gameStarted && !gameState.gameEnded && gameState.timeRemaining > 0) {
      timer = setTimeout(() => {
        setGameState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining === 0) {
            return { ...prev, timeRemaining: 0, gameEnded: true };
          }
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [gameState.gameStarted, gameState.gameEnded, gameState.timeRemaining]);

  const startGame = () => {
    setGameState({
      timeRemaining: 60,
      gameStarted: true,
      gameEnded: false,
      score: 0,
      wordsTyped: [],
      currentInput: "",
      wpm: 0,
      accuracy: 100,
      totalCharacters: 0,
      correctCharacters: 0,
      startTime: Date.now(),
    });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const calculateStats = (wordsTyped: string[], totalChars: number, correctChars: number, startTime: number) => {
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wpm = Math.round(wordsTyped.length / Math.max(timeElapsed, 0.1));
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    return { wpm, accuracy };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState.gameEnded) return;

    const value = e.target.value;
    
    if (!gameState.gameStarted) {
      startGame();
      return;
    }

    setGameState(prev => ({ ...prev, currentInput: value }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameState.gameEnded) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      submitWord();
    }
  };

  const submitWord = () => {
    const word = gameState.currentInput.trim().toLowerCase();
    if (!word) return;

    const isValid = isValidWord(word);
    const wordLength = word.length;
    
    setGameState(prev => {
      const newWordsTyped = isValid ? [...prev.wordsTyped, word] : prev.wordsTyped;
      const newTotalCharacters = prev.totalCharacters + wordLength;
      const newCorrectCharacters = prev.correctCharacters + (isValid ? wordLength : 0);
      const newScore = isValid ? prev.score + wordLength * 10 : prev.score;
      
      const stats = calculateStats(newWordsTyped, newTotalCharacters, newCorrectCharacters, prev.startTime || Date.now());
      
      return {
        ...prev,
        wordsTyped: newWordsTyped,
        currentInput: "",
        score: newScore,
        totalCharacters: newTotalCharacters,
        correctCharacters: newCorrectCharacters,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
      };
    });
  };

  const restartGame = () => {
    setGameState({
      timeRemaining: 60,
      gameStarted: false,
      gameEnded: false,
      score: 0,
      wordsTyped: [],
      currentInput: "",
      wpm: 0,
      accuracy: 100,
      totalCharacters: 0,
      correctCharacters: 0,
      startTime: null,
    });
  };

  const formatTime = (seconds: number): string => {
    return `${seconds}s`;
  };

  const getRandomPromptWords = () => {
    const words = [];
    for (let i = 0; i < 5; i++) {
      words.push(getRandomWord());
    }
    return words;
  };

  const promptWords = getRandomPromptWords();

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

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-500 hover:text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="flex items-center space-x-2">
              <Timer className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Speed Type
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-white text-lg">
              Time: <span className="font-bold text-yellow-400">{formatTime(gameState.timeRemaining)}</span>
            </div>
            <div className="text-white text-lg">
              WPM: <span className="font-bold text-yellow-400">{gameState.wpm}</span>
            </div>
            <div className="text-white text-lg">
              Accuracy: <span className="font-bold text-yellow-400">{gameState.accuracy}%</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Instructions */}
            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-yellow-500/30 backdrop-blur-sm shadow-2xl shadow-yellow-500/20">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3">
                <p className="flex items-center"><span className="text-yellow-400 mr-2">•</span> Type valid words as fast as you can in 60 seconds!</p>
                <p className="flex items-center"><span className="text-amber-400 mr-2">•</span> Press SPACE or ENTER after each word.</p>
                <p className="flex items-center"><span className="text-orange-400 mr-2">•</span> Only valid dictionary words count toward your score.</p>
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg shadow-lg shadow-yellow-500/20">
                  <p className="text-sm">
                    <strong className="text-yellow-400">Tip:</strong><br/>
                    Try these words: {promptWords.slice(0, 3).join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Main Game Area */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-yellow-500/30 backdrop-blur-sm shadow-2xl shadow-yellow-500/20 h-full">
                <CardHeader>
                  <CardTitle className="text-center bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    {!gameState.gameStarted && !gameState.gameEnded && "Ready to Start?"}
                    {gameState.gameStarted && !gameState.gameEnded && "Type Valid Words!"}
                    {gameState.gameEnded && "Time's Up!"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Input Area */}
                  <div className="space-y-4">
                    <Input
                      ref={inputRef}
                      value={gameState.currentInput}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        !gameState.gameStarted && !gameState.gameEnded 
                          ? "Start typing to begin..." 
                          : gameState.gameEnded 
                            ? "Game Over" 
                            : "Type a word..."
                      }
                      className="bg-gray-700/50 border-gray-600 text-white text-2xl text-center font-mono py-4"
                      disabled={gameState.gameEnded}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    
                    {!gameState.gameStarted && !gameState.gameEnded && (
                      <div className="text-center">
                        <Button
                          onClick={startGame}
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 px-8 py-3 text-lg"
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          Start Game
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Words Typed Display */}
                  {gameState.wordsTyped.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">Words Typed:</h3>
                      <div className="bg-gray-700/30 rounded-lg p-4 max-h-40 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {gameState.wordsTyped.map((word, index) => (
                            <span
                              key={index}
                              className="bg-green-500/20 text-green-400 px-2 py-1 rounded font-mono text-sm border border-green-500/30"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Game End Results */}
                  {gameState.gameEnded && (
                    <div className="text-center space-y-4 bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
                      <h2 className="text-2xl font-bold text-yellow-400">Final Results</h2>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-white">{gameState.score}</div>
                          <div className="text-sm text-gray-400">Score</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-white">{gameState.wordsTyped.length}</div>
                          <div className="text-sm text-gray-400">Words</div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={restartGame}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 px-8"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Play Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Panel */}
            <Card className="bg-gray-800/80 backdrop-blur-lg border-gray-600">
              <CardHeader>
                <CardTitle className="text-yellow-400">Live Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="font-bold text-yellow-400">{gameState.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-bold text-yellow-400">{gameState.wordsTyped.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WPM:</span>
                    <span className="font-bold text-yellow-400">{gameState.wpm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    <span className="font-bold text-yellow-400">{gameState.accuracy}%</span>
                  </div>
                </div>

                {gameState.gameStarted && !gameState.gameEnded && (
                  <div className="mt-6 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="text-center">
                      <Target className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                      <div className="text-sm text-gray-400">Keep typing!</div>
                    </div>
                  </div>
                )}

                {/* Word Suggestions */}
                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-semibold text-yellow-400">Word Ideas:</h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    {promptWords.map((word, index) => (
                      <div key={index} className="font-mono">{word}</div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}