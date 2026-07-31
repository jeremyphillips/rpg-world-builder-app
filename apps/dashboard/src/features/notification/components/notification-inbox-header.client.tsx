'use client'

import { Alert, Button } from '@rpg/ui'
import type { Notification } from '@rpg/contracts'
import type { FilterSchema } from '@rpg/ui/filters'

import { PrimaryFilterBarRegion } from '@/lib/data-table/primary-filter-bar-region.client'

import { NOTIFICATION_COPY } from '../lib/notification-copy'
import type { NotificationInboxFilterState } from '../lib/notification-inbox-filter-schema'

type NotificationInboxHeaderProps = {
  schema: FilterSchema<Notification, NotificationInboxFilterState>
  filters: NotificationInboxFilterState
  onFilterChange: (
    id: keyof NotificationInboxFilterState,
    value: NotificationInboxFilterState[keyof NotificationInboxFilterState] | undefined,
  ) => void
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
  onResetFilters,
  invalidScopeNotice,
}: NotificationInboxHeaderProps) {
  return (
    <div className="space-y-3">
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

      <PrimaryFilterBarRegion
        filterSchema={schema}
        filterState={filters}
        onValueChange={onFilterChange}
        onReset={onResetFilters}
        resetLabel="Clear all"
      />
    </div>
  )
}
