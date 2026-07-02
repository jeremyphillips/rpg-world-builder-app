import { describe, expect, it } from 'vitest'
import {
  ABSOLUTE_MAX_CHARACTER_LEVEL,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  MAX_CHARACTER_LEVEL,
} from '@rpg/contracts'

import {
  buildRulesConfigLayoutFields,
  buildRulesFieldsForSurface,
  buildRulesReviewRowsForSurface,
  buildRulesSchemaForSurface,
  CHARACTER_CONFIGURATION_SECTIONS,
  CREATE_WIZARD_RULE_FIELD_IDS,
} from './character-configuration-form-fields'

describe('character-configuration-form-fields', () => {
  describe('buildRulesSchemaForSurface', () => {
    it('accepts create-wizard input with basic fields only', () => {
      const result = buildRulesSchemaForSurface('create').safeParse({
        startingLevel: 3,
        importedCharactersPolicy: 'approval_required',
      })

      expect(result.success).toBe(true)
    })

    it('rejects invalid starting level on create surface', () => {
      const result = buildRulesSchemaForSurface('create').safeParse({
        startingLevel: 0,
        importedCharactersPolicy: 'disabled',
      })

      expect(result.success).toBe(false)
    })

    it('rejects starting level above default max on create surface', () => {
      const result = buildRulesSchemaForSurface('create').safeParse({
        startingLevel: MAX_CHARACTER_LEVEL + 1,
        importedCharactersPolicy: 'disabled',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(['startingLevel'])
      }
    })

    it('does not require advanced fields on create surface', () => {
      const result = buildRulesSchemaForSurface('create').safeParse({
        startingLevel: 1,
        importedCharactersPolicy: 'disabled',
        maxCharacterLevel: 15,
        allowedCharacterCreatureTypes: ['construct'],
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          startingLevel: 1,
          importedCharactersPolicy: 'disabled',
        })
      }
    })

    it('requires and validates advanced rules on config surface', () => {
      const missingAdvanced = buildRulesSchemaForSurface('config').safeParse({
        startingLevel: 1,
        importedCharactersPolicy: 'disabled',
      })

      expect(missingAdvanced.success).toBe(true)
      if (missingAdvanced.success) {
        expect(missingAdvanced.data.maxCharacterLevel).toBe(MAX_CHARACTER_LEVEL)
        expect(missingAdvanced.data.allowedCharacterCreatureTypes).toEqual([
          ...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
        ])
        expect(missingAdvanced.data.multiclassingEnabled).toBe(true)
        expect(missingAdvanced.data.primaryAbilityMinimumScore).toBe(13)
      }

      const invalidExtended = buildRulesSchemaForSurface('config').safeParse({
        startingLevel: 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: true,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
      })

      expect(invalidExtended.success).toBe(false)
    })

    it('rejects starting level above absolute max on config surface', () => {
      const result = buildRulesSchemaForSurface('config').safeParse({
        startingLevel: ABSOLUTE_MAX_CHARACTER_LEVEL + 1,
        maxCharacterLevel: 20,
        extendedProgressionEnabled: false,
        importedCharactersPolicy: 'disabled',
        allowedCharacterCreatureTypes: ['humanoid'],
      })

      expect(result.success).toBe(false)
    })
  })

  describe('buildRulesFieldsForSurface', () => {
    it('returns only create-wizard fields for create surface', () => {
      const fields = buildRulesFieldsForSurface('create', [])
      const fieldNames = collectFieldNames(fields)

      expect(fieldNames).toEqual([...CREATE_WIZARD_RULE_FIELD_IDS])
    })

    it('returns advanced fields for config surface', () => {
      const fields = buildRulesFieldsForSurface('config', [])
      const fieldNames = collectFieldNames(fields)

      expect(fieldNames).toContain('maxCharacterLevel')
      expect(fieldNames).toContain('allowedCharacterCreatureTypes')
      expect(fieldNames).toContain('extendedProgressionEnabled')
      expect(fieldNames).toContain('multiclassingEnabled')
      expect(fieldNames).toContain('startingWealth.name')
      expect(fieldNames).toContain('startingWealth.tiers')
    })
  })

  describe('buildRulesReviewRowsForSurface', () => {
    it('returns only create fields for create surface', () => {
      const rows = buildRulesReviewRowsForSurface('create', {
        startingLevel: 5,
        importedCharactersPolicy: 'approval_required',
        maxCharacterLevel: 20,
        allowedCharacterCreatureTypes: ['humanoid'],
      })

      expect(rows).toEqual([
        { label: 'Starting level', value: '5' },
        { label: 'Imported characters', value: 'Yes, with DM approval' },
      ])
    })
  })

  describe('CHARACTER_CONFIGURATION_SECTIONS', () => {
    it('derives config anchor nav from the field registry', () => {
      expect(CHARACTER_CONFIGURATION_SECTIONS.map((section) => section.id)).toEqual([
        'creation',
        'standard-max-level',
        'extended-progression',
        'creature-type-policy',
        'multiclassing',
      ])
    })
  })

  describe('buildRulesConfigLayoutFields', () => {
    it('places section scroll anchors on containers instead of empty anchor slots', () => {
      const fields = buildRulesConfigLayoutFields([])
      const slotNames = collectSlotNames(fields)
      const containerIds = collectContainerIds(fields)

      expect(slotNames.filter((name) => name.startsWith('_anchor_'))).toEqual([])
      expect(containerIds).toEqual(
        expect.arrayContaining([
          'creation',
          'starting-level',
          'starting-wealth',
          'standard-max-level',
          'extended-progression',
          'creature-type-policy',
          'multiclassing',
        ]),
      )
    })
  })
})

function collectFieldNames(fields: ReturnType<typeof buildRulesFieldsForSurface>): string[] {
  const names: string[] = []

  for (const field of fields) {
    if ('name' in field && typeof field.name === 'string' && !field.name.startsWith('_')) {
      names.push(field.name)
    }
    if ('fields' in field && Array.isArray(field.fields)) {
      names.push(...collectFieldNames(field.fields))
    }
  }

  return names
}

function collectSlotNames(fields: ReturnType<typeof buildRulesConfigLayoutFields>): string[] {
  const names: string[] = []

  for (const field of fields) {
    if ('kind' in field && field.kind === 'slot') {
      names.push(field.name)
    }
    if ('fields' in field && Array.isArray(field.fields)) {
      names.push(
        ...collectSlotNames(field.fields as ReturnType<typeof buildRulesConfigLayoutFields>),
      )
    }
  }

  return names
}

function collectContainerIds(fields: ReturnType<typeof buildRulesConfigLayoutFields>): string[] {
  const ids: string[] = []

  for (const field of fields) {
    if ('kind' in field && 'id' in field && typeof field.id === 'string') {
      ids.push(field.id)
    }
    if ('fields' in field && Array.isArray(field.fields)) {
      ids.push(
        ...collectContainerIds(field.fields as ReturnType<typeof buildRulesConfigLayoutFields>),
      )
    }
  }

  return ids
}
