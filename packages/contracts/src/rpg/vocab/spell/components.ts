import { z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'
import { spellValidationMessages } from './spell-messages'

export const SPELL_COMPONENT_TERM = {
  label: 'Spell Component',
  description: 'A verbal, somatic, or material part of casting a spell.',
  sentence: {
    singular: 'spell component',
    plural: 'spell components',
  },
} as const satisfies VocabularyTerm

export const SPELL_COMPONENT_ENTRIES = {
  verbal: { label: 'Verbal', description: 'The spell requires spoken words.' },
  somatic: { label: 'Somatic', description: 'The spell requires a gesture.' },
  material: { label: 'Material', description: 'The spell requires materials.' },
} as const satisfies Record<string, GameTermEntry>

export type SpellComponentId = keyof typeof SPELL_COMPONENT_ENTRIES

export const SPELL_COMPONENT_IDS = keysFromEntries(SPELL_COMPONENT_ENTRIES)

export const spellComponentIdSchema = vocabEnumFromEntries(SPELL_COMPONENT_ENTRIES)

export const spellMaterialComponentSchema = z.object({
  description: z.string().min(1),
})

export type SpellMaterialComponent = z.infer<typeof spellMaterialComponentSchema>

export const spellComponentsSchema = z
  .object({
    verbal: z.literal(true).optional(),
    somatic: z.literal(true).optional(),
    material: spellMaterialComponentSchema.optional(),
  })
  .refine((val) => val.verbal === true || val.somatic === true || val.material !== undefined, {
    message: spellValidationMessages.componentRequired(),
  })

export type SpellComponents = z.infer<typeof spellComponentsSchema>
