import { contentTraitSchema, defineSenseTemplate } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { traitToFormRow } from '../../../species/lib/species-trait-form-values'
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

  it('resolves grant sense traits as a rules block', () => {
    const resolution = resolveTraitPersistedFacing({
      kind: 'grant',
      id: 'darkvision',
      grantGroups: [
        {
          level: 1,
          grants: [{ kind: 'sense', type: 'darkvision', range: 60 }],
        },
      ],
    } as never)
    expect(resolution.status).toBe('ready')
    if (resolution.status !== 'ready') return
    expect(resolution.document.title).toMatch(/Darkvision/i)
    expect(resolution.document.blocks).toEqual([
      {
        kind: 'rules',
        document: [[{ kind: 'text', value: 'You have Darkvision with a range of 60 feet.' }]],
      },
    ])
  })

  it('composes sense template rules once and appends details as rich text', () => {
    const trait = contentTraitSchema.parse({
      kind: 'template',
      id: 'darkvision',
      templateId: defineSenseTemplate('darkvision'),
      config: { range: 120 },
      details: '<p>Extra author notes.</p>',
    })
    const resolution = resolveTraitPersistedFacing(trait)
    expect(resolution.status).toBe('ready')
    if (resolution.status !== 'ready') return
    expect(resolution.document.blocks).toEqual([
      {
        kind: 'rules',
        document: [[{ kind: 'text', value: 'You have Darkvision with a range of 120 feet.' }]],
      },
      { kind: 'richText', html: '<p>Extra author notes.</p>' },
    ])
  })
})

describe('sense facing parity', () => {
  it('matches draft preview to persisted sense template facing', () => {
    const trait = contentTraitSchema.parse({
      kind: 'template',
      id: 'darkvision',
      templateId: defineSenseTemplate('darkvision'),
      config: { range: 120 },
    })
    const row = { ...traitToFormRow(trait), id: trait.id }
    expect(resolveSpeciesTraitDraftFacing(row)).toEqual(resolveTraitPersistedFacing(trait))
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

describe('legendary resistance heading parity', () => {
  it('matches species and monster composer titles for the same config', () => {
    const row = {
      id: 'lr',
      kind: 'template' as const,
      templateId: 'legendary-resistance',
      config: { uses: { normal: 3 } },
    }
    const species = resolveSpeciesTraitDraftFacing({
      ...row,
      grants: [],
      overrideDisplay: false,
      available: true,
    })
    const monster = resolveMonsterTraitDraftFacing({
      row,
      monster: {
        name: 'Lich',
        lair: { enabled: false },
        forms: { profileFormId: 'true', trueForm: { kind: 'profile' }, definedForms: [] },
      },
    })
    expect(species?.status).toBe('ready')
    expect(monster?.status).toBe('ready')
    if (species?.status !== 'ready' || monster?.status !== 'ready') return
    expect(species.document.title).toBe(monster.document.title)
    expect(species.document.title).toBe('Legendary Resistance (3/Day)')
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
