// Static word list for anagram generation
export const WORD_LIST = [
  // 4-letter words
  "PLAY", "GAME", "WORD", "TIME", "FAST", "BEST", "CODE", "TYPE", "TEAM", "STAR",
  "BLUE", "FIRE", "MOON", "COOL", "JUMP", "HELP", "BOOK", "CAKE", "HAND", "LOVE",
  
  // 5-letter words
  "MAGIC", "QUEST", "BRAVE", "DREAM", "SHINE", "POWER", "SWIFT", "DANCE", "CROWN", "FLAME",
  "LIGHT", "PEACE", "SMART", "MUSIC", "OCEAN", "LAUGH", "GRACE", "HEART", "STORM", "GLORY",
  
  // 6-letter words
  "PLAYER", "BATTLE", "MASTER", "WIZARD", "PUZZLE", "VICTORY", "ENERGY", "STRENGTH", "WISDOM", "NATURE",
  "GARDEN", "STREAM", "BRIGHT", "CASTLE", "DRAGON", "FLOWER", "JUNGLE", "KNIGHT", "MONKEY", "ORANGE",
  
  // 7-letter words
  "VICTORY", "AMAZING", "AWESOME", "PERFECT", "RAINBOW", "COURAGE", "HARMONY", "FREEDOM", "JOURNEY", "MYSTERY",
  "FANTASY", "DIAMOND", "CRYSTAL", "THUNDER", "KINGDOM", "WARRIOR", "PHOENIX", "UNICORN", "EMPEROR", "SCHOLAR",
  
  // 8+ letter words
  "ADVENTURE", "CHAMPION", "LEGENDARY", "MAGNIFICENT", "WONDERFUL", "BEAUTIFUL", "CHALLENGE", "INCREDIBLE",
  "FANTASTIC", "BRILLIANT", "SPECTACULAR", "EXTRAORDINARY", "POWERFUL", "UNSTOPPABLE", "REMARKABLE", "OUTSTANDING"
];

export function getRandomWord(): string {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

export function getWordsByLength(length: number): string[] {
  return WORD_LIST.filter(word => word.length === length);
}

export function getRandomWordByLength(length: number): string {
  const words = getWordsByLength(length);
  if (words.length === 0) {
    return getRandomWord(); // Fallback to any word
  }
  return words[Math.floor(Math.random() * words.length)];
}

export function isValidWord(word: string): boolean {
  return WORD_LIST.includes(word.toUpperCase());
}
