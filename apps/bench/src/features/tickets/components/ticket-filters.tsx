import {
  TICKET_AREA_SUGGESTIONS,
  TICKET_CREATED_BY,
  TICKET_CREATED_BY_LABELS,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABELS,
  TICKET_SIZES,
  TICKET_SIZE_LABELS,
  TICKET_TYPES,
  TICKET_TYPE_LABELS,
} from '@rpg/contracts/dev-bench'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Text,
} from '@rpg/ui'

import { useEpicsList } from '@/features/epics'
import {
  EPIC_FILTER_ALL,
  EPIC_FILTER_NONE,
  type TicketListFilters,
} from '../hooks/ticket-query-keys'

interface TicketFiltersProps {
  filters: TicketListFilters
  onChange: (filters: TicketListFilters) => void
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

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  const { data: epics = [] } = useEpicsList()

  function patch(partial: Partial<TicketListFilters>) {
    onChange({ ...filters, ...partial })
  }

  const epicValue =
    filters.epic === EPIC_FILTER_NONE
      ? EPIC_FILTER_NONE
      : filters.epic && filters.epic !== EPIC_FILTER_ALL
        ? filters.epic
        : ALL_VALUE

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <Text variant="small" className="font-medium">
        Filters
      </Text>
      <div className="flex flex-wrap items-end gap-3">
        <FilterSelect
          id="filter-type"
          label="Type"
          value={filters.type ?? ALL_VALUE}
          onValueChange={(value) =>
            patch({ type: value === ALL_VALUE ? undefined : (value as TicketListFilters['type']) })
          }
          options={[
            { value: ALL_VALUE, label: 'All types' },
            ...TICKET_TYPES.map((type) => ({ value: type, label: TICKET_TYPE_LABELS[type] })),
          ]}
        />
        <FilterSelect
          id="filter-priority"
          label="Priority"
          value={filters.priority ?? ALL_VALUE}
          onValueChange={(value) =>
            patch({
              priority: value === ALL_VALUE ? undefined : (value as TicketListFilters['priority']),
            })
          }
          options={[
            { value: ALL_VALUE, label: 'All priorities' },
            ...TICKET_PRIORITIES.map((priority) => ({
              value: priority,
              label: TICKET_PRIORITY_LABELS[priority],
            })),
          ]}
        />
        <FilterSelect
          id="filter-size"
          label="Size"
          value={filters.size ?? ALL_VALUE}
          onValueChange={(value) =>
            patch({ size: value === ALL_VALUE ? undefined : (value as TicketListFilters['size']) })
          }
          options={[
            { value: ALL_VALUE, label: 'All sizes' },
            ...TICKET_SIZES.map((size) => ({ value: size, label: TICKET_SIZE_LABELS[size] })),
          ]}
        />
        <FilterSelect
          id="filter-epic"
          label="Epic"
          value={epicValue}
          onValueChange={(value) => {
            if (value === ALL_VALUE) patch({ epic: undefined })
            else if (value === EPIC_FILTER_NONE) patch({ epic: EPIC_FILTER_NONE })
            else patch({ epic: value })
          }}
          options={[
            { value: ALL_VALUE, label: 'All epics' },
            { value: EPIC_FILTER_NONE, label: 'No epic' },
            ...epics.map((epic) => ({ value: epic.id, label: epic.title })),
          ]}
        />
        <FilterSelect
          id="filter-area"
          label="Area"
          value={filters.area ?? ALL_VALUE}
          onValueChange={(value) => patch({ area: value === ALL_VALUE ? undefined : value })}
          options={[
            { value: ALL_VALUE, label: 'All areas' },
            ...TICKET_AREA_SUGGESTIONS.map((area) => ({ value: area, label: area })),
          ]}
        />
        <FilterSelect
          id="filter-created-by"
          label="Created by"
          value={filters.createdBy ?? ALL_VALUE}
          onValueChange={(value) =>
            patch({
              createdBy:
                value === ALL_VALUE ? undefined : (value as TicketListFilters['createdBy']),
            })
          }
          options={[
            { value: ALL_VALUE, label: 'Anyone' },
            ...TICKET_CREATED_BY.map((createdBy) => ({
              value: createdBy,
              label: TICKET_CREATED_BY_LABELS[createdBy],
            })),
          ]}
        />
        <div className="flex items-center gap-2 pb-1">
          <Switch
            id="filter-include-wont-do"
            checked={filters.includeWontDo ?? false}
            onCheckedChange={(checked) => patch({ includeWontDo: checked })}
          />
          <label htmlFor="filter-include-wont-do" className="text-sm">
            Include won&apos;t do
          </label>
        </div>
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
