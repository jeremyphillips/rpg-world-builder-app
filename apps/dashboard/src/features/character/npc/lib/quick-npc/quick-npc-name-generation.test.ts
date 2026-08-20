import { describe, expect, it, vi } from 'vitest'

import {
  HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
  SPECIES_NAMING_UNSUPPORTED_REASON,
} from '@rpg/name-generator-integrations'

import type * as NameGeneratorCore from '@rpg/name-generator-core'

import {
  createCampaignNpcBuilderContextFixture,
  homebrewSpeciesFixture,
  populatedBuilderCatalog,
  unsupportedNamingDwarfSpecies,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  generateQuickNpcName,
  resolveQuickNpcNameGenerationSupport,
} from './quick-npc-name-generation'

vi.mock('@rpg/name-generator-core', async (importOriginal) => {
  const actual = await importOriginal<typeof NameGeneratorCore>()
  return {
    ...actual,
    generateName: vi.fn(actual.generateName),
  }
})

import { generateName } from '@rpg/name-generator-core'

const namingContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    species: [populatedBuilderCatalog.species[0]!],
  },
})

describe('resolveQuickNpcNameGenerationSupport', () => {
  it('enables Generate for a naming-capable dwarf', () => {
    expect(
      resolveQuickNpcNameGenerationSupport({
        speciesId: 'srd-cc-5.2.1:dwarf',
        context: namingContext,
      }),
    ).toEqual({ enabled: true })
  })

  it('disables Generate for unsupported species with the canonical reason', () => {
    const context = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        species: [unsupportedNamingDwarfSpecies],
      },
    })

    expect(
      resolveQuickNpcNameGenerationSupport({
        speciesId: unsupportedNamingDwarfSpecies.id,
        context,
      }),
    ).toEqual({
      enabled: false,
      disabledReason: SPECIES_NAMING_UNSUPPORTED_REASON,
    })
  })

  it('inherits homebrew naming policy without a Quick-NPC-specific branch', () => {
    const context = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        species: [homebrewSpeciesFixture],
      },
    })

    expect(
      resolveQuickNpcNameGenerationSupport({
        speciesId: homebrewSpeciesFixture.id,
        context,
      }),
    ).toEqual({
      enabled: false,
      disabledReason: HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
    })
  })
})

describe('generateQuickNpcName', () => {
  it('returns a non-empty name for a naming-capable dwarf', async () => {
    const result = await generateQuickNpcName({
      speciesId: 'srd-cc-5.2.1:dwarf',
      context: namingContext,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.name.trim().length).toBeGreaterThan(0)
    }
  })

  it('reports unsupported species without treating it as a generation failure', async () => {
    const context = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        species: [unsupportedNamingDwarfSpecies],
      },
    })

    const result = await generateQuickNpcName({
      speciesId: unsupportedNamingDwarfSpecies.id,
      context,
    })

    expect(result).toEqual({
      ok: false,
      kind: 'unsupported',
      reason: SPECIES_NAMING_UNSUPPORTED_REASON,
    })
  })

  it('reports generation failure separately from unsupported species', async () => {
    vi.mocked(generateName).mockImplementationOnce(() => {
      throw new Error('generator exploded')
    })

    const result = await generateQuickNpcName({
      speciesId: 'srd-cc-5.2.1:dwarf',
      context: namingContext,
    })

    expect(result).toEqual({ ok: false, kind: 'generation_failed' })
  })
})
