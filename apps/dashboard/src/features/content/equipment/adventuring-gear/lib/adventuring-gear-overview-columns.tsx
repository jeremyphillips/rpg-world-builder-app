import type { AdventuringGearEquipment, WithCampaignAccess } from '@rpg/contracts'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'
import {
  GEAR_KINDS,
  formatWeight,
  getGearKindLabel,
  getSpellcastingGearKindLabel,
} from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, costColumn } from '../../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../../lib/overview/content-overview-filter-schema'

function formatAdventuringGearKindLabel(item: AdventuringGearEquipment): string {
  if (item.gearKind === 'spellcasting' && item.spellcastingGearKind) {
    return getSpellcastingGearKindLabel(item.spellcastingGearKind)
  }
  return getGearKindLabel(item.gearKind)
}

type AdventuringGearRow = WithCampaignAccess<AdventuringGearEquipment>

export type AdventuringGearOverviewFilterState = ContentOverviewBaseFilterState & {
  gearKind?: string
}

const ADVENTURING_GEAR_MIDDLE_COLUMNS: ColumnDef<AdventuringGearEquipment>[] = [
  {
    accessorKey: 'gearKind',
    header: ({ column }) => <SortableHeader column={column}>Gear kind</SortableHeader>,
    cell: ({ row }) => formatAdventuringGearKindLabel(row.original),
    filterFn: 'equalsString',
    meta: { label: 'Gear kind' },
  },
  {
    id: 'weight',
    accessorFn: (row) => row.weight?.value,
    header: ({ column }) => <SortableHeader column={column}>Weight</SortableHeader>,
    cell: ({ row }) => (row.original.weight ? formatWeight(row.original.weight) : '—'),
    meta: { label: 'Weight' },
  },
  costColumn<AdventuringGearEquipment>(),
]

export const adventuringGearFilterSchema = buildContentFilterSchema<
  AdventuringGearRow,
  AdventuringGearOverviewFilterState
>('equipment', [
  createEqualsFilter<AdventuringGearRow, AdventuringGearOverviewFilterState, 'gearKind', string>({
    id: 'gearKind',
    label: 'Gear kind',
    options: GEAR_KINDS.map((gearKind) => ({
      label: getGearKindLabel(gearKind),
      value: gearKind,
    })),
    getValue: (row) => row.gearKind,
  }),
])

/** Adventuring gear column definitions with the name cell linked to the detail page. */
export function adventuringGearColumns(
  campaignId: string,
  usage?: {
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
) {
  return buildContentColumns<AdventuringGearEquipment>(ADVENTURING_GEAR_MIDDLE_COLUMNS, {
    ...usage,
    contentType: 'equipment',
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'adventuring-gear', row.id),
  })
}
