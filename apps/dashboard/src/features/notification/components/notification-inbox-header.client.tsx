'use client'

import { Alert, Button } from '@rpg/ui'
import {
  ActiveFilterChips,
  FilterBar,
  resolveActiveFilterChips,
  type FilterSchema,
} from '@rpg/ui/filters'
import type { Notification } from '@rpg/contracts'

import { NOTIFICATION_COPY } from '../lib/notification-copy'
import type { NotificationInboxFilterState } from '../lib/notification-inbox-filter-schema'

type NotificationInboxHeaderProps = {
  schema: FilterSchema<Notification, NotificationInboxFilterState>
  filters: NotificationInboxFilterState
  onFilterChange: (
    id: keyof NotificationInboxFilterState,
    value: NotificationInboxFilterState[keyof NotificationInboxFilterState] | undefined,
  ) => void
  onClearFilterField: (fieldId: keyof NotificationInboxFilterState) => void
  onResetFilters: () => void
  invalidScopeNotice?: {
    show: boolean
    dismiss: () => void
    copy: {
      invalidHeading: string
      invalidBody: string
      invalidDismissLabel: string
    }
  }
}

export function NotificationInboxHeader({
  schema,
  filters,
  onFilterChange,
  onClearFilterField,
  onResetFilters,
  invalidScopeNotice,
}: NotificationInboxHeaderProps) {
  const activeChips = resolveActiveFilterChips(schema, filters)

  return (
    <div className="space-y-3 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">{NOTIFICATION_COPY.inboxDescription}</p>

      {invalidScopeNotice?.show ? (
        <Alert
          variant="warning"
          title={invalidScopeNotice.copy.invalidHeading}
          description={invalidScopeNotice.copy.invalidBody}
          actions={
            <Button type="button" variant="ghost" size="sm" onClick={invalidScopeNotice.dismiss}>
              {invalidScopeNotice.copy.invalidDismissLabel}
            </Button>
          }
        />
      ) : null}

      <FilterBar
        schema={schema}
        state={filters}
        orientation="vertical"
        onValueChange={onFilterChange}
        onReset={onResetFilters}
        resetLabel="Clear all"
      />

      {activeChips.length > 0 ? (
        <ActiveFilterChips
          chips={activeChips}
          onClear={(fieldId) => onClearFilterField(fieldId as keyof NotificationInboxFilterState)}
          onClearAll={onResetFilters}
        />
      ) : null}
    </div>
  )
}
