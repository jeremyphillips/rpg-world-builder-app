import {
  getAllowedParentKinds,
  getLocationKindLabel,
  type Location,
  type LocationKind,
} from '@rpg/contracts'
import type { ComboboxFilterDimensionConfig, FieldOption } from '@rpg/ui/form'

import {
  canonicalFieldsForAuthoringType,
  resolveAuthoringTypeFromFormValues,
} from '../location-authoring-type'
import { buildParentLocationFieldOptions } from './location-parent-field-options.lib'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'

function resolveChildKindFromFormValues(values: Record<string, unknown>): LocationKind | undefined {
  const authoringType = resolveAuthoringTypeFromFormValues(values)
  if (!authoringType) return undefined
  return canonicalFieldsForAuthoringType(authoringType).kind
}

function filterValidParentLocations(
  locations: readonly Location[] | undefined,
  childKind: LocationKind,
  entityId?: string,
): Location[] {
  const allowedParentKinds = new Set(getAllowedParentKinds(childKind))
  return [...(locations ?? [])].filter(
    (location) => allowedParentKinds.has(location.kind) && (!entityId || location.id !== entityId),
  )
}

export function buildValidParentLocationFieldOptions(
  locations: readonly Location[] | undefined,
  childKind: LocationKind,
  entityId?: string,
): FieldOption[] {
  return filterValidParentLocations(locations, childKind, entityId)
    .map((location) => ({
      value: location.id,
      label: location.name,
      filterValues: { kind: location.kind },
      classification: getLocationKindLabel(location.kind),
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

export function buildParentLocationKindFilterSelects(
  childKind: LocationKind,
): readonly ComboboxFilterDimensionConfig[] {
  const kindOptions: FieldOption[] = getAllowedParentKinds(childKind).map((kind) => ({
    value: kind,
    label: getLocationKindLabel(kind),
  }))

  return [
    {
      filterKey: 'kind',
      ariaLabel: 'Filter parent locations by kind',
      options: kindOptions,
      allOptionLabel: 'All kinds',
    },
  ]
}

function enrichParentLocationOption(
  option: FieldOption,
  locationsById: ReadonlyMap<string, Location>,
): FieldOption {
  const location = locationsById.get(option.value)
  if (!location) return option
  return {
    ...option,
    filterValues: { kind: location.kind },
    classification: getLocationKindLabel(location.kind),
  }
}

export function buildParentLocationComboboxOptionsResolve(
  ctx: ContentFormCtx,
  persistedParentLocationId?: string,
) {
  const referenceableLocations = ctx.options?.locations?.forReference()
  const locationsById = new Map(
    (referenceableLocations ?? []).map((location) => [location.id, location]),
  )

  return {
    dependsOn: ['authoringType'] as const,
    optionsWhen: (values: Record<string, unknown>): FieldOption[] => {
      const childKind = resolveChildKindFromFormValues(values)
      if (!childKind) return []

      const validIds = new Set(
        buildValidParentLocationFieldOptions(referenceableLocations, childKind, ctx.entityId).map(
          (option) => option.value,
        ),
      )

      const merged = buildParentLocationFieldOptions(ctx, persistedParentLocationId).filter(
        (option) => validIds.has(option.value) || option.value === persistedParentLocationId,
      )

      return merged.map((option) => enrichParentLocationOption(option, locationsById))
    },
  }
}

export function buildParentLocationFilterSelectsResolve() {
  return {
    dependsOn: ['authoringType'] as const,
    filterSelectsWhen: (
      values: Record<string, unknown>,
    ): readonly ComboboxFilterDimensionConfig[] => {
      const childKind = resolveChildKindFromFormValues(values)
      if (!childKind) {
        return [
          {
            filterKey: 'kind',
            ariaLabel: 'Filter parent locations by kind',
            options: [],
            allOptionLabel: 'All kinds',
          },
        ]
      }
      return buildParentLocationKindFilterSelects(childKind)
    },
  }
}
