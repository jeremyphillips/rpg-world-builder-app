import type { Difficulty, MagicLevel, Mood, PlayStyle } from '@rpg/contracts'

// Display labels for campaign flavor enums. Keyed by contract types so adding an
// enum member without a label is a type error.

export const PLAY_STYLE_LABELS: Record<PlayStyle, string> = {
  dungeon_crawl: 'Dungeon Crawl',
  urban_adventure: 'Urban Adventure',
  political_intrigue: 'Political Intrigue',
  exploration: 'Exploration',
  survival: 'Survival',
  mystery: 'Mystery',
  sandbox: 'Sandbox',
  tactical_combat: 'Tactical Combat',
  roleplay_driven: 'Roleplay-Driven',
}

export const MOOD_LABELS: Record<Mood, string> = {
  heroic: 'Heroic',
  dark_fantasy: 'Dark Fantasy',
  gritty: 'Gritty',
  horror: 'Horror',
  humorous: 'Humorous',
  weird: 'Weird',
  epic: 'Epic',
  hopeful: 'Hopeful',
}

export const MAGIC_LEVEL_LABELS: Record<MagicLevel, string> = {
  low_magic: 'Low Magic',
  standard_fantasy: 'Standard Fantasy',
  high_magic: 'High Magic',
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  casual: 'Casual',
  dangerous: 'Dangerous',
  brutal: 'Brutal',
}
