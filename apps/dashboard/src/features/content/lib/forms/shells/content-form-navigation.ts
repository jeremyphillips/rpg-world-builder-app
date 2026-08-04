import type { EquipmentKind } from '@rpg/contracts'

import { type CONTENT_ROUTES } from '@/app/content-routes'
import { contentEditHref } from '../../detail/content-edit-href'
import {
  equipmentKindToFamilyPath,
  type EquipmentFamilyPath,
} from '../../../equipment/lib/shared/equipment-family-paths'
import type { AnyContentFormDef, ContentFormCtx } from '../content-form-registry'

type ContentRouteSection = keyof typeof CONTENT_ROUTES

const ROUTE_KEY_TO_CONTENT_ROUTE_SECTION: Record<string, ContentRouteSection> = {
  spells: 'spells',
  species: 'species',
  classes: 'classes',
  feats: 'feats',
  equipment: 'equipment',
  'skill-proficiencies': 'skillProficiencies',
  organizations: 'organizations',
  locations: 'locations',
}

/** Maps API `routeKey` values to `CONTENT_ROUTES` section keys. */
export function routeKeyToContentRouteSection(routeKey: string): ContentRouteSection | undefined {
  return ROUTE_KEY_TO_CONTENT_ROUTE_SECTION[routeKey]
}

function resolveEquipmentFamily(
  savedEntity: { kind?: unknown },
  formCtx: Partial<ContentFormCtx> | undefined,
): EquipmentFamilyPath | undefined {
  if (formCtx?.equipmentFamily) {
    return formCtx.equipmentFamily as EquipmentFamilyPath
  }

  const kind = savedEntity.kind
  if (typeof kind === 'string') {
    return equipmentKindToFamilyPath(kind as EquipmentKind)
  }

  return undefined
}

/** Resolves the edit URL after a successful create POST. */
export function resolveContentPostCreateEditHref(
  def: Pick<AnyContentFormDef, 'routeKey'>,
  campaignId: string,
  savedEntity: { id: string; kind?: unknown },
  formCtx?: Partial<ContentFormCtx>,
): string {
  const section = routeKeyToContentRouteSection(def.routeKey)
  if (!section) {
    throw new Error(`No content route section registered for route key "${def.routeKey}".`)
  }

  const family = section === 'equipment' ? resolveEquipmentFamily(savedEntity, formCtx) : undefined
  const editHref = contentEditHref(section, campaignId, savedEntity.id, family)

  if (!editHref) {
    throw new Error(`Could not resolve edit href for route key "${def.routeKey}".`)
  }

  return editHref
}
