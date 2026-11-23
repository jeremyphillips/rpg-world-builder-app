import { describe, expect, it } from 'vitest'

import {
  resolveMonsterTraitDraftFacing,
  resolveSpeciesTraitDraftFacing,
  resolveTraitPersistedFacing,
} from './resolve-trait-facing'

describe('resolveTraitPersistedFacing', () => {
  it('returns ready custom trait text from stored description', () => {
    const resolution = resolveTraitPersistedFacing({
      kind: 'custom',
      id: 'rage',
      name: 'Rage',
      description: '<p>Enter a frenzy.</p>',
    })
    expect(resolution.status).toBe('ready')
    if (resolution.status !== 'ready') return
    expect(resolution.document.title).toBe('Rage')
    expect(resolution.document.blocks).toEqual([
      { kind: 'richText', html: '<p>Enter a frenzy.</p>' },
    ])
  })

  it('resolves grant trait display without overrides', () => {
    const resolution = resolveTraitPersistedFacing({
      kind: 'grant',
      id: 'darkvision',
      grantGroups: [
        {
          level: 1,
          grants: [{ kind: 'sense', type: 'darkvision', range: 60 }],
        },
      ],
    })
    expect(resolution.status).toBe('ready')
    if (resolution.status !== 'ready') return
    expect(resolution.document.title).toMatch(/Darkvision/i)
  })
})

describe('resolveSpeciesTraitDraftFacing', () => {
  it('omits preview for custom rows', () => {
    expect(
      resolveSpeciesTraitDraftFacing({
        id: 't1',
        kind: 'custom',
        name: 'Lucky',
        description: '',
        grants: [],
        overrideDisplay: false,
        available: true,
      }),
    ).toBeUndefined()
  })
})

describe('resolveMonsterTraitDraftFacing', () => {
  it('previews preset sentences in the shell panel', () => {
    const resolution = resolveMonsterTraitDraftFacing({
      row: { id: 'fly', preset: 'flyby' },
      monster: { name: 'Owl' },
    })
    expect(resolution?.status).toBe('ready')
    if (!resolution || resolution.status !== 'ready') return
    expect(resolution.document.title).toBe('Flyby')
    expect(resolution.document.blocks.some((block) => block.kind === 'rules')).toBe(true)
  })
})
