import { vocabEnumFromEntries, keysFromEntries } from './enum-schema'
import { getTermSentenceForm } from './types'
import type { GameTermEntry, VocabularyTerm } from './types'

export const CHALLENGE_RATING_TERM = {
  label: 'Challenge Rating',
  description: "A monster's difficulty rating for encounter building and rewards.",
  sentence: {
    singular: 'challenge rating',
    plural: 'challenge ratings',
  },
} as const satisfies VocabularyTerm

export const CHALLENGE_RATING_ENTRIES = {
  '0': { label: 'CR 0', description: 'Challenge rating 0.' },
  '1': { label: 'CR 1', description: 'Challenge rating 1.' },
  '2': { label: 'CR 2', description: 'Challenge rating 2.' },
  '3': { label: 'CR 3', description: 'Challenge rating 3.' },
  '4': { label: 'CR 4', description: 'Challenge rating 4.' },
  '5': { label: 'CR 5', description: 'Challenge rating 5.' },
  '6': { label: 'CR 6', description: 'Challenge rating 6.' },
  '7': { label: 'CR 7', description: 'Challenge rating 7.' },
  '8': { label: 'CR 8', description: 'Challenge rating 8.' },
  '9': { label: 'CR 9', description: 'Challenge rating 9.' },
  '10': { label: 'CR 10', description: 'Challenge rating 10.' },
  '11': { label: 'CR 11', description: 'Challenge rating 11.' },
  '12': { label: 'CR 12', description: 'Challenge rating 12.' },
  '13': { label: 'CR 13', description: 'Challenge rating 13.' },
  '14': { label: 'CR 14', description: 'Challenge rating 14.' },
  '15': { label: 'CR 15', description: 'Challenge rating 15.' },
  '16': { label: 'CR 16', description: 'Challenge rating 16.' },
  '17': { label: 'CR 17', description: 'Challenge rating 17.' },
  '18': { label: 'CR 18', description: 'Challenge rating 18.' },
  '19': { label: 'CR 19', description: 'Challenge rating 19.' },
  '20': { label: 'CR 20', description: 'Challenge rating 20.' },
  '21': { label: 'CR 21', description: 'Challenge rating 21.' },
  '22': { label: 'CR 22', description: 'Challenge rating 22.' },
  '23': { label: 'CR 23', description: 'Challenge rating 23.' },
  '24': { label: 'CR 24', description: 'Challenge rating 24.' },
  '25': { label: 'CR 25', description: 'Challenge rating 25.' },
  '26': { label: 'CR 26', description: 'Challenge rating 26.' },
  '27': { label: 'CR 27', description: 'Challenge rating 27.' },
  '28': { label: 'CR 28', description: 'Challenge rating 28.' },
  '29': { label: 'CR 29', description: 'Challenge rating 29.' },
  '30': { label: 'CR 30', description: 'Challenge rating 30.' },
  '1/8': { label: 'CR 1/8', description: 'Challenge rating 1/8.' },
  '1/4': { label: 'CR 1/4', description: 'Challenge rating 1/4.' },
  '1/2': { label: 'CR 1/2', description: 'Challenge rating 1/2.' },
} as const satisfies Record<string, GameTermEntry>

export type ChallengeRating = keyof typeof CHALLENGE_RATING_ENTRIES

export const CHALLENGE_RATING_IDS = keysFromEntries(CHALLENGE_RATING_ENTRIES)

export const challengeRatingSchema = vocabEnumFromEntries(CHALLENGE_RATING_ENTRIES)

export type ChallengeRatingMechanics = {
  value: number
  xp: number
  proficiencyBonus: number
}

export const CHALLENGE_RATING_MECHANICS: Record<ChallengeRating, ChallengeRatingMechanics> = {
  '0': { value: 0, xp: 10, proficiencyBonus: 2 },
  '1': { value: 1, xp: 200, proficiencyBonus: 2 },
  '2': { value: 2, xp: 450, proficiencyBonus: 2 },
  '3': { value: 3, xp: 700, proficiencyBonus: 2 },
  '4': { value: 4, xp: 1100, proficiencyBonus: 2 },
  '5': { value: 5, xp: 1800, proficiencyBonus: 3 },
  '6': { value: 6, xp: 2300, proficiencyBonus: 3 },
  '7': { value: 7, xp: 2900, proficiencyBonus: 3 },
  '8': { value: 8, xp: 3900, proficiencyBonus: 3 },
  '9': { value: 9, xp: 5000, proficiencyBonus: 4 },
  '10': { value: 10, xp: 5900, proficiencyBonus: 4 },
  '11': { value: 11, xp: 7200, proficiencyBonus: 4 },
  '12': { value: 12, xp: 8400, proficiencyBonus: 4 },
  '13': { value: 13, xp: 10000, proficiencyBonus: 5 },
  '14': { value: 14, xp: 11500, proficiencyBonus: 5 },
  '15': { value: 15, xp: 13000, proficiencyBonus: 5 },
  '16': { value: 16, xp: 15000, proficiencyBonus: 5 },
  '17': { value: 17, xp: 18000, proficiencyBonus: 6 },
  '18': { value: 18, xp: 20000, proficiencyBonus: 6 },
  '19': { value: 19, xp: 22000, proficiencyBonus: 6 },
  '20': { value: 20, xp: 25000, proficiencyBonus: 6 },
  '21': { value: 21, xp: 33000, proficiencyBonus: 7 },
  '22': { value: 22, xp: 41000, proficiencyBonus: 7 },
  '23': { value: 23, xp: 50000, proficiencyBonus: 7 },
  '24': { value: 24, xp: 62000, proficiencyBonus: 7 },
  '25': { value: 25, xp: 75000, proficiencyBonus: 8 },
  '26': { value: 26, xp: 90000, proficiencyBonus: 8 },
  '27': { value: 27, xp: 105000, proficiencyBonus: 8 },
  '28': { value: 28, xp: 120000, proficiencyBonus: 8 },
  '29': { value: 29, xp: 135000, proficiencyBonus: 9 },
  '30': { value: 30, xp: 155000, proficiencyBonus: 9 },
  '1/8': { value: 0.125, xp: 25, proficiencyBonus: 2 },
  '1/4': { value: 0.25, xp: 50, proficiencyBonus: 2 },
  '1/2': { value: 0.5, xp: 100, proficiencyBonus: 2 },
}

export function getChallengeRatingEntry(id: string): GameTermEntry | undefined {
  return CHALLENGE_RATING_ENTRIES[id as ChallengeRating]
}

export function getChallengeRatingLabel(id: string): string {
  return getChallengeRatingEntry(id)?.label ?? id
}

export function getChallengeRatingSentenceForm(id: string, count = 1): string {
  const entry = getChallengeRatingEntry(id)
  if (entry) return getTermSentenceForm(entry, count)
  return getTermSentenceForm({ label: id, description: '' }, count)
}

export function compareChallengeRatings(left: ChallengeRating, right: ChallengeRating): number {
  return CHALLENGE_RATING_MECHANICS[left].value - CHALLENGE_RATING_MECHANICS[right].value
}

export function formatChallengeRating(id: ChallengeRating): string {
  return id.includes('/') ? id : String(id)
}
