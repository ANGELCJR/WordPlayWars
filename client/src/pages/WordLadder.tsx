import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Home, RefreshCw, Check, X } from "lucide-react";

interface WordLadderState {
  startWord: string;
  targetWord: string;
  currentWord: string;
  wordChain: string[];
  timeRemaining: number;
  gameStarted: boolean;
  gameEnded: boolean;
  gameWon: boolean;
  score: number;
  attempts: number;
  maxAttempts: number;
}

const WORD_PAIRS = [
  { start: "COLD", target: "WARM" },
  { start: "HEAD", target: "TAIL" },
  { start: "FIRE", target: "COOL" },
  { start: "LOVE", target: "HATE" },
  { start: "DARK", target: "LITE" },
  { start: "FAST", target: "SLOW" },
  { start: "HARD", target: "SOFT" },
  { start: "GOOD", target: "EVIL" },
];

export default function WordLadder() {
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [gameState, setGameState] = useState<WordLadderState>({
    startWord: "",
    targetWord: "",
    currentWord: "",
    wordChain: [],
    timeRemaining: 180, // 3 minutes
    gameStarted: false,
    gameEnded: false,
    gameWon: false,
    score: 0,
    attempts: 0,
    maxAttempts: 10,
  });

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState.gameStarted && !gameState.gameEnded && gameState.timeRemaining > 0) {
      timer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
    } else if (gameState.timeRemaining === 0 && !gameState.gameEnded) {
      endGame(false);
    }
    return () => clearTimeout(timer);
  }, [gameState.gameStarted, gameState.gameEnded, gameState.timeRemaining]);

  const startNewGame = () => {
    const pair = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    setGameState({
      startWord: pair.start,
      targetWord: pair.target,
      currentWord: pair.start,
      wordChain: [pair.start],
      timeRemaining: 180,
      gameStarted: true,
      gameEnded: false,
      gameWon: false,
      score: 0,
      attempts: 0,
      maxAttempts: 10,
    });
    setInputValue("");
  };

  const isValidTransition = (from: string, to: string): boolean => {
    if (from.length !== to.length) return false;
    
    let differences = 0;
    for (let i = 0; i < from.length; i++) {
      if (from[i] !== to[i]) {
        differences++;
      }
    }
    return differences === 1;
  };

  const isValidWord = (word: string): boolean => {
    // Simple validation - in a real game, you'd check against a dictionary
    return word.length === gameState.startWord.length && /^[A-Z]+$/.test(word);
  };

  const submitWord = () => {
    const word = inputValue.toUpperCase().trim();
    
    if (!isValidWord(word)) {
      return;
    }

    if (gameState.wordChain.includes(word)) {
      return;
    }

    if (!isValidTransition(gameState.currentWord, word)) {
      setGameState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
      }));
      return;
    }

    const newWordChain = [...gameState.wordChain, word];
    const newAttempts = gameState.attempts + 1;

    if (word === gameState.targetWord) {
      // Won!
      const timeBonus = Math.max(0, gameState.timeRemaining * 10);
      const stepBonus = Math.max(0, (gameState.maxAttempts - newWordChain.length) * 100);
      const finalScore = timeBonus + stepBonus + 1000;
      
      setGameState(prev => ({
        ...prev,
        currentWord: word,
        wordChain: newWordChain,
        gameWon: true,
        gameEnded: true,
        score: finalScore,
        attempts: newAttempts,
      }));
    } else if (newAttempts >= gameState.maxAttempts) {
      // Out of attempts
      endGame(false);
    } else {
      setGameState(prev => ({
        ...prev,
        currentWord: word,
        wordChain: newWordChain,
        attempts: newAttempts,
      }));
    }

    setInputValue("");
  };

  const endGame = (won: boolean) => {
    setGameState(prev => ({
      ...prev,
      gameEnded: true,
      gameWon: won,
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !gameState.gameEnded) {
      submitWord();
    }
  };

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
              className="border-blue-400 text-blue-400 hover:bg-blue-500 hover:text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-8 h-8 text-teal-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
                Word Ladder
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-white text-lg">
              Time: <span className="font-bold text-teal-400">{formatTime(gameState.timeRemaining)}</span>
            </div>
            <div className="text-white text-lg">
              Steps: <span className="font-bold text-teal-400">{gameState.wordChain.length - 1}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Instructions */}
            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-teal-500/30 backdrop-blur-sm shadow-2xl shadow-teal-500/20">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3">
                <p className="flex items-center"><span className="text-teal-400 mr-2">•</span> Transform the start word into the target word by changing one letter at a time.</p>
                <p className="flex items-center"><span className="text-cyan-400 mr-2">•</span> Each step must be a valid word.</p>
                <p className="flex items-center"><span className="text-blue-400 mr-2">•</span> Complete the transformation in as few steps as possible!</p>
                <div className="mt-4 p-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-lg shadow-lg shadow-teal-500/20">
                  <p className="text-sm">
                    <strong className="text-teal-400">Example:</strong><br/>
                    COLD → CORD → WORD → WARD → WARM
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Main Game Area */}
            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-teal-500/30 backdrop-blur-sm shadow-2xl shadow-teal-500/20">
              <CardHeader>
                <CardTitle className="text-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">{gameState.startWord}</span>
                  <ArrowUpDown className="w-6 h-6 mx-4 inline-block text-gray-400" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{gameState.targetWord}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Progress */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Word Chain</h3>
                  <div className="space-y-2">
                    {gameState.wordChain.map((word, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg font-mono text-xl font-bold text-center ${
                          index === gameState.wordChain.length - 1
                            ? "bg-teal-500/20 border-2 border-teal-400 text-teal-400"
                            : "bg-gray-700/50 text-gray-300"
                        }`}
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                {!gameState.gameEnded && (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter next word..."
                        className="bg-gray-700/50 border-gray-600 text-white font-mono text-xl text-center"
                        maxLength={gameState.startWord.length}
                        disabled={gameState.gameEnded}
                      />
                      <Button
                        onClick={submitWord}
                        className="bg-teal-500 hover:bg-teal-600 px-6"
                        disabled={gameState.gameEnded || !inputValue.trim()}
                      >
                        Submit
                      </Button>
                    </div>
                    
                    <div className="text-center text-gray-400">
                      Attempts remaining: {gameState.maxAttempts - gameState.attempts}
                    </div>
                  </div>
                )}

                {/* Game End */}
                {gameState.gameEnded && (
                  <div className="text-center space-y-4">
                    {gameState.gameWon ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Check className="w-8 h-8 text-green-400" />
                          <h2 className="text-2xl font-bold text-green-400">Congratulations!</h2>
                        </div>
                        <p className="text-gray-300">You completed the word ladder!</p>
                        <p className="text-xl font-bold text-teal-400">Score: {gameState.score}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <X className="w-8 h-8 text-red-400" />
                          <h2 className="text-2xl font-bold text-red-400">Game Over</h2>
                        </div>
                        <p className="text-gray-300">Better luck next time!</p>
                      </div>
                    )}
                    
                    <Button
                      onClick={startNewGame}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 px-8"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Panel */}
            <Card className="bg-gray-800/80 backdrop-blur-lg border-gray-600">
              <CardHeader>
                <CardTitle className="text-teal-400">Game Stats</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-3">
                <div className="flex justify-between">
                  <span>Current Chain:</span>
                  <span className="font-bold text-teal-400">{gameState.wordChain.length} words</span>
                </div>
                <div className="flex justify-between">
                  <span>Steps Used:</span>
                  <span className="font-bold text-teal-400">{gameState.wordChain.length - 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attempts Left:</span>
                  <span className="font-bold text-teal-400">{gameState.maxAttempts - gameState.attempts}</span>
                </div>
                {gameState.gameEnded && gameState.gameWon && (
                  <div className="mt-4 p-3 bg-teal-500/10 rounded-lg border border-teal-500/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-400">{gameState.score}</div>
                      <div className="text-sm text-gray-400">Final Score</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}