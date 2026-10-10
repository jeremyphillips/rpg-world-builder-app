import { getOrganizationDomainLabel, ORGANIZATION_DOMAIN_IDS } from '@rpg/contracts'

import {
  createEqualsFilter,
  createFilterSchema,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import { collectPresentValues, presentFilterValuesInOrder } from './relationship-filter-options.lib'
import {
  RELATIONSHIP_FILTER_ALL_DOMAINS_LABEL,
  RELATIONSHIP_FILTER_DOMAIN_LABEL,
} from './relationship-filter.constants'

export type OrganizationRelationshipFilterState = {
  domain?: string
}

const ORGANIZATION_RELATIONSHIP_FILTER_FIELD_ORDER = {
  filterRowFieldIds: ['domain'],
} as const satisfies FilterCatalogLayoutConfig<OrganizationRelationshipFilterState>

export function resolveOrganizationRelationshipFilterLayout<TData>(
  schema: FilterSchema<TData, OrganizationRelationshipFilterState>,
): FilterCatalogLayoutConfig<OrganizationRelationshipFilterState> {
  const schemaFieldIds = new Set(schema.fields.map((field) => field.id))

  return {
    filterRowFieldIds: ORGANIZATION_RELATIONSHIP_FILTER_FIELD_ORDER.filterRowFieldIds.filter(
      (fieldId) => schemaFieldIds.has(fieldId),
    ),
  }
}

export type CreateOrganizationRelationshipFilterSchemaArgs<TData> = {
  rows: readonly TData[]
  getDomain: (row: TData) => string
}

export function createOrganizationRelationshipFilterSchema<TData>(
  args: CreateOrganizationRelationshipFilterSchemaArgs<TData>,
): FilterSchema<TData, OrganizationRelationshipFilterState> {
  const presentDomains = collectPresentValues(args.rows, args.getDomain)
  const domainOptions = presentFilterValuesInOrder(ORGANIZATION_DOMAIN_IDS, presentDomains)
  const fields = []

  if (domainOptions.length > 1) {
    fields.push(
      createEqualsFilter<TData, OrganizationRelationshipFilterState, 'domain', string>({
        id: 'domain',
        label: RELATIONSHIP_FILTER_DOMAIN_LABEL,
        width: 'lg',
        showAllOption: true,
        allOptionLabel: RELATIONSHIP_FILTER_ALL_DOMAINS_LABEL,
        options: domainOptions.map((domain) => ({
          value: domain,
          label: getOrganizationDomainLabel(domain),
        })),
        getValue: (row) => args.getDomain(row),
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => {
      if (state.domain && !presentDomains.has(state.domain)) {
        return { domain: undefined }
      }
      return {}
    },
  })
}
