import { Alert, Button } from '@rpg/ui'
import type { Notification } from '@rpg/contracts'
import type { FilterSchema } from '@rpg/ui/filters'

import { PrimaryFilterPanel } from '@/lib/data-table/primary-filter-bar-region'

import { NOTIFICATION_COPY } from '../lib/notification-copy'
import type { NotificationInboxFilterState } from '../lib/notification-inbox-filter-schema'

type NotificationInboxHeaderProps = {
  schema: FilterSchema<Notification, NotificationInboxFilterState>
  filters: NotificationInboxFilterState
  onFilterChange: (
    id: keyof NotificationInboxFilterState,
    value: NotificationInboxFilterState[keyof NotificationInboxFilterState] | undefined,
  ) => void
  clearFilterField: (id: keyof NotificationInboxFilterState) => void
  resetFilters: () => void
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
  clearFilterField,
  resetFilters,
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

      <PrimaryFilterPanel
        filterSchema={schema}
        filterState={filters}
        onValueChange={onFilterChange}
        clearFilterField={clearFilterField}
        resetFilters={resetFilters}
      />
    </div>
  )
}
