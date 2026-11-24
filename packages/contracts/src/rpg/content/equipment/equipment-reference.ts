import { z } from 'zod'

import type { Equipment } from '../equipment'
import {
  createEquipmentCatalogContext,
  equipmentCatalogLifecycleUnresolvedReason,
  equipmentCatalogScopeMatches,
  equipmentReferenceDisplayMessageForUnresolvedReason,
  type EquipmentCatalogContext,
  type EquipmentCatalogScope,
  type EquipmentReferenceUnresolvedReason,
} from './equipment-catalog-context'

/** Bare equipment slug on authored grants and starting-equipment packages. */
export const equipmentSlugReferenceSchema = z.string().min(1)

export type EquipmentSlugReference = z.infer<typeof equipmentSlugReferenceSchema>

/** Canonical catalog equipment content id on inventory rows. */
export type EquipmentContentIdReference = string

export type EquipmentReferenceResolution =
  | { status: 'resolved'; reference: string; equipment: Equipment }
  | {
      status: 'unresolved'
      reference: string
      reason: EquipmentReferenceUnresolvedReason
    }

function unresolved(
  reference: string,
  reason: EquipmentReferenceUnresolvedReason,
): Extract<EquipmentReferenceResolution, { status: 'unresolved' }> {
  return { status: 'unresolved', reference, reason }
}

export function resolveEquipmentSlugReference(
  slug: EquipmentSlugReference,
  catalog: EquipmentCatalogContext,
  expectedScope: EquipmentCatalogScope,
): EquipmentReferenceResolution {
  const lifecycleReason = equipmentCatalogLifecycleUnresolvedReason(catalog.loadState)
  if (lifecycleReason) {
    return unresolved(slug, lifecycleReason)
  }

  if (!equipmentCatalogScopeMatches(expectedScope, catalog)) {
    return unresolved(slug, 'catalog-scope-mismatch')
  }

  if (catalog.ambiguousSlugs.has(slug)) {
    return unresolved(slug, 'ambiguous-equipment')
  }

  const equipment = catalog.equipmentBySlug.get(slug)
  if (equipment) {
    return { status: 'resolved', reference: slug, equipment }
  }

  return unresolved(slug, 'unknown-equipment')
}

export function resolveEquipmentIdReference(
  equipmentId: EquipmentContentIdReference,
  catalog: EquipmentCatalogContext,
  expectedScope: EquipmentCatalogScope,
): EquipmentReferenceResolution {
  const lifecycleReason = equipmentCatalogLifecycleUnresolvedReason(catalog.loadState)
  if (lifecycleReason) {
    return unresolved(equipmentId, lifecycleReason)
  }

  if (!equipmentCatalogScopeMatches(expectedScope, catalog)) {
    return unresolved(equipmentId, 'catalog-scope-mismatch')
  }

  const equipment = catalog.equipmentById.get(equipmentId)
  if (equipment) {
    return { status: 'resolved', reference: equipmentId, equipment }
  }

  return unresolved(equipmentId, 'unknown-equipment')
}

export function resolveEquipmentSlugReferenceOutcomes(
  slugs: readonly EquipmentSlugReference[],
  catalog: EquipmentCatalogContext,
  expectedScope: EquipmentCatalogScope,
): EquipmentReferenceResolution[] {
  return slugs.map((slug) => resolveEquipmentSlugReference(slug, catalog, expectedScope))
}

export function resolveEquipmentIdReferenceOutcomes(
  equipmentIds: readonly EquipmentContentIdReference[],
  catalog: EquipmentCatalogContext,
  expectedScope: EquipmentCatalogScope,
): EquipmentReferenceResolution[] {
  return equipmentIds.map((id) => resolveEquipmentIdReference(id, catalog, expectedScope))
}

export function resolveEquipmentSlugReferenceOutcomeForCatalogStatus(
  slug: EquipmentSlugReference,
  args: {
    catalogStatus: 'ready' | 'unavailable'
    scope: EquipmentCatalogScope
    equipmentById?: ReadonlyMap<string, Equipment>
  },
): EquipmentReferenceResolution {
  if (args.catalogStatus === 'unavailable') {
    return unresolved(slug, 'catalog-unavailable')
  }

  const catalog = createEquipmentCatalogContext({
    status: 'ready',
    scope: args.scope,
    equipmentById: args.equipmentById,
  })
  return resolveEquipmentSlugReference(slug, catalog, args.scope)
}

export function resolveEquipmentIdReferenceOutcomeForCatalogStatus(
  equipmentId: EquipmentContentIdReference,
  args: {
    catalogStatus: 'ready' | 'unavailable'
    scope: EquipmentCatalogScope
    equipmentById?: ReadonlyMap<string, Equipment>
  },
): EquipmentReferenceResolution {
  if (args.catalogStatus === 'unavailable') {
    return unresolved(equipmentId, 'catalog-unavailable')
  }

  const catalog = createEquipmentCatalogContext({
    status: 'ready',
    scope: args.scope,
    equipmentById: args.equipmentById,
  })
  return resolveEquipmentIdReference(equipmentId, catalog, args.scope)
}

export function presentEquipmentReferenceDisplayName(
  resolution: EquipmentReferenceResolution,
): string {
  if (resolution.status === 'resolved') {
    return resolution.equipment.name
  }
  return equipmentReferenceDisplayMessageForUnresolvedReason(resolution.reason)
}
