import type { CategoryRecord } from '@/types';

/**
 * These are UI presets only — category names/icons that exist so a fresh
 * install isn't a totally blank category picker. They carry NO transactions,
 * NO amounts, and NO history. Every rupee shown against them comes only from
 * expenses the user actually enters later.
 */
export const DEFAULT_CATEGORY_SEEDS: Array<Pick<CategoryRecord, 'name' | 'icon' | 'color'>> = [
  { name: 'Food', icon: 'utensils', color: '#4F8CFF' },
  { name: 'Travel', icon: 'bus', color: '#22C55E' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#F59E0B' },
  { name: 'Education', icon: 'graduation-cap', color: '#8B5CF6' },
  { name: 'Entertainment', icon: 'popcorn', color: '#EC4899' },
  { name: 'Health', icon: 'heart-pulse', color: '#EF4444' },
  { name: 'Fitness', icon: 'dumbbell', color: '#14B8A6' },
  { name: 'Bills', icon: 'receipt', color: '#F97316' },
  { name: 'Accommodation', icon: 'home', color: '#0EA5E9' },
  { name: 'Other', icon: 'more-horizontal', color: '#667085' },
];
