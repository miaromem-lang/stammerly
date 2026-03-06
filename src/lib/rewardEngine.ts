export interface RewardResult {
  tier: 'standard' | 'bonus' | 'rare' | 'jackpot';
  gems: number;
  stars: number;
  label: string;
  emoji: string;
  description: string;
}

/**
 * Variable reward engine using randomised tiered probabilities.
 * 60% standard, 25% bonus, 10% rare, 5% jackpot.
 */
export function generateReward(baseGems: number = 5, baseStars: number = 1): RewardResult {
  const roll = Math.random();

  if (roll < 0.05) {
    return {
      tier: 'jackpot',
      gems: baseGems * 5,
      stars: baseStars * 3,
      label: '🎰 JACKPOT!',
      emoji: '🎰',
      description: 'Incredible luck! You found the treasure chest!',
    };
  }

  if (roll < 0.15) {
    return {
      tier: 'rare',
      gems: baseGems * 3,
      stars: baseStars * 2,
      label: '💎 Rare Find!',
      emoji: '💎',
      description: 'Amazing! You discovered a rare gem!',
    };
  }

  if (roll < 0.40) {
    const multiplier = 1.5 + Math.random() * 0.5; // 1.5x-2x
    return {
      tier: 'bonus',
      gems: Math.round(baseGems * multiplier),
      stars: baseStars + 1,
      label: '⭐ Bonus!',
      emoji: '⭐',
      description: 'Great work! Bonus gems earned!',
    };
  }

  return {
    tier: 'standard',
    gems: baseGems,
    stars: baseStars,
    label: '✨ Well Done!',
    emoji: '✨',
    description: 'Keep up the great practice!',
  };
}
