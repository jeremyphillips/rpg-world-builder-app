import { getLocationKindLabel, LOCATION_KIND_IDS, type LocationKind } from '@rpg/contracts'

import {
  createChipsFilter,
  createEqualsFilter,
  createFilterSchema,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import { LOCATION_KIND_BROWSE_FAMILIES } from '../../../../../locations/lib/location-kind-browse-families'
import { collectPresentValues, presentFilterValuesInOrder } from './relationship-filter-options.lib'
import {
  RELATIONSHIP_FILTER_ALL,
  RELATIONSHIP_FILTER_ALL_LABEL,
  RELATIONSHIP_FILTER_KIND_FAMILY_LABEL,
  RELATIONSHIP_FILTER_TYPE_LABEL,
} from './relationship-filter.constants'

export type LocationRelationshipKindFamily = {
  id: string
  label: string
  matchesKind: (kind: string) => boolean
}

export type LocationRelationshipFilterState = {
  kindFamily?: string
  kind?: string
}

const LOCATION_RELATIONSHIP_FILTER_FIELD_ORDER = {
  primaryFieldIds: ['kindFamily'],
  filterRowFieldIds: ['kind'],
} as const satisfies FilterCatalogLayoutConfig<LocationRelationshipFilterState>

export function resolveLocationRelationshipFilterLayout<TData>(
  schema: FilterSchema<TData, LocationRelationshipFilterState>,
): FilterCatalogLayoutConfig<LocationRelationshipFilterState> {
  const schemaFieldIds = new Set(schema.fields.map((field) => field.id))

  return {
    primaryFieldIds: LOCATION_RELATIONSHIP_FILTER_FIELD_ORDER.primaryFieldIds.filter((fieldId) =>
      schemaFieldIds.has(fieldId),
    ),
    filterRowFieldIds: LOCATION_RELATIONSHIP_FILTER_FIELD_ORDER.filterRowFieldIds.filter(
      (fieldId) => schemaFieldIds.has(fieldId),
    ),
  }
}

export type CreateLocationRelationshipFilterSchemaArgs<TData> = {
  rows: readonly TData[]
  getKind: (row: TData) => string
  /** Replaces the default browse families. Families with no matching rows are omitted. */
  kindFamilies?: readonly LocationRelationshipKindFamily[]
}

function defaultKindFamilies(): LocationRelationshipKindFamily[] {
  return LOCATION_KIND_BROWSE_FAMILIES.map((family) => ({
    id: family.id,
    label: family.label,
    matchesKind: (kind: string) => (family.kinds as readonly string[]).includes(kind),
  }))
}

function familiesPresentOnRows<TData>(
  families: readonly LocationRelationshipKindFamily[],
  rows: readonly TData[],
  getKind: (row: TData) => string,
): LocationRelationshipKindFamily[] {
  return families.filter((family) => rows.some((row) => family.matchesKind(getKind(row))))
}

function kindsForState(
  families: readonly LocationRelationshipKindFamily[],
  presentKinds: ReadonlySet<string>,
  state: LocationRelationshipFilterState,
): string[] {
  const selected =
    state.kindFamily && state.kindFamily !== RELATIONSHIP_FILTER_ALL
      ? families.find((family) => family.id === state.kindFamily)
      : undefined
  const allowed = selected
    ? [...presentKinds].filter((kind) => selected.matchesKind(kind))
    : [...presentKinds]

  return presentFilterValuesInOrder(LOCATION_KIND_IDS, new Set(allowed))
}

export function createLocationRelationshipFilterSchema<TData>(
  args: CreateLocationRelationshipFilterSchemaArgs<TData>,
): FilterSchema<TData, LocationRelationshipFilterState> {
  const families = familiesPresentOnRows(
    args.kindFamilies ?? defaultKindFamilies(),
    args.rows,
    args.getKind,
  )
  const presentKinds = collectPresentValues(args.rows, args.getKind)
  const fields = []

  if (families.length > 1) {
    fields.push(
      createChipsFilter<TData, LocationRelationshipFilterState, 'kindFamily'>({
        id: 'kindFamily',
        label: RELATIONSHIP_FILTER_KIND_FAMILY_LABEL,
        selectionMode: 'single-required',
        allValue: RELATIONSHIP_FILTER_ALL,
        defaultValue: RELATIONSHIP_FILTER_ALL,
        isValueConstraining: (value) =>
          typeof value === 'string' && value !== RELATIONSHIP_FILTER_ALL,
        options: [
          { value: RELATIONSHIP_FILTER_ALL, label: RELATIONSHIP_FILTER_ALL_LABEL },
          ...families.map((family) => ({ value: family.id, label: family.label })),
        ],
        matches: (row, value) => {
          if (typeof value !== 'string' || value === RELATIONSHIP_FILTER_ALL) return true
          return (
            families.find((family) => family.id === value)?.matchesKind(args.getKind(row)) ?? false
          )
        },
      }),
    )
  }

  if (presentKinds.size > 1) {
    fields.push(
      createEqualsFilter<TData, LocationRelationshipFilterState, 'kind', string>({
        id: 'kind',
        label: RELATIONSHIP_FILTER_TYPE_LABEL,
        layout: 'inline',
        width: 'lg',
        showAllOption: true,
        allOptionLabel: RELATIONSHIP_FILTER_ALL_LABEL,
        ariaLabel: RELATIONSHIP_FILTER_TYPE_LABEL,
        triggerAriaLabel: RELATIONSHIP_FILTER_TYPE_LABEL,
        options: (context) =>
          kindsForState(families, presentKinds, context.state).map((kind) => ({
            value: kind,
            label: getLocationKindLabel(kind as LocationKind),
          })),
        visible: (state) => kindsForState(families, presentKinds, state).length > 1,
        getValue: (row) => args.getKind(row),
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => {
      const patch: Partial<LocationRelationshipFilterState> = {}
      if (
        state.kindFamily &&
        state.kindFamily !== RELATIONSHIP_FILTER_ALL &&
        !families.some((family) => family.id === state.kindFamily)
      ) {
        patch.kindFamily = undefined
      }

      const allowedKinds = new Set(kindsForState(families, presentKinds, { ...state, ...patch }))
      if (state.kind && !allowedKinds.has(state.kind)) {
        patch.kind = undefined
      }

      return patch
    },
  })
}
