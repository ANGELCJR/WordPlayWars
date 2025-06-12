/**
 * Game logic utilities for WordPlay Wars
 */

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateAnagram(word: string): string[] {
  const letters = word.split('');
  let scrambled;
  
  // Keep shuffling until we get a different arrangement
  do {
    scrambled = shuffleArray(letters);
  } while (scrambled.join('') === word && word.length > 1);
  
  return scrambled;
}

export function calculateScore(timeRemaining: number, maxTime: number = 60): number {
  // Base score of 100, reduced by 2 points per second taken
  const timeTaken = maxTime - timeRemaining;
  return Math.max(100 - timeTaken * 2, 20);
}

export function calculateStreakBonus(streak: number): number {
  // Bonus points for consecutive correct answers
  return streak * 10;
}

export function isValidAnagramSolution(scrambled: string[], solution: string): boolean {
  const scrambledSorted = scrambled.sort().join('');
  const solutionSorted = solution.toUpperCase().split('').sort().join('');
  return scrambledSorted === solutionSorted;
}

export interface GameStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalWordsCorrect: number;
  averageTime: number;
  longestStreak: number;
  currentStreak: number;
}

export function calculateNewStats(
  currentStats: GameStats,
  gameResult: {
    score: number;
    wordsCorrect: number;
    averageTime: number;
    streak: number;
  }
): GameStats {
  const newTotalGames = currentStats.totalGames + 1;
  const newTotalScore = currentStats.totalScore + gameResult.score;
  const newAverageScore = Math.round(newTotalScore / newTotalGames);
  const newBestScore = Math.max(currentStats.bestScore, gameResult.score);
  const newTotalWordsCorrect = currentStats.totalWordsCorrect + gameResult.wordsCorrect;
  
  // Calculate new average time
  const totalTime = currentStats.averageTime * currentStats.totalGames + gameResult.averageTime;
  const newAverageTime = Math.round(totalTime / newTotalGames);
  
  // Update streaks
  let newCurrentStreak = currentStats.currentStreak;
  let newLongestStreak = currentStats.longestStreak;
  
  if (gameResult.wordsCorrect > 0) {
    newCurrentStreak += 1;
    newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
  } else {
    newCurrentStreak = 0;
  }

  return {
    totalGames: newTotalGames,
    totalScore: newTotalScore,
    averageScore: newAverageScore,
    bestScore: newBestScore,
    totalWordsCorrect: newTotalWordsCorrect,
    averageTime: newAverageTime,
    longestStreak: newLongestStreak,
    currentStreak: newCurrentStreak,
  };
}

export function getDifficultyLevel(score: number): 'Easy' | 'Medium' | 'Hard' {
  if (score < 500) return 'Easy';
  if (score < 1500) return 'Medium';
  return 'Hard';
}

export function getWordLengthForDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): number {
  switch (difficulty) {
    case 'Easy':
      return 4 + Math.floor(Math.random() * 2); // 4-5 letters
    case 'Medium':
      return 5 + Math.floor(Math.random() * 2); // 5-6 letters
    case 'Hard':
      return 6 + Math.floor(Math.random() * 3); // 6-8 letters
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getEncouragementMessage(score: number, streak: number): string {
  if (streak >= 5) {
    return "🔥 You're on fire! Amazing streak!";
  }
  if (streak >= 3) {
    return "⚡ Great streak! Keep it going!";
  }
  if (score >= 80) {
    return "🎯 Excellent solve time!";
  }
  if (score >= 60) {
    return "👍 Nice work!";
  }
  return "💪 Keep trying!";
}
