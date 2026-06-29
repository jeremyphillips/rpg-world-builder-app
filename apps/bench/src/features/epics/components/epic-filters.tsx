import {
  EPIC_STATUSES,
  EPIC_STATUS_LABELS,
  TICKET_AREA_SUGGESTIONS,
} from '@rpg/contracts/dev-bench'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@rpg/ui'

import type { EpicListFilters } from '../hooks/epic-query-keys'

interface EpicFiltersProps {
  filters: EpicListFilters
  onChange: (filters: EpicListFilters) => void
}

const ALL_VALUE = '__all__'

function FilterSelect({
  id,
  label,
  value,
  onValueChange,
  options,
}: {
  id: string
  label: string
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="h-8 min-w-[7rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function EpicFilters({ filters, onChange }: EpicFiltersProps) {
  function patch(partial: Partial<EpicListFilters>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <Text variant="small" className="font-medium">
        Filters
      </Text>
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          id="epic-filter-status"
          label="Status"
          value={filters.status ?? ALL_VALUE}
          onValueChange={(value) =>
            patch({
              status: value === ALL_VALUE ? undefined : (value as EpicListFilters['status']),
            })
          }
          options={[
            { value: ALL_VALUE, label: 'All statuses' },
            ...EPIC_STATUSES.map((status) => ({
              value: status,
              label: EPIC_STATUS_LABELS[status],
            })),
          ]}
        />
        <FilterSelect
          id="epic-filter-area"
          label="Area"
          value={filters.area ?? ALL_VALUE}
          onValueChange={(value) => patch({ area: value === ALL_VALUE ? undefined : value })}
          options={[
            { value: ALL_VALUE, label: 'All areas' },
            ...TICKET_AREA_SUGGESTIONS.map((area) => ({ value: area, label: area })),
          ]}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-0.5"
          onClick={() => onChange({})}
        >
          Clear filters
        </Button>
      </div>
    </div>
  )
}
