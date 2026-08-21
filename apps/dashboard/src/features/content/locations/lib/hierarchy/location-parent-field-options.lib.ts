import { unionPersistedOptions, type Location } from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { formatContentReferenceLabel } from '@/features/character'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { CONTENT_REFERENCE_UNRESOLVED_SUFFIX } from '../../../organizations/lib/members/organization-member-class-chip-options.lib'
import { buildParentLocationOptions } from './location-parent-picker'

function buildAuthorizedParentLocationDisplay(input: {
  persistedParentLocationId: string
  selectableLocations: readonly Location[]
  visibleCatalog: readonly Location[]
}): Map<string, { label: string }> {
  const selectableIds = new Set(input.selectableLocations.map((location) => location.id))
  if (selectableIds.has(input.persistedParentLocationId)) {
    return new Map()
  }

  const visibleLocation = input.visibleCatalog.find(
    (location) => location.id === input.persistedParentLocationId,
  )
  if (!visibleLocation) {
    return new Map()
  }

  return new Map([[input.persistedParentLocationId, { label: visibleLocation.name }]])
}

/** Parent location combobox options — referenceable rows plus persisted orphan union. */
export function buildParentLocationFieldOptions(
  ctx: ContentFormCtx,
  persistedParentLocationId?: string,
): FieldOption[] {
  const visibleCatalog = ctx.options?.locations?.visible ?? []
  const referenceableLocations = ctx.options?.locations?.forReference() ?? []
  const selectable = buildParentLocationOptions(referenceableLocations)

  if (!persistedParentLocationId) {
    return selectable
  }

  return unionPersistedOptions({
    selectable,
    persistedIds: [persistedParentLocationId],
    authorizedDisplay: buildAuthorizedParentLocationDisplay({
      persistedParentLocationId,
      selectableLocations: referenceableLocations,
      visibleCatalog,
    }),
    formatUnresolvedLabel: (locationId) =>
      `${formatContentReferenceLabel(locationId)} ${CONTENT_REFERENCE_UNRESOLVED_SUFFIX}`,
  })
}
