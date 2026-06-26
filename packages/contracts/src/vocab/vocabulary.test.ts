import { describe, expect, it } from 'vitest'

import {
  activeVocabularyOptionIds,
  createVocabularyCampaignEntryInputSchema,
  createVocabularyMemberSchema,
  getVocabularyOptionLabel,
  vocabularyOptionIdSchema,
  vocabularyOptionSetSchema,
  vocabularyOptionSetPatchSchema,
  vocabularySeedOptionSchema,
} from './vocabulary'

const CREATURE_TYPE_SET = vocabularyOptionSetSchema.parse({
  id: 'creature-types',
  options: [
    {
      id: 'humanoid',
      label: 'Humanoid',
      description: 'People of the world.',
      source: 'system',
      status: 'active',
    },
    {
      id: 'fey',
      label: 'Fey',
      source: 'system',
      status: 'disabled',
    },
    {
      id: 'robot',
      label: 'Robot',
      source: 'campaign',
      status: 'active',
    },
  ],
})

describe('vocabularySeedOptionSchema', () => {
  it('requires id, label, and description', () => {
    expect(
      vocabularySeedOptionSchema.parse({
        id: 'humanoid',
        label: 'Humanoid',
        description: 'People of the world.',
      }),
    ).toEqual({
      id: 'humanoid',
      label: 'Humanoid',
      description: 'People of the world.',
    })
  })
})

describe('vocabularyOptionIdSchema', () => {
  it('accepts lowercase slug ids', () => {
    expect(vocabularyOptionIdSchema.parse('humanoid')).toBe('humanoid')
    expect(vocabularyOptionIdSchema.parse('custom-type')).toBe('custom-type')
  })

  it('rejects invalid slug shapes', () => {
    expect(vocabularyOptionIdSchema.safeParse('Bad Slug').success).toBe(false)
    expect(vocabularyOptionIdSchema.safeParse('UPPER').success).toBe(false)
  })
})

describe('createVocabularyMemberSchema', () => {
  it('accepts ids present in the resolved active set', () => {
    const schema = createVocabularyMemberSchema(activeVocabularyOptionIds(CREATURE_TYPE_SET))
    expect(schema.parse('humanoid')).toBe('humanoid')
    expect(schema.parse('robot')).toBe('robot')
  })

  it('rejects disabled or unknown ids', () => {
    const schema = createVocabularyMemberSchema(activeVocabularyOptionIds(CREATURE_TYPE_SET))
    expect(schema.safeParse('fey').success).toBe(false)
    expect(schema.safeParse('aberration').success).toBe(false)
  })
})

describe('getVocabularyOptionLabel', () => {
  it('returns labels and falls back to the raw id', () => {
    expect(getVocabularyOptionLabel(CREATURE_TYPE_SET, 'humanoid')).toBe('Humanoid')
    expect(getVocabularyOptionLabel(CREATURE_TYPE_SET, 'missing')).toBe('missing')
  })
})

describe('patch and write DTO schemas', () => {
  it('rejects unknown patch fields', () => {
    expect(
      vocabularyOptionSetPatchSchema.safeParse({
        setId: 'creature-types',
        extra: true,
      }).success,
    ).toBe(false)
  })

  it('parses create input for campaign entries', () => {
    expect(
      createVocabularyCampaignEntryInputSchema.safeParse({
        setId: 'creature-types',
        id: 'robot',
        label: 'Robot',
      }).success,
    ).toBe(true)
  })
})
