import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { BUILDING_FACILITY_TYPE_IDS, BUILDING_FORM_IDS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  BUILDING_ARCHETYPE_REFACTOR_INVENTORY,
  BUILDING_ARCHETYPE_REFACTOR_STATUS,
  BUILDING_CORPUS_DISPOSITIONS,
  BUILDING_RESEARCH_CORPUS_IDS,
  LEGACY_RUNTIME_BUILDING_ARCHETYPE_IDS,
  SWEEP_BUNDLED_FORM_ACTOR_DECOMPOSE_IDS,
  SWEEP_CANONICAL_SUFFICIENT_DECOMPOSE_IDS,
  SWEEP_OUTSIDE_BUILDING_CLASSIFICATION_IDS,
  SWEEP_OVERLAY_COMPOSITION_DECOMPOSE_IDS,
  SWEEP_PRIOR_DECOMPOSE_IDS,
  SWEEP_STATUS_AUTHORITY_DECOMPOSE_IDS,
  SWEEP_TRADE_OPERATOR_DECOMPOSE_IDS,
  TIER_C_COMPOSITE_QUEUE_IDS,
  TIER_C_DECOMPOSE_IDS,
  TIER_C_OUTSIDE_BUILDING_CLASSIFICATION_IDS,
  TIER_C_REVIEWED_PENDING_IDS,
  PHASE_19A_MORPHOLOGY_ALLOWLIST_IDS,
  PHASE_19A_MORPHOLOGY_CULTURAL_EXPRESSION_IDS,
  PHASE_19A_MORPHOLOGY_FORTIFICATION_IDS,
  PHASE_19A_MORPHOLOGY_SITE_CONTEXT_IDS,
  PHASE_19A_FORTIFICATION_DECOMPOSE_IDS,
  PHASE_19A_FORTIFICATION_NEEDS_DESIGN_IDS,
  PHASE_19A_CULTURAL_DECOMPOSE_IDS,
  PHASE_19A_CULTURAL_OUTSIDE_BUILDING_CLASSIFICATION_IDS,
  PHASE_19A_SITE_CONTEXT_DECOMPOSE_IDS,
  PHASE_19A_DECOMPOSE_IDS,
  PHASE_19A_OUTSIDE_BUILDING_CLASSIFICATION_IDS,
  PHASE_19B_APPROXIMATE_FACILITY_ALLOWLIST_IDS,
  PHASE_19B_DECOMPOSE_IDS,
  PHASE_19C_CANDIDATE_IDS,
  PHASE_19C_NO_PROMOTION_IDS,
} from './building-archetype-refactor-inventory'

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])
const IGNORED_SOURCE_DIRECTORIES = new Set(['node_modules', 'dist', '.next', 'coverage'])
const INVENTORY_MODULE_NAME = 'building-archetype-refactor-inventory'
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

function sourceFilesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      return IGNORED_SOURCE_DIRECTORIES.has(entry.name) ? [] : sourceFilesUnder(path)
    }
    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : []
  })
}

const SWEEP_FALSE_POSITIVE_PENDING_IDS = ['pigsty', 'tent_pavilion'] as const

