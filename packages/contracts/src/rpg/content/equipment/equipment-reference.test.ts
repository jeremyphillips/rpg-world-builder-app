import { describe, expect, it } from 'vitest'

import type { Equipment } from '../equipment'
import {
  createEquipmentCatalogContext,
  EQUIPMENT_REFERENCE_DISPLAY_MESSAGES,
  type EquipmentCatalogScope,
} from './equipment-catalog-context'
import {
  presentEquipmentReferenceDisplayName,
  resolveEquipmentIdReference,
  resolveEquipmentSlugReference,
  resolveEquipmentSlugReferenceOutcomeForCatalogStatus,
} from './equipment-reference'

const RULESET = 'srd-cc-5.2.1'
const CAMPAIGN = 'campaign-1'

const scope: EquipmentCatalogScope = { rulesetId: RULESET, campaignId: CAMPAIGN }

const dagger = {
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  name: 'Dagger',
  rulesetId: RULESET,
  catalogLayer: 'system',
  campaignId: null,
  status: 'published',
} as Equipment

const draftDagger = {
  ...dagger,
  id: `${RULESET}:draft-dagger`,
  slug: 'draft-dagger',
  name: 'Draft Dagger',
  status: 'draft',
} as Equipment

const homebrewShield = {
  id: '665f0c2a9b1e4c0011223344',
  slug: 'custom-shield',
  name: 'Custom Shield',
  rulesetId: RULESET,
  catalogLayer: 'homebrew',
  campaignId: CAMPAIGN,
  status: 'published',
} as Equipment

const equipmentById = new Map([dagger, draftDagger, homebrewShield].map((row) => [row.id, row]))

describe('resolveEquipmentSlugReference', () => {
  it('resolves bare slug against slug index when catalog is ready', () => {
    const catalog = createEquipmentCatalogContext({ status: 'ready', scope, equipmentById })
    expect(resolveEquipmentSlugReference('dagger', catalog, scope)).toEqual({
      status: 'resolved',
      reference: 'dagger',
      equipment: dagger,
    })
  })

  it('does not resolve system id as a slug reference', () => {
    const catalog = createEquipmentCatalogContext({ status: 'ready', scope, equipmentById })
    const outcome = resolveEquipmentSlugReference(dagger.id, catalog, scope)
    expect(outcome.status).toBe('unresolved')
    if (outcome.status === 'unresolved') {
      expect(outcome.reason).toBe('unknown-equipment')
    }
  })

  it('resolves draft equipment by slug when present in authoritative catalog', () => {
    const catalog = createEquipmentCatalogContext({ status: 'ready', scope, equipmentById })
    const outcome = resolveEquipmentSlugReference('draft-dagger', catalog, scope)
    expect(outcome.status).toBe('resolved')
    if (outcome.status === 'resolved') {
      expect(outcome.equipment.name).toBe('Draft Dagger')
    }
  })

  it('scenario C: loading catalog yields catalog-loading, not unknown-equipment', () => {
    const loading = createEquipmentCatalogContext({ status: 'pending', scope, equipmentById })
    const outcome = resolveEquipmentSlugReference('dagger', loading, scope)
    expect(outcome).toEqual({
      status: 'unresolved',
      reference: 'dagger',
      reason: 'catalog-loading',
    })
    expect(presentEquipmentReferenceDisplayName(outcome)).toBe(
      EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.catalogLoading,
    )
  })

  it('scenario E: ready catalog with absent slug yields unknown-equipment', () => {
    const ready = createEquipmentCatalogContext({ status: 'ready', scope, equipmentById })
    const outcome = resolveEquipmentSlugReference('missing-slug', ready, scope)
    expect(outcome).toEqual({
      status: 'unresolved',
      reference: 'missing-slug',
      reason: 'unknown-equipment',
    })
    expect(presentEquipmentReferenceDisplayName(outcome)).toBe(
      EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.unknownEquipment,
    )
  })

  it('reports ambiguous slug when duplicate slugs share the index', () => {
    const collisionA = { ...dagger, id: `${RULESET}:dagger-a`, slug: 'clash' } as Equipment
    const collisionB = { ...dagger, id: `${RULESET}:dagger-b`, slug: 'clash' } as Equipment
    const catalog = createEquipmentCatalogContext({
      status: 'ready',
      scope,
      equipmentById: new Map([
        [collisionA.id, collisionA],
        [collisionB.id, collisionB],
      ]),
    })
    const outcome = resolveEquipmentSlugReference('clash', catalog, scope)
    expect(outcome.status).toBe('unresolved')
    if (outcome.status === 'unresolved') {
      expect(outcome.reason).toBe('ambiguous-equipment')
      expect(presentEquipmentReferenceDisplayName(outcome)).toBe(
        EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.unknownEquipment,
      )
    }
  })

  it('scenario H: scope mismatch does not classify as unknown-equipment', () => {
    const catalog = createEquipmentCatalogContext({ status: 'ready', scope, equipmentById })
    const mismatchScope: EquipmentCatalogScope = { rulesetId: 'other', campaignId: CAMPAIGN }
    const outcome = resolveEquipmentSlugReference('dagger', catalog, mismatchScope)
    expect(outcome.status === 'unresolved' && outcome.reason).toBe('catalog-scope-mismatch')
  })
})

describe('resolveEquipmentIdReference', () => {
  it('resolves catalog content id only — not bare slug', () => {
    const catalog = createEquipmentCatalogContext({ status: 'ready', scope, equipmentById })
    expect(resolveEquipmentIdReference(homebrewShield.id, catalog, scope)).toEqual({
      status: 'resolved',
      reference: homebrewShield.id,
      equipment: homebrewShield,
    })
    expect(resolveEquipmentIdReference('dagger', catalog, scope).status).toBe('unresolved')
  })

  it('scenario F: binary catalog status maps unavailable without unknown-equipment', () => {
    const unavailable = resolveEquipmentSlugReferenceOutcomeForCatalogStatus('dagger', {
      catalogStatus: 'unavailable',
      scope,
      equipmentById,
    })
    expect(unavailable).toEqual({
      status: 'unresolved',
      reference: 'dagger',
      reason: 'catalog-unavailable',
    })
  })
})
