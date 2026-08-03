import { describe, expect, it } from 'vitest'

import { BUILDING_CORPUS_DISPOSITIONS, BUILDING_CORPUS_IDS } from './building-corpus-disposition'
import { BUILDING_ARCHETYPE_ENTRIES_A_C } from './building-archetypes/a-c'
import { BUILDING_ARCHETYPE_ENTRIES_D_G } from './building-archetypes/d-g'
import { BUILDING_ARCHETYPE_ENTRIES_H_L } from './building-archetypes/h-l'
import { BUILDING_ARCHETYPE_ENTRIES_M_P } from './building-archetypes/m-p'
import { BUILDING_ARCHETYPE_ENTRIES_Q_T } from './building-archetypes/q-t'
import { BUILDING_ARCHETYPE_ENTRIES_U_Z } from './building-archetypes/u-z'
import { BUILDING_ARCHETYPE_SHARD_ENTRIES } from './building-archetypes'
import {
  BUILDING_FUNCTION_FAMILY_ENTRIES,
  type BuildingFunctionFamily,
} from './building-function-family'
import {
  BUILDING_ARCHETYPE_ENTRIES,
  BUILDING_ARCHETYPE_IDS,
  getBuildingArchetypeAliases,
  getBuildingArchetypeDiscoveryTerms,
  getBuildingArchetypeSearchTerms,
  getBuildingManifestationRoot,
  getBuildingSpecializationTerms,
  type BuildingArchetype,
} from './building-archetype'

const BUILDING_ARCHETYPE_SHARDS = [
  BUILDING_ARCHETYPE_ENTRIES_A_C,
  BUILDING_ARCHETYPE_ENTRIES_D_G,
  BUILDING_ARCHETYPE_ENTRIES_H_L,
  BUILDING_ARCHETYPE_ENTRIES_M_P,
  BUILDING_ARCHETYPE_ENTRIES_Q_T,
  BUILDING_ARCHETYPE_ENTRIES_U_Z,
] as const

function normalizeTerms(terms: readonly string[] | undefined): readonly string[] {
  if (!terms) return []
  const seen = new Set<string>()
  const normalized: string[] = []
  for (const term of terms) {
    const value = term.trim().toLowerCase()
    if (!value || seen.has(value)) continue
    seen.add(value)
    normalized.push(value)
  }
  return normalized
}

function rootDiscoveryTerms(root: BuildingArchetype): Set<string> {
  const rootEntry = BUILDING_ARCHETYPE_ENTRIES[root]
  const terms = new Set<string>()
  terms.add(rootEntry.label.trim().toLowerCase())
  for (const alias of getBuildingArchetypeAliases(root)) {
    terms.add(alias)
  }
  for (const term of getBuildingArchetypeSearchTerms(root)) {
    terms.add(term)
  }
  return terms
}

