import { z } from 'zod'

import { characterNarrativeSchema } from '../../rpg/runtime/character/narrative'
import { characterHitPointsSchema } from '../../rpg/runtime/character/core'
import {
  CHARACTER_IMPORT_FIELD_STATUSES,
  type CharacterImportFieldStatus,
} from './character-import-field-status'

// ---------------------------------------------------------------------------
// Provider-neutral preview value shapes — not Partial<Character>.
// ---------------------------------------------------------------------------

export const recognizedEntryStatusSchema = z.enum([
  'mapped',
  'unresolved-reference',
  'invalid-value',
  'unsupported',
])

export type RecognizedEntryStatus = z.infer<typeof recognizedEntryStatusSchema>

export const recognizedLanguageSchema = z.object({
  sourceValue: z.string(),
  localValue: z.string().optional(),
  sourceGroup: z.string(),
  status: recognizedEntryStatusSchema,
})

export type RecognizedLanguage = z.infer<typeof recognizedLanguageSchema>

export const recognizedProficiencyKindSchema = z.enum([
  'skill',
  'tool',
  'weapon',
  'armor',
  'savingThrow',
])

export type RecognizedProficiencyKind = z.infer<typeof recognizedProficiencyKindSchema>

export const recognizedProficiencyRankSchema = z.enum(['proficient', 'expertise', 'mastery'])

export type RecognizedProficiencyRank = z.infer<typeof recognizedProficiencyRankSchema>

export const recognizedProficiencySchema = z.object({
  kind: recognizedProficiencyKindSchema,
  sourceValue: z.string(),
  localValue: z.string().optional(),
  sourceGroup: z.string(),
  rank: recognizedProficiencyRankSchema.optional(),
  status: recognizedEntryStatusSchema,
})

export type RecognizedProficiency = z.infer<typeof recognizedProficiencySchema>

/** Narrative preview reuses the stored narrative shape (all fields optional). */
export const characterNarrativePreviewSchema = characterNarrativeSchema

export type CharacterNarrativePreview = z.infer<typeof characterNarrativePreviewSchema>

export const characterHitPointsPreviewSchema = characterHitPointsSchema

export type CharacterHitPointsPreview = z.infer<typeof characterHitPointsPreviewSchema>

export function characterImportFieldResultSchema<T extends z.ZodType>(valueSchema: T) {
  return z.object({
    status: z.enum(CHARACTER_IMPORT_FIELD_STATUSES),
    value: valueSchema.optional(),
    sourcePaths: z.array(z.string()),
    issues: z.array(z.string()),
  })
}

export type CharacterImportFieldResult<T> = {
  status: CharacterImportFieldStatus
  value?: T
  sourcePaths: string[]
  issues: string[]
}

export function mappedFieldResult<T>(
  value: T,
  sourcePaths: string[],
): CharacterImportFieldResult<T> {
  return { status: 'mapped', value, sourcePaths, issues: [] }
}

export function fieldResult<T>(
  status: CharacterImportFieldStatus,
  sourcePaths: string[],
  issues: string[],
  value?: T,
): CharacterImportFieldResult<T> {
  return { status, value, sourcePaths, issues }
}
