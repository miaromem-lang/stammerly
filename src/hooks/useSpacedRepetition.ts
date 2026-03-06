import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SpacedRepetitionItem {
  id: string;
  user_id: string;
  phoneme: string | null;
  word: string | null;
  exercise_id: string | null;
  ease_factor: number;
  interval_days: number;
  next_review_date: string;
  repetition_count: number;
  last_reviewed_at: string | null;
  created_at: string;
}

/**
 * SM-2 spaced repetition algorithm for trigger words.
 * Quality: 0-5 (0=complete failure, 5=perfect response)
 * Maps fluency score 0-100 to quality 0-5.
 */
function sm2(easeFactor: number, intervalDays: number, repetitionCount: number, quality: number) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);

  let newInterval: number;
  let newRepCount: number;

  if (quality < 3) {
    // Reset
    newInterval = 1;
    newRepCount = 0;
  } else {
    newRepCount = repetitionCount + 1;
    if (newRepCount === 1) newInterval = 1;
    else if (newRepCount === 2) newInterval = 6;
    else newInterval = Math.round(intervalDays * newEF);
  }

  return { easeFactor: newEF, intervalDays: newInterval, repetitionCount: newRepCount };
}

function fluencyToQuality(fluencyScore: number): number {
  if (fluencyScore >= 90) return 5;
  if (fluencyScore >= 75) return 4;
  if (fluencyScore >= 60) return 3;
  if (fluencyScore >= 40) return 2;
  if (fluencyScore >= 20) return 1;
  return 0;
}

export function useSpacedRepetition() {
  const [dueItems, setDueItems] = useState<SpacedRepetitionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDueItems = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('spaced_repetition_items')
      .select('*')
      .lte('next_review_date', today)
      .order('next_review_date', { ascending: true });

    if (!error && data) {
      setDueItems(data as SpacedRepetitionItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDueItems();
  }, [fetchDueItems]);

  const addItem = useCallback(async (word: string, phoneme?: string, exerciseId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if item already exists
    const { data: existing } = await supabase
      .from('spaced_repetition_items')
      .select('id')
      .eq('word', word)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) return; // Already tracked

    await supabase.from('spaced_repetition_items').insert({
      user_id: user.id,
      word,
      phoneme: phoneme || null,
      exercise_id: exerciseId || null,
    });

    await fetchDueItems();
  }, [fetchDueItems]);

  const reviewItem = useCallback(async (itemId: string, fluencyScore: number) => {
    const item = dueItems.find(i => i.id === itemId);
    if (!item) return;

    const quality = fluencyToQuality(fluencyScore);
    const result = sm2(item.ease_factor, item.interval_days, item.repetition_count, quality);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + result.intervalDays);

    await supabase
      .from('spaced_repetition_items')
      .update({
        ease_factor: result.easeFactor,
        interval_days: result.intervalDays,
        repetition_count: result.repetitionCount,
        next_review_date: nextReviewDate.toISOString().split('T')[0],
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', itemId);

    await fetchDueItems();
  }, [dueItems, fetchDueItems]);

  return { dueItems, loading, addItem, reviewItem, refetch: fetchDueItems };
}