describe('building archetype registry integrity', () => {
  it('keeps unique archetype ids with valid labels and one or two functions', () => {
    expect(new Set(BUILDING_ARCHETYPE_IDS).size).toBe(BUILDING_ARCHETYPE_IDS.length)

    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      expect(entry.label).not.toBe('')
      expect(entry.description).not.toBe('')
      expect(entry.functions.length).toBeGreaterThanOrEqual(1)
      expect(entry.functions.length).toBeLessThanOrEqual(2)

      for (const fn of entry.functions) {
        expect(fn).toBeDefined()
        expect(BUILDING_FUNCTION_FAMILY_ENTRIES[fn as BuildingFunctionFamily]).toBeDefined()
      }
    }
  })

  it('keeps manifestationOf targets valid with no self-reference or cycles', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      if (!('manifestationOf' in entry) || !entry.manifestationOf) continue

      const parent = entry.manifestationOf
      expect(parent).not.toBe(id)
      expect(BUILDING_ARCHETYPE_ENTRIES[parent as BuildingArchetype]).toBeDefined()
      expect(getBuildingManifestationRoot(id)).not.toBe(id)
    }
  })

  it('normalizes search terms to lowercase trimmed deduplicated values', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      if (!('searchTerms' in entry) || !entry.searchTerms) continue

      expect(entry.searchTerms).toEqual(normalizeTerms(entry.searchTerms))
      for (const term of entry.searchTerms) {
        expect(term).toBe(term.trim().toLowerCase())
      }
    }
  })

  it('normalizes aliases to lowercase trimmed deduplicated values', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      if (!('aliases' in entry) || !entry.aliases) continue

      expect(entry.aliases).toEqual(normalizeTerms(entry.aliases))
      for (const alias of entry.aliases) {
        expect(alias).toBe(alias.trim().toLowerCase())
      }
    }
  })

  it('keeps aliases and searchTerms disjoint and aliases distinct from label', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      const label = entry.label.trim().toLowerCase()
      const aliases = normalizeTerms(getBuildingArchetypeAliases(id))
      const searchTerms = normalizeTerms(getBuildingArchetypeSearchTerms(id))

      for (const alias of aliases) {
        expect(alias).not.toBe(label)
      }

      const aliasSet = new Set(aliases)
      for (const term of searchTerms) {
        expect(aliasSet.has(term)).toBe(false)
      }
    }
  })

  it('keeps manifestation discovery terms from duplicating inherited root vocabulary', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      if (!('manifestationOf' in entry) || !entry.manifestationOf) continue

      const root = entry.manifestationOf as BuildingArchetype
      const inherited = rootDiscoveryTerms(root)
      const ownAliases = normalizeTerms(getBuildingArchetypeAliases(id))
      const ownSearchTerms = normalizeTerms(getBuildingArchetypeSearchTerms(id))

      for (const term of [...ownAliases, ...ownSearchTerms]) {
        expect(inherited.has(term)).toBe(false)
      }
    }
  })

  it('composes manifestation discovery terms from root label, aliases, and searchTerms', () => {
    const terms = getBuildingArchetypeDiscoveryTerms('caravanserai')
    expect(terms).toEqual(expect.arrayContaining(['caravan', 'traveler', 'inn']))
    expect(terms.indexOf('caravan')).toBeLessThan(terms.indexOf('inn'))
  })

  it('normalizes specializationTerms to lowercase trimmed deduplicated values', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      if (!('specializationTerms' in entry) || !entry.specializationTerms) continue

      expect(entry.specializationTerms).toEqual(normalizeTerms(entry.specializationTerms))
      for (const term of entry.specializationTerms) {
        expect(term).toBe(term.trim().toLowerCase())
      }
    }
  })

  it('keeps specializationTerms distinct from label, aliases, and searchTerms', () => {
    for (const id of BUILDING_ARCHETYPE_IDS) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      const label = entry.label.trim().toLowerCase()
      const aliases = normalizeTerms(getBuildingArchetypeAliases(id))
      const searchTerms = normalizeTerms(getBuildingArchetypeSearchTerms(id))
      const specializationTerms = normalizeTerms(getBuildingSpecializationTerms(id))

      for (const term of specializationTerms) {
        expect(term).not.toBe(label)
        expect(aliases).not.toContain(term)
        expect(searchTerms).not.toContain(term)
      }
    }
  })

  it('exposes registry specialization suggestions via getBuildingSpecializationTerms', () => {
    expect(getBuildingSpecializationTerms('inn')).toEqual(
      expect.arrayContaining(['ferry house', 'roadside inn']),
    )
    expect(getBuildingSpecializationTerms('temple')).toEqual(
      expect.arrayContaining(['cathedral', 'sea temple', 'funerary temple']),
    )
    expect(getBuildingSpecializationTerms('granary')).toEqual(expect.arrayContaining(['silo']))
  })

  it('keeps shard ids disjoint with composed count matching shard sum', () => {
    const shardKeyCounts = BUILDING_ARCHETYPE_SHARDS.map((shard) => Object.keys(shard).length)
    const composedKeyCount = Object.keys(BUILDING_ARCHETYPE_SHARD_ENTRIES).length
    expect(composedKeyCount).toBe(shardKeyCounts.reduce((sum, count) => sum + count, 0))

    const seen = new Set<string>()
    for (const shard of BUILDING_ARCHETYPE_SHARDS) {
      for (const id of Object.keys(shard)) {
        expect(seen.has(id)).toBe(false)
        seen.add(id)
      }
    }
  })

  it('maps every corpus id to exactly one disposition', () => {
    expect(BUILDING_CORPUS_IDS.length).toBe(308)
    expect(new Set(BUILDING_CORPUS_IDS).size).toBe(308)

    for (const id of BUILDING_CORPUS_IDS) {
      expect(BUILDING_CORPUS_DISPOSITIONS[id]).toBeDefined()
    }

    expect(Object.keys(BUILDING_CORPUS_DISPOSITIONS).length).toBe(308)
  })

  it('rejects placeholder targets on specialization and manifestation dispositions', () => {
    const knownIds = new Set<string>([...BUILDING_ARCHETYPE_IDS, ...BUILDING_CORPUS_IDS])

    for (const id of BUILDING_CORPUS_IDS) {
      const disposition = BUILDING_CORPUS_DISPOSITIONS[id]
      if (disposition.kind !== 'specialization' && disposition.kind !== 'manifestation') {
        continue
      }

      const target = disposition.of
      expect(target, `${id} ${disposition.kind} of`).not.toBe('n')
      expect(target.trim(), `${id} ${disposition.kind} of`).not.toBe('')
      expect(
        knownIds.has(target),
        `${id} ${disposition.kind} of "${target}" must be a corpus or archetype id`,
      ).toBe(true)
    }
  })

  it('reconciles the 88 audited specialization terms to exactly one final disposition', () => {
    const allSpecializationTerms = new Map<string, BuildingArchetype>()
    for (const id of BUILDING_ARCHETYPE_IDS) {
      for (const term of getBuildingSpecializationTerms(id)) {
        expect(allSpecializationTerms.has(term), `duplicate specialization term: ${term}`).toBe(
          false,
        )
        allSpecializationTerms.set(term, id)
      }
    }

    const additions = new Set(['sawmill', 'livery stable'])
    const promotedArchetypeLabels = new Map<string, BuildingArchetype>([
      ['barber surgeon', 'barber_surgeon'],
      ['boathouse', 'boathouse'],
      ['clock tower', 'clock_tower'],
      ['cooperage', 'cooperage'],
      ['distillery', 'distillery'],
      ['harbourmaster office', 'harbourmaster_office'],
      ['opium den', 'opium_den'],
      ['schoolhouse', 'schoolhouse'],
      ['smokehouse', 'smokehouse'],
      ['wheelwright', 'wheelwright'],
    ])
    const promotedManifestationLabels = new Map<string, BuildingArchetype>([
      ['houseboat', 'houseboat'],
      ['igloo', 'igloo'],
      ['tipi', 'tipi'],
      ['yurt', 'yurt'],
    ])
    const removedTerms = new Set([
      'baptistery',
      'divination parlor',
      'enchanting hall',
      'gamekeepers cottage',
      'hunting lodge wing',
      'malt house',
      'oast house',
      'portal chamber',
      'residential lodging house',
      'summoning hall',
      'temple infirmary',
      'tent pavilion',
      'well house',
    ])
    const movedTerms: Record<string, BuildingArchetype> = {
      'artificer atelier': 'factory',
      'bounty office': 'adventurers_guild',
      silo: 'granary',
      tollhouse: 'checkpoint',
      workhouse: 'poorhouse',
    }
    const renamedFrom = 'elven tree dwelling'
    const renamedTo = 'tree dwelling'

    const auditedTerms = [
      ...[...allSpecializationTerms.keys()].filter((term) => !additions.has(term)),
      ...removedTerms,
      ...promotedArchetypeLabels.keys(),
      ...promotedManifestationLabels.keys(),
    ]
    expect(new Set(auditedTerms).size).toBe(88)

    for (const term of removedTerms) {
      expect(allSpecializationTerms.has(term), `removed term still present: ${term}`).toBe(false)
    }
    expect(allSpecializationTerms.get(renamedTo)).toBe('house')
    expect(allSpecializationTerms.has(renamedFrom)).toBe(false)

    for (const [term, parent] of Object.entries(movedTerms)) {
      expect(allSpecializationTerms.get(term)).toBe(parent)
    }

    for (const [label, id] of promotedArchetypeLabels) {
      expect(BUILDING_ARCHETYPE_ENTRIES[id].label.trim().toLowerCase()).toBe(label)
      expect(getBuildingSpecializationTerms(id)).toEqual([])
    }
    for (const [label, id] of promotedManifestationLabels) {
      const entry = BUILDING_ARCHETYPE_ENTRIES[id]
      expect(entry.label.trim().toLowerCase()).toBe(label)
      expect('manifestationOf' in entry && entry.manifestationOf).toBe('house')
      expect(getBuildingSpecializationTerms(id)).toEqual([])
    }

    expect(getBuildingSpecializationTerms('wizard_tower')).toEqual([])
    expect(getBuildingSpecializationTerms('mill')).toEqual(expect.arrayContaining(['sawmill']))
    expect(getBuildingSpecializationTerms('stable')).toEqual(
      expect.arrayContaining(['livery stable']),
    )
  })
})
