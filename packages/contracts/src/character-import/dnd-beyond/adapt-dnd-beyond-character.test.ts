import { describe, expect, it } from 'vitest'

import { adaptDndBeyondCharacter } from './adapt-dnd-beyond-character'
import { characterImportResultSchema } from '../adapter/character-import-result.schema'
import {
  CHARACTER_IMPORT_SERVER_OWNED_FIELDS,
  buildCharacterImportCoverage,
} from '../adapter/character-import-coverage-manifest'
import {
  dndBeyondCharacter133058471Payload,
  DND_BEYOND_FIXTURE_CHARACTER_ID,
} from './dnd-beyond-character-fixtures'
import { DND_BEYOND_PAYLOAD_VERSION } from './dnd-beyond-version'

const fixtureSource = {
  provider: 'dnd-beyond' as const,
  payloadVersion: DND_BEYOND_PAYLOAD_VERSION,
  requestedPayloadVersion: DND_BEYOND_PAYLOAD_VERSION,
  supportedPayloadVersion: DND_BEYOND_PAYLOAD_VERSION,
  characterId: DND_BEYOND_FIXTURE_CHARACTER_ID,
  acquisition: 'public-id-fetch' as const,
}

describe('adaptDndBeyondCharacter', () => {
  const result = adaptDndBeyondCharacter(dndBeyondCharacter133058471Payload, fixtureSource)

  it('parses through the result schema', () => {
    expect(() => characterImportResultSchema.parse(result)).not.toThrow()
  })

  it('maps fixture name and ability scores with feat bonuses applied', () => {
    expect(result.extraction.name).toEqual({
      status: 'mapped',
      value: 'Presto',
      sourcePaths: ['data.name'],
      issues: [],
    })
    expect(result.extraction.species.value).toMatchObject({
      sourceValue: 'Human',
      sourceSlug: '1751441-human',
      localSlug: 'human',
      localValue: 'srd-cc-5.2.1:human',
      status: 'mapped',
    })
    expect(result.extraction.abilityScores.value).toEqual({
      str: 8,
      dex: 14,
      con: 12,
      int: 17,
      wis: 10,
      cha: 14,
    })
  })

  it('reports missing alignment for the fixture character', () => {
    expect(result.extraction.alignment.status).toBe('missing-source')
  })

  it('maps current xp only and records adjustment xp as available source data', () => {
    expect(result.extraction.xp.value).toBe(0)
    expect(result.availableSourceData.some((entry) => entry.path === 'data.adjustmentXp')).toBe(
      false,
    )
  })

  it('maps hit point inputs without inferring from class or constitution', () => {
    expect(result.extraction.hitPoints.value).toEqual({ base: 6, temporary: 0 })
  })

  it('extracts languages from modifier groups', () => {
    const languages = result.extraction.languages.value ?? []
    expect(languages.map((entry) => entry.localValue)).toEqual(
      expect.arrayContaining(['common', 'draconic', 'elvish']),
    )
  })

  it('classifies proficiencies across race, class, background, and feat sources', () => {
    const proficiencies = result.extraction.proficiencies.value
    expect(proficiencies).toBeDefined()

    const groups = [
      ...new Set([
        ...proficiencies!.skills.map((entry) => entry.sourceGroup),
        ...proficiencies!.tools.map((entry) => entry.sourceGroup),
      ]),
    ]
    expect(groups).toEqual(expect.arrayContaining(['race', 'class', 'background', 'feat']))

    expect(proficiencies!.skills.length).toBeGreaterThan(0)
    expect(proficiencies!.tools.length).toBeGreaterThan(0)
    expect(proficiencies!.skills.every((entry) => entry.kind === 'skill')).toBe(true)
    expect(proficiencies!.tools.every((entry) => entry.kind === 'tool')).toBe(true)
  })

  it('maps tool proficiencies to local tool categories instead of raw slugs', () => {
    const tools = result.extraction.proficiencies.value?.tools ?? []
    const calligraphy = tools.find((entry) => entry.sourceValue === 'calligraphers-supplies')

    expect(calligraphy).toMatchObject({
      toolId: 'srd-cc-5.2.1:calligraphers-supplies',
      toolCategory: 'artisan',
      localValue: 'artisan',
    })
  })

  it('records ignored saving throw and weapon category proficiencies in dispositions', () => {
    const ignored = result.dispositions.filter((entry) => entry.disposition === 'ignored')
    expect(ignored.map((entry) => entry.sourceValue)).toEqual(
      expect.arrayContaining([
        'intelligence-saving-throws',
        'wisdom-saving-throws',
        'simple-weapons',
      ]),
    )
    expect(result.dispositions.filter((entry) => entry.disposition === 'unsupported')).toHaveLength(
      0,
    )
  })

  it('extracts inventory for equipment preview', () => {
    expect(result.extraction.equipment.status).toBe('mapped')
    const names = result.extraction.equipment.value?.map((entry) => entry.sourceLabel) ?? []
    expect(names).toEqual(expect.arrayContaining(["Calligrapher's Supplies", 'Dagger']))
  })

  it('does not emit derived values in mapped extraction fields', () => {
    const serialized = JSON.stringify(result.extraction)
    expect(serialized).not.toMatch(/proficiencyBonus|armorClass|initiative|spellSave/i)
  })

  it('builds coverage entries for deferred catalog fields separately from extraction', () => {
    const createInputCoverage = buildCharacterImportCoverage(
      result.extraction,
      dndBeyondCharacter133058471Payload,
    )
    const classes = createInputCoverage.find((entry) => entry.targetPath === 'classes')
    const proficiencies = createInputCoverage.find((entry) => entry.targetPath === 'proficiencies')

    expect(classes?.state).toBe('unresolved-reference')
    expect(proficiencies?.state).toBe('deferred')
    expect(result.extraction.proficiencies.status).toBe('mapped')
  })

  it('lists server-owned fields for the Provided when saved group', () => {
    const serverOwned = result.coverage.filter((entry) => entry.state === 'server-owned')
    expect(serverOwned.map((entry) => entry.targetPath).sort()).toEqual(
      [...CHARACTER_IMPORT_SERVER_OWNED_FIELDS].sort(),
    )
  })
})

