import { describe, expect, it, vi } from 'vitest'

import type * as NameGeneratorCore from '@rpg/name-generator-core'

import {
  HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
  SPECIES_NAMING_UNSUPPORTED_REASON,
} from './build-species-naming-options'
import { generateSpeciesPersonName } from './generate-species-person-name'
import { resolveSpeciesPersonNameGenerationSupport } from './resolve-species-person-name-generation-support'
import type { SpeciesCultureInput } from './resolve-campaign-conventions'

vi.mock('@rpg/name-generator-core', async (importOriginal) => {
  const actual = await importOriginal<typeof NameGeneratorCore>()
  return {
    ...actual,
    generateName: vi.fn(actual.generateName),
  }
})

import { generateName } from '@rpg/name-generator-core'

const namingCapableDwarf: SpeciesCultureInput = {
  id: 'srd-cc-5.2.1:dwarf',
  slug: 'dwarf',
  name: 'Dwarf',
  source: 'system',
  culture: { naming: { supported: true, personalNameComponents: ['clan'] } },
  languageAffinities: ['dwarvish'],
}

const unsupportedSpecies: SpeciesCultureInput = {
  id: 'srd-cc-5.2.1:customfolk',
  slug: 'customfolk',
  name: 'Customfolk',
  source: 'system',
}

const homebrewSpecies: SpeciesCultureInput = {
  id: 'homebrew:river-folk',
  slug: 'river-folk',
  name: 'River Folk',
  source: 'homebrew',
  culture: { naming: { supported: true } },
}

describe('resolveSpeciesPersonNameGenerationSupport', () => {
  it('enables generation for a naming-capable dwarf', () => {
    expect(resolveSpeciesPersonNameGenerationSupport(namingCapableDwarf)).toEqual({ enabled: true })
  })

  it('disables generation for unsupported species with the canonical reason', () => {
    expect(resolveSpeciesPersonNameGenerationSupport(unsupportedSpecies)).toEqual({
      enabled: false,
      disabledReason: SPECIES_NAMING_UNSUPPORTED_REASON,
    })
  })

  it('inherits homebrew naming policy from buildSpeciesNamingOption', () => {
    expect(resolveSpeciesPersonNameGenerationSupport(homebrewSpecies)).toEqual({
      enabled: false,
      disabledReason: HOMEBREW_SPECIES_NAMING_DISABLED_REASON,
    })
  })
})

describe('generateSpeciesPersonName', () => {
  it('returns a non-empty name for a naming-capable dwarf', async () => {
    const result = await generateSpeciesPersonName(namingCapableDwarf)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.name.trim().length).toBeGreaterThan(0)
    }
  })

  it('reports unsupported species without treating it as a generation failure', async () => {
    const result = await generateSpeciesPersonName(unsupportedSpecies)

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

    const result = await generateSpeciesPersonName(namingCapableDwarf)

    expect(result).toEqual({ ok: false, kind: 'generation_failed' })
  })
})
