import { describe, expect, it } from 'vitest'
import {
  CONTENT_SOURCES,
  contentMetaSchema,
  contentPatchBaseSchema,
  contentSourceSchema,
  slugSchema,
} from './content'

const systemMeta = {
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

describe('contentSourceSchema', () => {
  it('accepts every known source', () => {
    for (const source of CONTENT_SOURCES) {
      expect(contentSourceSchema.parse(source)).toBe(source)
    }
  })

  it('rejects unknown sources', () => {
    expect(contentSourceSchema.safeParse('official').success).toBe(false)
  })
})

describe('slugSchema', () => {
  it('accepts lowercase, hyphen-separated keys', () => {
    expect(slugSchema.parse('fighter')).toBe('fighter')
    expect(slugSchema.parse('sleight-of-hand')).toBe('sleight-of-hand')
  })

  it('rejects uppercase, spaces, and leading/trailing/double hyphens', () => {
    expect(slugSchema.safeParse('Fighter').success).toBe(false)
    expect(slugSchema.safeParse('animal handling').success).toBe(false)
    expect(slugSchema.safeParse('-fighter').success).toBe(false)
    expect(slugSchema.safeParse('fighter-').success).toBe(false)
    expect(slugSchema.safeParse('sleight--of-hand').success).toBe(false)
  })
})

describe('contentMetaSchema', () => {
  it('accepts a system record with a null campaignId', () => {
    expect(contentMetaSchema.parse(systemMeta)).toEqual(systemMeta)
  })

  it('accepts a homebrew record with a campaignId', () => {
    const homebrew = { ...systemMeta, source: 'homebrew', campaignId: 'camp_123' }
    expect(contentMetaSchema.parse(homebrew)).toEqual(homebrew)
  })

  it('rejects an invalid slug or ruleset', () => {
    expect(contentMetaSchema.safeParse({ ...systemMeta, slug: 'Fighter' }).success).toBe(false)
    expect(contentMetaSchema.safeParse({ ...systemMeta, rulesetId: 'srd-9.9.9' }).success).toBe(
      false,
    )
  })
})

describe('contentPatchBaseSchema', () => {
  it('accepts a well-formed patch envelope', () => {
    const patch = {
      id: 'patch_1',
      campaignId: 'camp_123',
      targetId: 'srd-cc-5.2.1:fighter',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }
    expect(contentPatchBaseSchema.parse(patch)).toEqual(patch)
  })

  it('requires campaignId and targetId', () => {
    expect(
      contentPatchBaseSchema.safeParse({
        id: 'patch_1',
        campaignId: '',
        targetId: 'srd-cc-5.2.1:fighter',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }).success,
    ).toBe(false)
  })
})
