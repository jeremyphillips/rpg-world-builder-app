import {
  getParentRequirement,
  isValidParentKind,
  type Location,
  type LocationKind,
} from '@rpg/contracts'
import type { FieldOption, FieldOptionAvailability } from '@rpg/ui/form'

import {
  canonicalFieldsForAuthoringType,
  resolveAuthoringTypeFromFormValues,
} from '../location-authoring-type'

function resolveChildKind(watched: Record<string, unknown>): LocationKind | undefined {
  const authoringType = resolveAuthoringTypeFromFormValues(watched)
  if (!authoringType) return undefined
  return canonicalFieldsForAuthoringType(authoringType).kind
}

export function buildParentLocationOptions(
  locations: readonly Location[] | undefined,
): FieldOption[] {
  return [...(locations ?? [])]
    .map((location) => ({ value: location.id, label: location.name }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

export function parentLocationFieldVisibility() {
  return {
    dependsOn: ['authoringType'],
    visibleWhen: (watched: Record<string, unknown>) => {
      const kind = resolveChildKind(watched)
      return kind != null && getParentRequirement(kind) !== 'forbidden'
    },
  }
}

export function buildParentLocationOptionAvailability(
  locations: readonly Location[] | undefined,
  entityId?: string,
): FieldOptionAvailability {
  const locationsById = new Map((locations ?? []).map((location) => [location.id, location]))

  return {
    dependsOn: ['authoringType'],
    enabledWhen: (watched, optionValue) => {
      const childKind = resolveChildKind(watched)
      if (!childKind || typeof optionValue !== 'string') {
        return false
      }
      if (entityId && optionValue === entityId) {
        return false
      }

      const parent = locationsById.get(optionValue)
      if (!parent) {
        return false
      }

      return isValidParentKind(childKind, parent.kind)
    },
  }
}

export function parentLocationPlaceholder(kind: LocationKind | undefined): string {
  if (!kind) return 'Select a parent location'
  const requirement = getParentRequirement(kind)
  if (requirement === 'optional') return 'Select a parent location (optional)'
  return 'Select a parent location'
}
