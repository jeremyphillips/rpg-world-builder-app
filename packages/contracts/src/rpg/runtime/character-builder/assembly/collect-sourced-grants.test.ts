import { describe, expect, it } from 'vitest'

import type { Species } from '../../../content/species'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { indexCharacterBuildCatalog, type CharacterBuildCatalog } from '../context'
import { proficiencyTestCatalog } from '../proficiency-test-fixtures'
import { collectSourcedGrants } from './collect-sourced-grants'

const species = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  rulesetId: 'srd-cc-5.2.1',
  catalogLayer: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Elf',
  description: '<p>Keen and magical.</p>',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  traits: [
    {
      kind: 'template',
      id: 'magic-resistance',
      templateId: 'magic-resistance',
    },
    {
      kind: 'template',
      id: 'magic-resistance-again',
      templateId: 'magic-resistance',
    },
    {
      kind: 'template',
      id: 'hidden',
      templateId: 'pack-tactics',
      available: false,
    },
  ],
} satisfies Species

const catalog: CharacterBuildCatalog = {
  ...proficiencyTestCatalog,
  species: [species],
}

describe('collectSourcedGrants creature traits', () => {
  it('expands template traits, dedupes one template id, and drops unavailable rows', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: species.id },
    }
    const sourced = collectSourcedGrants(draft, indexCharacterBuildCatalog(catalog))
    const magic = sourced.filter((row) => row.grant.kind === 'rollAdjustment')

    expect(magic).toHaveLength(1)
    expect(magic[0]?.grant).toMatchObject({
      id: 'magic-resistance-effect',
      mode: 'advantage',
      circumstance: { kind: 'vs-magic' },
    })
    expect(magic[0]?.sources.map((source) => source.grantId)).toEqual([
      'magic-resistance',
      'magic-resistance-again',
    ])
    expect(sourced.some((row) => row.sources.some((source) => source.grantId === 'hidden'))).toBe(
      false,
    )
  })
})
