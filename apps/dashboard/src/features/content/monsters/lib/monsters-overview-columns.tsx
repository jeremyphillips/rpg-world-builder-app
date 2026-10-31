import {
  CHALLENGE_RATING_MECHANICS,
  CREATURE_SIZE_ENTRIES,
  CREATURE_SIZES,
  formatCreatureSizeList,
  getChallengeRatingLabel,
  getCreatureSizeLabel,
  resolveLargestCreatureSize,
  sortCreatureSizes,
  type CreatureSize,
  type Monster,
  type WithCampaignAccess,
} from '@rpg/contracts'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildSeedCreatureTypeVocabulary, getCreatureTypeLabel } from '@/features/vocabulary'

import { buildContentColumns } from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'

type MonsterRow = WithCampaignAccess<Monster>

export type MonstersOverviewFilterState = ContentOverviewBaseFilterState & {
  creatureType?: Monster['creatureType']
  size?: CreatureSize
}

const creatureTypeVocabulary = buildSeedCreatureTypeVocabulary()

const MONSTERS_MIDDLE_COLUMNS: ColumnDef<Monster>[] = [
  {
    id: 'challengeRating',
    accessorFn: (row) => CHALLENGE_RATING_MECHANICS[row.challengeRating].value,
    header: ({ column }) => <SortableHeader column={column}>CR</SortableHeader>,
    cell: ({ row }) => getChallengeRatingLabel(row.original.challengeRating),
    meta: { label: 'CR' },
  },
  {
    accessorKey: 'creatureType',
    header: ({ column }) => <SortableHeader column={column}>Creature type</SortableHeader>,
    cell: ({ row }) => getCreatureTypeLabel(creatureTypeVocabulary, row.getValue('creatureType')),
    filterFn: 'equalsString',
    meta: { label: 'Creature type' },
  },
  {
    id: 'sizes',
    accessorFn: (row) => {
      const largest = resolveLargestCreatureSize(row.sizes)
      return largest ? CREATURE_SIZE_ENTRIES[largest].rank : 0
    },
    header: ({ column }) => <SortableHeader column={column}>Size</SortableHeader>,
    cell: ({ row }) => formatCreatureSizeList(row.original.sizes),
    meta: { label: 'Size' },
  },
]

export const monstersFilterSchema = buildContentFilterSchema<
  MonsterRow,
  MonstersOverviewFilterState
>('monsters', [
  createEqualsFilter<
    MonsterRow,
    MonstersOverviewFilterState,
    'creatureType',
    Monster['creatureType']
  >({
    id: 'creatureType',
    label: 'Creature type',
    options: [...creatureTypeVocabulary.activeIds].map((id) => ({
      value: id,
      label: getCreatureTypeLabel(creatureTypeVocabulary, id),
    })),
    getValue: (row) => row.creatureType,
  }),
  createEqualsFilter<MonsterRow, MonstersOverviewFilterState, 'size', CreatureSize>({
    id: 'size',
    label: 'Size',
    options: sortCreatureSizes([...CREATURE_SIZES]).map((size) => ({
      value: size,
      label: getCreatureSizeLabel(size),
    })),
    getValue: (row) => resolveLargestCreatureSize(row.sizes) ?? 'medium',
    matches: (row, value) => row.sizes.includes(value as CreatureSize),
  }),
])

export function monstersColumns(
  campaignId: string,
  usage?: {
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
) {
  return buildContentColumns<Monster>(MONSTERS_MIDDLE_COLUMNS, {
    ...usage,
    contentType: 'monsters',
    nameHref: (row) => ROUTES.content.monsters.detail(campaignId, row.id),
  })
}
