import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Equipment } from '@rpg/contracts'
import { DataTable } from '@rpg/ui'

import { equipmentColumns, equipmentFilters } from './equipment-columns'

const CAMPAIGN_ID = 'camp_1'

const SAMPLE_EQUIPMENT: Equipment[] = [
  {
    id: 'srd-cc-5.2.1:torch',
    slug: 'torch',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    kind: 'gear',
    name: 'Torch',
    cost: { amount: 1, currency: 'cp' },
    weight: { value: 1, unit: 'lb' },
    gearCategory: 'lighting',
  },
  {
    id: 'srd-cc-5.2.1:arrows',
    slug: 'arrows',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    kind: 'ammunition',
    name: 'Arrows',
    cost: { amount: 1, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    bundleSize: 20,
    storage: 'Quiver',
  },
  {
    id: 'srd-cc-5.2.1:orb',
    slug: 'orb',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    kind: 'focus',
    name: 'Orb',
    cost: { amount: 20, currency: 'gp' },
    weight: { value: 3, unit: 'lb' },
    focusType: 'arcane',
  },
  {
    id: 'srd-cc-5.2.1:riding-horse',
    slug: 'riding-horse',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    kind: 'mount',
    name: 'Horse, Riding',
    cost: { amount: 75, currency: 'gp' },
    carryingCapacity: { value: 480, unit: 'lb' },
    speed: '60 ft.',
  },
  {
    id: 'srd-cc-5.2.1:rowboat',
    slug: 'rowboat',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    kind: 'ship',
    name: 'Rowboat',
    cost: { amount: 50, currency: 'gp' },
    speed: '1½ mph',
    crew: 1,
    passengers: 3,
    ac: 11,
    hp: 50,
  },
]

const meta = {
  title: 'Content/Equipment/EquipmentColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={equipmentColumns(CAMPAIGN_ID)}
      data={SAMPLE_EQUIPMENT}
      filters={equipmentFilters}
      caption="Equipment available in this campaign"
    />
  ),
}
