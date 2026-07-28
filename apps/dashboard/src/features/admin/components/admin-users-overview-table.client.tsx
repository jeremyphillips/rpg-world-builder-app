'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button, DataTableFilterRegion, Text } from '@rpg/ui'
import {
  countModifiedFilters,
  createInitialFilterState,
  FilterBar,
  FilterChromeProvider,
  FilterFieldList,
  getSchemaFieldsByPlacement,
} from '@rpg/ui/filters'

import { CatalogOverviewTable } from '@/lib/data-table/catalog-overview-table.client'
import { useOverviewQueryState } from '@/lib/overview-query-state/use-overview-query-state.client'
import { serializeOverviewSort } from '@/lib/overview-query-state/overview-query-state'

import { AdminUserRowActions } from '../components/admin-user-row-actions.client'
import { useAdminUsers } from '../hooks/use-admin-users'
import { adminUsersColumns } from '../lib/admin-users-columns'
import { adminUsersFilterSchema, toAdminUsersListQuery } from '../lib/admin-users-filter-schema'
import {
  ADMIN_USERS_ALLOWED_SORT_IDS,
  ADMIN_USERS_DEFAULT_SORT,
  ADMIN_USERS_TABLE_KEY,
} from '../lib/admin-users-labels'

const DEFAULT_SORT = { id: 'createdAt', desc: true } as const

export function AdminUsersOverviewTable() {
  const filterSchema = useMemo(() => adminUsersFilterSchema(), [])
  const { query, actions } = useOverviewQueryState({
    schema: filterSchema,
    allowedSortIds: ADMIN_USERS_ALLOWED_SORT_IDS,
    defaultSort: DEFAULT_SORT,
  })

  const listQuery = useMemo(
    () =>
      toAdminUsersListQuery(
        query.filters,
        serializeOverviewSort(query.sort, DEFAULT_SORT) ?? ADMIN_USERS_DEFAULT_SORT,
        query.page,
      ),
    [query.filters, query.page, query.sort],
  )

  const { data, isPending, isError } = useAdminUsers(listQuery)
  const users = data?.users ?? []
  const pagination = data?.pagination

  const [advancedOpen, setAdvancedOpen] = useState(false)
  const advancedFields = useMemo(
    () => getSchemaFieldsByPlacement(filterSchema, 'advanced'),
    [filterSchema],
  )
  const advancedModifiedCount = countModifiedFilters(filterSchema, query.filters, 'advanced')

  const handleResetAdvancedFilters = useCallback(() => {
    const defaults = createInitialFilterState(filterSchema)
    for (const field of advancedFields) {
      actions.setFilterValue(field.id, defaults[field.id])
    }
  }, [actions, advancedFields, filterSchema])

  const filterRegion = (
    <FilterChromeProvider>
      <DataTableFilterRegion
        primaryFilters={
          <FilterBar
            schema={filterSchema}
            state={query.filters}
            onValueChange={actions.setFilterValue}
            onReset={() => actions.resetFilters()}
          />
        }
        additionalFilterFields={
          advancedFields.length > 0 ? (
            <FilterFieldList
              schema={filterSchema}
              fields={advancedFields}
              state={query.filters}
              idPrefix="admin-users-filters-advanced"
              onValueChange={actions.setFilterValue}
            />
          ) : undefined
        }
        additionalFiltersOpen={advancedOpen}
        onAdditionalFiltersOpenChange={setAdvancedOpen}
        activeAdditionalFilterCount={advancedModifiedCount}
        onResetAdditionalFilters={handleResetAdvancedFilters}
      />
    </FilterChromeProvider>
  )

  if (isError) {
    return <Text variant="muted">Could not load users.</Text>
  }

  return (
    <div className="space-y-4">
      <CatalogOverviewTable
        tableKey={ADMIN_USERS_TABLE_KEY}
        columns={adminUsersColumns()}
        data={users}
        caption="Platform users"
        filters={filterRegion}
        resultCountLabel={
          pagination ? `${pagination.total} user${pagination.total === 1 ? '' : 's'}` : undefined
        }
        emptyState={isPending ? 'Loading users…' : 'No users match the current filters.'}
        rowActions={(row) => <AdminUserRowActions user={row} />}
      />

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <Text variant="muted" className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </Text>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => actions.setPage(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => actions.setPage(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