describe('adaptDndBeyondCharacter edge cases', () => {
  it('maps known alignment ids', () => {
    const adapted = adaptDndBeyondCharacter(
      {
        ...dndBeyondCharacter133058471Payload,
        alignmentId: 2,
      },
      fixtureSource,
    )
    expect(adapted.extraction.alignment.value).toBe('ng')
  })

  it('maps alignment from source string when alignment id is unset', () => {
    const adapted = adaptDndBeyondCharacter(
      {
        ...dndBeyondCharacter133058471Payload,
        alignmentId: null,
        alignment: 'Neutral Good',
      },
      fixtureSource,
    )
    expect(adapted.extraction.alignment.value).toBe('ng')
  })

  it('treats alignment id 0 as missing', () => {
    const adapted = adaptDndBeyondCharacter(
      {
        ...dndBeyondCharacter133058471Payload,
        alignmentId: 0,
      },
      fixtureSource,
    )
    expect(adapted.extraction.alignment.status).toBe('missing-source')
  })

  it('prefers override stats over computed totals', () => {
    const adapted = adaptDndBeyondCharacter(
      {
        ...dndBeyondCharacter133058471Payload,
        overrideStats: [{ id: 4, name: null, value: 20 }],
      },
      fixtureSource,
    )
    expect(adapted.extraction.abilityScores.value?.int).toBe(20)
  })

  it('deduplicates repeated language grants', () => {
    const adapted = adaptDndBeyondCharacter(
      {
        ...dndBeyondCharacter133058471Payload,
        modifiers: {
          race: [
            {
              type: 'language',
              subType: 'common',
            },
            {
              type: 'language',
              subType: 'common',
            },
          ],
        },
      },
      fixtureSource,
    )
    const commonEntries = (adapted.extraction.languages.value ?? []).filter(
      (entry) => entry.localValue === 'common',
    )
    expect(commonEntries).toHaveLength(1)
  })
})