describe('Building archetype refactor inventory', () => {
  it('accounts for all researched and formerly-runtime concepts exactly once', () => {
    expect(BUILDING_RESEARCH_CORPUS_IDS).toHaveLength(308)
    expect(new Set(BUILDING_RESEARCH_CORPUS_IDS).size).toBe(308)
    expect(LEGACY_RUNTIME_BUILDING_ARCHETYPE_IDS).toHaveLength(143)
    expect(new Set(LEGACY_RUNTIME_BUILDING_ARCHETYPE_IDS).size).toBe(143)
    expect(BUILDING_ARCHETYPE_REFACTOR_INVENTORY).toHaveLength(308)
    expect(new Set(BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id }) => id)).size).toBe(308)

    for (const id of BUILDING_RESEARCH_CORPUS_IDS) {
      expect(BUILDING_CORPUS_DISPOSITIONS[id]).toBeDefined()
    }
    expect(Object.keys(BUILDING_CORPUS_DISPOSITIONS)).toHaveLength(308)
  })

  it('keeps specialization and manifestation targets within the research corpus', () => {
    const knownIds = new Set<string>(BUILDING_RESEARCH_CORPUS_IDS)

    for (const id of BUILDING_RESEARCH_CORPUS_IDS) {
      const disposition = BUILDING_CORPUS_DISPOSITIONS[id]
      if (disposition.kind !== 'specialization' && disposition.kind !== 'manifestation') continue

      expect(disposition.of).not.toBe('n')
      expect(disposition.of.trim()).not.toBe('')
      expect(knownIds.has(disposition.of), `${id} targets ${disposition.of}`).toBe(true)
    }
  })

  it('derives shipped Form and Facility alignment from canonical registries', () => {
    const corpusIds = new Set<string>(BUILDING_RESEARCH_CORPUS_IDS)
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    const formIds = new Set<string>(BUILDING_FORM_IDS)
    const facilityIds = new Set<string>(BUILDING_FACILITY_TYPE_IDS)
    for (const id of formIds) {
      expect(facilityIds.has(id)).toBe(false)
    }

    for (const formId of BUILDING_FORM_IDS) {
      if (!corpusIds.has(formId)) continue
      expect(statusById.get(formId as never)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledForm)
    }

    for (const facilityId of BUILDING_FACILITY_TYPE_IDS) {
      if (!corpusIds.has(facilityId)) continue
      expect(statusById.get(facilityId as never)).toBe(
        BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility,
      )
    }

    expect(statusById.get('house')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledForm)
    expect(statusById.get('tower')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledForm)
    expect(statusById.get('keep')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledForm)
    expect(statusById.get('checkpoint')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('lighthouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('bathhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('observatory')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('embassy')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('schoolhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('barn')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('granary')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('greenhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('arena')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    expect(statusById.get('blacksmith')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.rehomeToOrganizationActivity,
    )
    expect(statusById.get('gatehouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('apothecary')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('manor')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('wizard_tower')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('blockhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.needsDesign)
  })

  it('does not require non-corpus shipped ids in the inventory', () => {
    const inventoryIds = new Set(BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id }) => id))

    for (const formId of BUILDING_FORM_IDS) {
      if (inventoryIds.has(formId as never)) continue
      expect(formId).toBe('hall')
    }

    for (const facilityId of BUILDING_FACILITY_TYPE_IDS) {
      if (inventoryIds.has(facilityId as never)) continue
      expect(facilityId).toBe('residence')
    }
  })

  it('rejects explicit inventory rows that contradict shipped registries', () => {
    for (const formId of BUILDING_FORM_IDS) {
      expect(
        BUILDING_ARCHETYPE_REFACTOR_INVENTORY.find(({ id }) => id === formId)?.status,
      ).not.toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.rehomeToOrganizationActivity)
    }

    for (const facilityId of BUILDING_FACILITY_TYPE_IDS) {
      expect(
        BUILDING_ARCHETYPE_REFACTOR_INVENTORY.find(({ id }) => id === facilityId)?.status,
      ).not.toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.rehomeToOrganizationActivity)
    }

    expect(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.find(({ id }) => id === 'blacksmith')?.status,
    ).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.rehomeToOrganizationActivity)
  })

  it('leaves 110 concepts pending or awaiting design after Phase 19C closeout', () => {
    const unresolved = BUILDING_ARCHETYPE_REFACTOR_INVENTORY.filter(
      ({ status }) =>
        status === BUILDING_ARCHETYPE_REFACTOR_STATUS.pending ||
        status === BUILDING_ARCHETYPE_REFACTOR_STATUS.needsDesign,
    )
    expect(unresolved).toHaveLength(110)
    expect(unresolved.filter(({ wasRuntimeArchetype }) => wasRuntimeArchetype)).toHaveLength(57)
    expect(unresolved.filter(({ wasRuntimeArchetype }) => !wasRuntimeArchetype)).toHaveLength(53)
  })

  it('maps every explicit Tier C disposition allowlist id to the reviewed status', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    for (const id of TIER_C_DECOMPOSE_IDS) {
      expect(statusById.get(id)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    }

    for (const id of TIER_C_OUTSIDE_BUILDING_CLASSIFICATION_IDS) {
      expect(statusById.get(id)).toBe(
        BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
      )
    }

    expect(TIER_C_COMPOSITE_QUEUE_IDS).toHaveLength(24)
    expect(TIER_C_DECOMPOSE_IDS).toHaveLength(13)
    expect(TIER_C_OUTSIDE_BUILDING_CLASSIFICATION_IDS).toHaveLength(14)
    expect(TIER_C_REVIEWED_PENDING_IDS).toEqual(['academy'])

    for (const id of TIER_C_COMPOSITE_QUEUE_IDS) {
      const status = statusById.get(id)
      expect(status).not.toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.pending)
    }

    expect(statusById.get('monastery')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('lamasery')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('wat')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('shinto_shrine')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('gymnasium')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('souk')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('dwarven_forgehold')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('shipyard')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('castle')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('dzong')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('academy')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.pending)
    expect(statusById.get('blockhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.needsDesign)
  })

  it('freezes the Phase 19A morphology allowlist from roadmap seeds against live inventory', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    expect(PHASE_19A_MORPHOLOGY_FORTIFICATION_IDS).toEqual(['blockhouse', 'martello_tower'])
    expect(PHASE_19A_MORPHOLOGY_CULTURAL_EXPRESSION_IDS).toHaveLength(11)
    expect(PHASE_19A_MORPHOLOGY_SITE_CONTEXT_IDS).toEqual([
      'cave_dwelling',
      'elven_tree_dwelling',
      'shipwreck_dwelling',
    ])
    expect(PHASE_19A_MORPHOLOGY_ALLOWLIST_IDS).toHaveLength(16)
    expect(new Set(PHASE_19A_MORPHOLOGY_ALLOWLIST_IDS).size).toBe(16)
    expect(PHASE_19A_DECOMPOSE_IDS).toHaveLength(13)
    expect(PHASE_19A_OUTSIDE_BUILDING_CLASSIFICATION_IDS).toEqual(['crannog', 'siheyuan'])
    expect(PHASE_19A_CULTURAL_OUTSIDE_BUILDING_CLASSIFICATION_IDS).toEqual(['crannog', 'siheyuan'])

    for (const id of PHASE_19A_MORPHOLOGY_ALLOWLIST_IDS) {
      expect(BUILDING_RESEARCH_CORPUS_IDS).toContain(id)
      expect(statusById.get(id)).not.toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.pending)
    }

    expect(statusById.get('blockhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.needsDesign)
  })

  it('maps Phase 19A disposition allowlist ids to reviewed statuses', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    for (const id of PHASE_19A_DECOMPOSE_IDS) {
      expect(statusById.get(id)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    }

    for (const id of PHASE_19A_OUTSIDE_BUILDING_CLASSIFICATION_IDS) {
      expect(statusById.get(id)).toBe(
        BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
      )
    }

    for (const id of PHASE_19A_FORTIFICATION_NEEDS_DESIGN_IDS) {
      expect(statusById.get(id)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.needsDesign)
    }

    expect(PHASE_19A_CULTURAL_DECOMPOSE_IDS).toHaveLength(9)
    expect(PHASE_19A_SITE_CONTEXT_DECOMPOSE_IDS).toHaveLength(3)
  })

  it('maps Phase 19A fortification disposition ids to reviewed statuses', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    expect(PHASE_19A_FORTIFICATION_DECOMPOSE_IDS).toEqual(['martello_tower'])
    expect(PHASE_19A_FORTIFICATION_NEEDS_DESIGN_IDS).toEqual(['blockhouse'])

    for (const id of PHASE_19A_FORTIFICATION_DECOMPOSE_IDS) {
      expect(statusById.get(id)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    }

    for (const id of PHASE_19A_FORTIFICATION_NEEDS_DESIGN_IDS) {
      expect(statusById.get(id)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.needsDesign)
    }
  })

  it('maps Phase 19B approximate-Facility disposition ids to reviewed statuses', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    expect(PHASE_19B_APPROXIMATE_FACILITY_ALLOWLIST_IDS).toHaveLength(11)
    expect(PHASE_19B_DECOMPOSE_IDS).toHaveLength(11)

    for (const id of PHASE_19B_APPROXIMATE_FACILITY_ALLOWLIST_IDS) {
      expect(BUILDING_RESEARCH_CORPUS_IDS).toContain(id)
      expect(statusById.get(id)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    }

    expect(statusById.get('foundry')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('fulling_mill')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('tollhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('bounty_office')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
  })

  it('maps Phase 19C promotion gate candidates to unchanged inventory statuses', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    expect(PHASE_19C_CANDIDATE_IDS).toEqual(['blockhouse', 'workshop', 'museum', 'academy'])
    expect(PHASE_19C_NO_PROMOTION_IDS).toHaveLength(4)
    expect(new Set(PHASE_19C_NO_PROMOTION_IDS).size).toBe(4)

    for (const id of PHASE_19C_CANDIDATE_IDS) {
      expect(BUILDING_RESEARCH_CORPUS_IDS).toContain(id)
    }

    expect(statusById.get('blockhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.needsDesign)
    expect(statusById.get('workshop')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.pending)
    expect(statusById.get('museum')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.pending)
    expect(statusById.get('academy')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.pending)

    for (const formId of BUILDING_FORM_IDS) {
      expect(PHASE_19C_CANDIDATE_IDS).not.toContain(formId)
    }

    for (const facilityId of BUILDING_FACILITY_TYPE_IDS) {
      expect(PHASE_19C_CANDIDATE_IDS).not.toContain(facilityId)
    }
  })

  it('derives granary, greenhouse, and arena enabled-facility from registry membership, not INITIAL_STATUS_BY_ID', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    for (const facilityId of ['granary', 'greenhouse', 'arena'] as const) {
      expect(BUILDING_FACILITY_TYPE_IDS).toContain(facilityId)
      expect(
        BUILDING_ARCHETYPE_REFACTOR_INVENTORY.find(({ id }) => id === facilityId)?.status,
      ).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
      expect(statusById.get(facilityId)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.enabledFacility)
    }
  })

  it('maps every explicit sweep allowlist id to the reviewed Tier A status', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    for (const id of SWEEP_OUTSIDE_BUILDING_CLASSIFICATION_IDS) {
      expect(statusById.get(id)).toBe(
        BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
      )
    }

    for (const id of [
      ...SWEEP_PRIOR_DECOMPOSE_IDS,
      ...SWEEP_TRADE_OPERATOR_DECOMPOSE_IDS,
      ...SWEEP_CANONICAL_SUFFICIENT_DECOMPOSE_IDS,
      ...SWEEP_STATUS_AUTHORITY_DECOMPOSE_IDS,
      ...SWEEP_BUNDLED_FORM_ACTOR_DECOMPOSE_IDS,
      ...SWEEP_OVERLAY_COMPOSITION_DECOMPOSE_IDS,
    ]) {
      expect(statusById.get(id)).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    }
  })

  it('keeps false-positive audit exclusions pending and free of overlapping sweep membership', () => {
    const sweepIds = new Set<string>([
      ...SWEEP_OUTSIDE_BUILDING_CLASSIFICATION_IDS,
      ...SWEEP_PRIOR_DECOMPOSE_IDS,
      ...SWEEP_TRADE_OPERATOR_DECOMPOSE_IDS,
      ...SWEEP_CANONICAL_SUFFICIENT_DECOMPOSE_IDS,
      ...SWEEP_STATUS_AUTHORITY_DECOMPOSE_IDS,
      ...SWEEP_BUNDLED_FORM_ACTOR_DECOMPOSE_IDS,
      ...SWEEP_OVERLAY_COMPOSITION_DECOMPOSE_IDS,
    ])

    expect(sweepIds.size).toBe(106)
    expect(SWEEP_OUTSIDE_BUILDING_CLASSIFICATION_IDS).toHaveLength(39)
    expect(SWEEP_CANONICAL_SUFFICIENT_DECOMPOSE_IDS).toHaveLength(52)
    expect(SWEEP_PRIOR_DECOMPOSE_IDS).toHaveLength(4)

    // 102 Tier A sweep rows = 106 explicit allowlist ids minus 4 tranche-1 prior decompositions.
    expect(sweepIds.size - SWEEP_PRIOR_DECOMPOSE_IDS.length).toBe(102)

    for (const id of SWEEP_FALSE_POSITIVE_PENDING_IDS) {
      expect(sweepIds.has(id)).toBe(false)
      expect(BUILDING_ARCHETYPE_REFACTOR_INVENTORY.find((entry) => entry.id === id)?.status).toBe(
        BUILDING_ARCHETYPE_REFACTOR_STATUS.pending,
      )
    }
  })

  it('keeps the frozen corpus graph and tooling-only outside-building status', () => {
    expect(BUILDING_CORPUS_DISPOSITIONS.potion_shop).toEqual({
      kind: 'specialization',
      of: 'apothecary',
    })
    expect(BUILDING_CORPUS_DISPOSITIONS.apothecary).toEqual({ kind: 'archetype' })

    const contractsSource = readFileSync(
      join(REPO_ROOT, 'packages/contracts/src/rpg/vocab/location/building-facility-type.ts'),
      'utf8',
    )
    expect(contractsSource).not.toContain('outside-building-classification')
    expect(contractsSource).not.toContain('building-archetype-refactor-inventory')
  })

  it('records sweep-1 disposition rows with explicit family membership', () => {
    const statusById = new Map(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.map(({ id, status }) => [id, status]),
    )

    const decomposed = BUILDING_ARCHETYPE_REFACTOR_INVENTORY.filter(
      ({ status }) => status === BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose,
    ).map(({ id }) => id)

    expect(decomposed).toHaveLength(104)
    expect(decomposed).toEqual(
      expect.arrayContaining([
        'abbey',
        'adventurers_guild',
        'apothecary',
        'artificer_atelier',
        'barber_surgeon',
        'bounty_office',
        'broch',
        'cave_dwelling',
        'coach_house',
        'cobbler',
        'customs_house',
        'domus',
        'dower_house',
        'dyeworks',
        'dzong',
        'elven_tree_dwelling',
        'foundry',
        'fulling_mill',
        'gatehouse',
        'general_store',
        'golem_workshop',
        'gymnasium',
        'haunted_manor',
        'hammam',
        'healers_house',
        'icehouse',
        'igloo',
        'kennel',
        'longhouse',
        'machiya',
        'manor',
        'martello_tower',
        'monastery',
        'oracle_shrine',
        'orphanage',
        'palace',
        'ropewalk',
        'roundhouse',
        'royal_mews',
        'shipwreck_dwelling',
        'thermae',
        'tholos',
        'tipi',
        'tollhouse',
        'wizard_tower',
        'yurt',
      ]),
    )
    expect(
      BUILDING_ARCHETYPE_REFACTOR_INVENTORY.filter(
        ({ status }) => status === BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
      ),
    ).toHaveLength(55)
    expect(statusById.get('broch')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('crannog')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('siheyuan')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('foundry')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('pigsty')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.pending)
    expect(statusById.get('longhouse')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.decompose)
    expect(statusById.get('ferry_house')).toBe(BUILDING_ARCHETYPE_REFACTOR_STATUS.pending)
    expect(statusById.get('bridge')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('shipyard')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
    expect(statusById.get('castle')).toBe(
      BUILDING_ARCHETYPE_REFACTOR_STATUS.outsideBuildingClassification,
    )
  })

  it('is not imported by runtime app or package source', () => {
    const runtimeFiles = ['apps', 'packages'].flatMap((directory) =>
      sourceFilesUnder(join(REPO_ROOT, directory)),
    )
    const importingFiles = runtimeFiles.filter((path) =>
      readFileSync(path, 'utf8').includes(INVENTORY_MODULE_NAME),
    )

    expect(importingFiles).toEqual([])
  })
})
