import { describe, expect, it } from 'vitest'

import type { VocabularyOptionSet, VocabularyOptionSetPatch } from '@rpg/contracts'

import { resolveVocabularySet } from './resolve-vocabulary'

const SEED: VocabularyOptionSet = {
  id: 'creature-types',
  options: [
    {
      id: 'humanoid',
      label: 'Humanoid',
      description: 'People.',
      source: 'system',
      status: 'active',
    },
    {
      id: 'fey',
      label: 'Fey',
      description: 'Feywild folk.',
      source: 'system',
      status: 'active',
    },
  ],
}

describe('resolveVocabularySet', () => {
  it('returns seed options when no patch is stored', () => {
    expect(resolveVocabularySet(SEED, undefined)).toEqual(SEED.options)
  })

  it('merges system entry patches for label, description, and status', () => {
    const patch: VocabularyOptionSetPatch = {
      setId: 'creature-types',
      systemEntryPatches: [
        { id: 'humanoid', label: 'People', status: 'disabled' },
        { id: 'fey', description: 'Custom fey text.' },
      ],
    }

    expect(resolveVocabularySet(SEED, patch)).toEqual([
      {
        id: 'humanoid',
        label: 'People',
        description: 'People.',
        source: 'system',
        status: 'disabled',
      },
      {
        id: 'fey',
        label: 'Fey',
        description: 'Custom fey text.',
        source: 'system',
        status: 'active',
      },
    ])
  })

  it('appends campaign-created entries and ignores removed ids', () => {
    const patch: VocabularyOptionSetPatch = {
      setId: 'creature-types',
      campaignEntries: [
        { id: 'robot', label: 'Robot', status: 'active' },
        { id: 'retired', label: 'Retired', status: 'active' },
      ],
      removedCampaignEntryIds: ['retired'],
    }

    const resolved = resolveVocabularySet(SEED, patch)
    expect(resolved.find((option) => option.id === 'robot')).toMatchObject({
      source: 'campaign',
      label: 'Robot',
    })
    expect(resolved.some((option) => option.id === 'retired')).toBe(false)
  })

  it('does not duplicate system ids with campaign entries', () => {
    const patch: VocabularyOptionSetPatch = {
      setId: 'creature-types',
      campaignEntries: [{ id: 'humanoid', label: 'Duplicate', status: 'active' }],
    }

    const resolved = resolveVocabularySet(SEED, patch)
    expect(resolved.filter((option) => option.id === 'humanoid')).toHaveLength(1)
    expect(resolved.find((option) => option.id === 'humanoid')?.source).toBe('system')
  })

  it('merges deterministically for combined patches', () => {
    const patch: VocabularyOptionSetPatch = {
      setId: 'creature-types',
      systemEntryPatches: [{ id: 'fey', status: 'disabled' }],
      campaignEntries: [{ id: 'robot', label: 'Robot', status: 'active' }],
    }

    expect(resolveVocabularySet(SEED, patch)).toEqual([
      {
        id: 'humanoid',
        label: 'Humanoid',
        description: 'People.',
        source: 'system',
        status: 'active',
      },
      {
        id: 'fey',
        label: 'Fey',
        description: 'Feywild folk.',
        source: 'system',
        status: 'disabled',
      },
      {
        id: 'robot',
        label: 'Robot',
        description: undefined,
        source: 'campaign',
        status: 'active',
      },
    ])
  })
})
