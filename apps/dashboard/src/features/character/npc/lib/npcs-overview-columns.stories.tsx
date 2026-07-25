import type { Meta, StoryObj } from '@storybook/react-vite'

import { CatalogOverviewTable } from '@/lib/data-table/catalog-overview-table.client'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../../lib/character-fixtures'
import { npcOverviewFilterSchema } from './npc-overview-filter-schema'

const STORY_CAMPAIGN_ID = 'camp_1'
import { NPC_OVERVIEW_TABLE_KEY } from './npc-overview-labels'
import { npcsOverviewColumns } from './npcs-overview-columns'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

const NPC_ROSTER = [
  {
    ...SAMPLE_PC,
    id: 'npc-1',
    characterType: 'npc' as const,
    campaignId: STORY_CAMPAIGN_ID,
    userId: undefined,
    name: 'Captain Aldric',
  },
  {
    ...SAMPLE_PC,
    id: 'npc-2',
    characterType: 'npc' as const,
    campaignId: STORY_CAMPAIGN_ID,
    userId: undefined,
    name: 'Mira Thornwick',
    classes: [{ classId: 'srd-cc-5.2.1:warlock', level: 5 }],
    species: { id: 'srd-cc-5.2.1:elf' },
  },
]

const meta = {
  title: 'Character/NPC/NpcsOverviewColumns',
  component: CatalogOverviewTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogOverviewTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <CatalogOverviewTable
      tableKey={`${NPC_OVERVIEW_TABLE_KEY}-story`}
      columns={npcsOverviewColumns(STORY_CAMPAIGN_ID, catalogIndex)}
      data={NPC_ROSTER}
      filterSchema={npcOverviewFilterSchema(catalogIndex)}
      caption="Non-player characters in this campaign"
    />
  ),
}
