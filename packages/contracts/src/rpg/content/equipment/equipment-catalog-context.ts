import {
  catalogLifecycleDisplayMessage,
  catalogLifecycleUnresolvedReason,
  isCatalogAuthoritativeForReferenceLookup,
  mapAuthoringCatalogLoadState,
  type AuthoringCatalogStatus,
  type CatalogLoadState,
} from '../lib/catalog-lifecycle'

import type { Equipment } from '../equipment'

export type EquipmentCatalogLoadState = CatalogLoadState

/** Dashboard `ContentFormCtx.equipmentCatalogStatus` and equivalent authoring query states. */
export type AuthoringEquipmentCatalogStatus = AuthoringCatalogStatus

export type EquipmentCatalogScope = {
  readonly rulesetId: string
  readonly campaignId: string
}

/**
 * Authoritative campaign equipment catalog for reference **presentation**.
 * Slug lookups use `equipmentBySlug`, which omits ambiguous slugs.
 */
export type EquipmentCatalogContext = {
  loadState: EquipmentCatalogLoadState
  scope: EquipmentCatalogScope
  equipmentById: ReadonlyMap<string, Equipment>
  equipmentBySlug: ReadonlyMap<string, Equipment>
  ambiguousSlugs: ReadonlySet<string>
}

export type EquipmentReferenceUnresolvedReason =
  | 'catalog-loading'
  | 'catalog-error'
  | 'catalog-unavailable'
  | 'catalog-scope-mismatch'
  | 'unknown-equipment'
  /** Duplicate slug in an authoritative ready catalog — display uses the same copy as unknown. */
  | 'ambiguous-equipment'

export const EQUIPMENT_REFERENCE_DISPLAY_MESSAGES = {
  unknownEquipment: 'Equipment reference unavailable',
  catalogLoading: catalogLifecycleDisplayMessage('equipment', 'catalog-loading'),
  catalogError: catalogLifecycleDisplayMessage('equipment', 'catalog-error'),
} as const

export const mapAuthoringEquipmentCatalogLoadState = mapAuthoringCatalogLoadState

export function indexEquipmentCatalogBySlug(equipmentById: ReadonlyMap<string, Equipment>): {
  equipmentBySlug: ReadonlyMap<string, Equipment>
  ambiguousSlugs: ReadonlySet<string>
} {
  const equipmentBySlug = new Map<string, Equipment>()
  const ambiguousSlugs = new Set<string>()

  for (const equipment of equipmentById.values()) {
    const { slug } = equipment
    if (ambiguousSlugs.has(slug)) continue

    const existing = equipmentBySlug.get(slug)
    if (existing !== undefined && existing.id !== equipment.id) {
      ambiguousSlugs.add(slug)
      equipmentBySlug.delete(slug)
      continue
    }

    if (existing === undefined) {
      equipmentBySlug.set(slug, equipment)
    }
  }

  return { equipmentBySlug, ambiguousSlugs }
}

export function createEquipmentCatalogContext(args: {
  status: AuthoringEquipmentCatalogStatus
  scope: EquipmentCatalogScope
  equipmentById?: ReadonlyMap<string, Equipment>
}): EquipmentCatalogContext {
  const equipmentById = args.equipmentById ?? new Map()
  const { equipmentBySlug, ambiguousSlugs } = indexEquipmentCatalogBySlug(equipmentById)

  return {
    loadState: mapAuthoringEquipmentCatalogLoadState(args.status),
    scope: args.scope,
    equipmentById,
    equipmentBySlug,
    ambiguousSlugs,
  }
}

export const isEquipmentCatalogAuthoritativeForReferenceLookup =
  isCatalogAuthoritativeForReferenceLookup

export function equipmentCatalogLifecycleUnresolvedReason(
  loadState: EquipmentCatalogLoadState,
):
  | Exclude<
      EquipmentReferenceUnresolvedReason,
      'unknown-equipment' | 'ambiguous-equipment' | 'catalog-unavailable' | 'catalog-scope-mismatch'
    >
  | undefined {
  return catalogLifecycleUnresolvedReason(loadState)
}

export function equipmentReferenceDisplayMessageForUnresolvedReason(
  reason: EquipmentReferenceUnresolvedReason,
): string {
  switch (reason) {
    case 'unknown-equipment':
    case 'ambiguous-equipment':
      return EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.unknownEquipment
    case 'catalog-loading':
      return EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.catalogLoading
    case 'catalog-error':
    case 'catalog-unavailable':
    case 'catalog-scope-mismatch':
      return EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.catalogError
  }
}

function catalogScopesMatch(
  expected: EquipmentCatalogScope,
  catalog: EquipmentCatalogContext,
): boolean {
  return (
    expected.rulesetId === catalog.scope.rulesetId &&
    expected.campaignId === catalog.scope.campaignId
  )
}

export function equipmentCatalogScopeMatches(
  expected: EquipmentCatalogScope,
  catalog: EquipmentCatalogContext,
): boolean {
  return catalogScopesMatch(expected, catalog)
}
