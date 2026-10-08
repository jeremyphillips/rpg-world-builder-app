import { getLocationKindLabel, LOCATION_KIND_IDS } from '@rpg/contracts'

import {
  createEqualsFilter,
  createFilterSchema,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import { collectPresentValues, presentFilterValuesInOrder } from './relationship-filter-options.lib'
import {
  RELATIONSHIP_FILTER_ALL_LABEL,
  RELATIONSHIP_FILTER_TYPE_LABEL,
} from './relationship-filter.constants'

export type LocationRelationshipFilterState = {
  kind?: string
}

const LOCATION_RELATIONSHIP_FILTER_FIELD_ORDER = {
  filterRowFieldIds: ['kind'],
} as const satisfies FilterCatalogLayoutConfig<LocationRelationshipFilterState>

export function resolveLocationRelationshipFilterLayout<TData>(
  schema: FilterSchema<TData, LocationRelationshipFilterState>,
): FilterCatalogLayoutConfig<LocationRelationshipFilterState> {
  const schemaFieldIds = new Set(schema.fields.map((field) => field.id))

  return {
    filterRowFieldIds: LOCATION_RELATIONSHIP_FILTER_FIELD_ORDER.filterRowFieldIds.filter(
      (fieldId) => schemaFieldIds.has(fieldId),
    ),
  }
}

export type CreateLocationRelationshipFilterSchemaArgs<TData> = {
  rows: readonly TData[]
  getKind: (row: TData) => string
}

export function createLocationRelationshipFilterSchema<TData>(
  args: CreateLocationRelationshipFilterSchemaArgs<TData>,
): FilterSchema<TData, LocationRelationshipFilterState> {
  const presentKinds = collectPresentValues(args.rows, args.getKind)
  const kindOptions = presentFilterValuesInOrder(LOCATION_KIND_IDS, presentKinds)
  const fields = []

  if (kindOptions.length > 1) {
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
        options: kindOptions.map((kind) => ({
          value: kind,
          label: getLocationKindLabel(kind),
        })),
        getValue: (row) => args.getKind(row),
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => {
      if (state.kind && !presentKinds.has(state.kind)) {
        return { kind: undefined }
      }
      return {}
    },
  })
}
