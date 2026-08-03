import {
  getParentRequirement,
  isValidParentKind,
  LOCATION_KIND_IDS,
  type Location,
  type LocationKind,
} from '@rpg/contracts'
import type { FieldOption, FieldOptionAvailability } from '@rpg/ui/form'

function parseLocationKind(value: unknown): LocationKind | undefined {
  return typeof value === 'string' && (LOCATION_KIND_IDS as readonly string[]).includes(value)
    ? (value as LocationKind)
    : undefined
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
    dependsOn: ['kind'],
    visibleWhen: (watched: Record<string, unknown>) => {
      const kind = parseLocationKind(watched['kind'])
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
    dependsOn: ['kind'],
    enabledWhen: (watched, optionValue) => {
      const childKind = parseLocationKind(watched['kind'])
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
