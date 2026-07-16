import { z } from 'zod'

import { characterAbilityScoresSchema } from '../../rpg/runtime/character/core'
import { coinWealthSchema } from '../../rpg/primitives/wealth'
import { alignmentSchema } from '../../rpg/vocab/alignment'
import { DND_BEYOND_PAYLOAD_VERSION } from '../dnd-beyond/dnd-beyond-version'
import {
  CHARACTER_IMPORT_ACQUISITION_METHODS,
  CHARACTER_IMPORT_COVERAGE_STATES,
  CHARACTER_IMPORT_SOURCE_CAPABILITY_CATEGORIES,
} from './character-import-field-status'
import {
  characterHitPointsPreviewSchema,
  characterImportFieldResultSchema,
  characterImportProficienciesPreviewSchema,
  characterNarrativePreviewSchema,
  recognizedClassPreviewSchema,
  recognizedEquipmentItemSchema,
  recognizedLanguageSchema,
  recognizedSpellPreviewSchema,
  recognizedSpeciesPreviewSchema,
} from './character-import-preview-types'
import { characterImportDispositionEntrySchema } from './character-import-disposition'

// ---------------------------------------------------------------------------
// Character import result — extraction preview + coverage + source evidence.
// ---------------------------------------------------------------------------

export const dndBeyondCharacterImportSourceSchema = z.object({
  provider: z.literal('dnd-beyond'),
  payloadVersion: z.literal(DND_BEYOND_PAYLOAD_VERSION),
  requestedPayloadVersion: z.literal(DND_BEYOND_PAYLOAD_VERSION),
  supportedPayloadVersion: z.literal(DND_BEYOND_PAYLOAD_VERSION),
  characterId: z.string().optional(),
  acquisition: z.enum(CHARACTER_IMPORT_ACQUISITION_METHODS),
  readonlyUrl: z.string().optional(),
})

export type DndBeyondCharacterImportSource = z.infer<typeof dndBeyondCharacterImportSourceSchema>

export const characterImportSourceSchema = z.discriminatedUnion('provider', [
  dndBeyondCharacterImportSourceSchema,
])

export type CharacterImportSource = z.infer<typeof characterImportSourceSchema>

export const characterImportExtractionSchema = z.object({
  name: characterImportFieldResultSchema(z.string()),
  species: characterImportFieldResultSchema(recognizedSpeciesPreviewSchema),
  classes: characterImportFieldResultSchema(z.array(recognizedClassPreviewSchema)),
  abilityScores: characterImportFieldResultSchema(characterAbilityScoresSchema),
  alignment: characterImportFieldResultSchema(alignmentSchema),
  xp: characterImportFieldResultSchema(z.number().int().min(0)),
  narrative: characterImportFieldResultSchema(characterNarrativePreviewSchema),
  hitPoints: characterImportFieldResultSchema(characterHitPointsPreviewSchema),
  languages: characterImportFieldResultSchema(z.array(recognizedLanguageSchema)),
  proficiencies: characterImportFieldResultSchema(characterImportProficienciesPreviewSchema),
  equipment: characterImportFieldResultSchema(z.array(recognizedEquipmentItemSchema)),
  wealth: characterImportFieldResultSchema(coinWealthSchema),
  spells: characterImportFieldResultSchema(z.array(recognizedSpellPreviewSchema)),
})

export type CharacterImportExtraction = z.infer<typeof characterImportExtractionSchema>

export const characterImportCoverageEntrySchema = z.object({
  targetPath: z.string(),
  state: z.enum(CHARACTER_IMPORT_COVERAGE_STATES),
  reason: z.string(),
  sourcePaths: z.array(z.string()).optional(),
})

export type CharacterImportCoverageEntry = z.infer<typeof characterImportCoverageEntrySchema>

export const characterImportSourceCapabilitySchema = z.object({
  path: z.string(),
  category: z.enum(CHARACTER_IMPORT_SOURCE_CAPABILITY_CATEGORIES),
  value: z.unknown().optional(),
})

export type CharacterImportSourceCapability = z.infer<typeof characterImportSourceCapabilitySchema>

export const characterImportResultSchema = z.object({
  source: characterImportSourceSchema,
  extraction: characterImportExtractionSchema,
  coverage: z.array(characterImportCoverageEntrySchema),
  dispositions: z.array(characterImportDispositionEntrySchema),
  availableSourceData: z.array(characterImportSourceCapabilitySchema),
})

export type CharacterImportResult = z.infer<typeof characterImportResultSchema>

/** @deprecated Use CharacterImportResult — kept for transitional naming in docs. */
export type CharacterImportPreview = CharacterImportResult
