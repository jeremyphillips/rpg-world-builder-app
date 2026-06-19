import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Weapon } from '@rpg/contracts'
import { DataTable } from '@rpg/ui'

import { weaponsColumns, weaponsFilters } from './weapons-columns'

const CAMPAIGN_ID = 'camp_1'

const SAMPLE_WEAPONS: Weapon[] = [
  {
    id: 'srd-cc-5.2.1:longsword',
    slug: 'longsword',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Longsword',
    category: 'martial',
    mode: 'melee',
    cost: { amount: 15, currency: 'gp' },
    weight: { value: 3, unit: 'lb' },
    damage: { kind: 'dice', count: 1, faces: 8 },
    damageType: 'slashing',
    versatileDamage: { kind: 'dice', count: 1, faces: 10 },
    properties: ['versatile'],
    mastery: 'sap',
  },
  {
    id: 'srd-cc-5.2.1:shortbow',
    slug: 'shortbow',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Shortbow',
    category: 'simple',
    mode: 'ranged',
    cost: { amount: 25, currency: 'gp' },
    weight: { value: 2, unit: 'lb' },
    damage: { kind: 'dice', count: 1, faces: 6 },
    damageType: 'piercing',
    properties: ['ammunition', 'two-handed'],
    mastery: 'vex',
    range: { normal: 80, long: 320 },
  },
  {
    id: 'srd-cc-5.2.1:dagger',
    slug: 'dagger',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Dagger',
    category: 'simple',
    mode: 'melee',
    cost: { amount: 2, currency: 'gp' },
    weight: { value: 1, unit: 'lb' },
    damage: { kind: 'dice', count: 1, faces: 4 },
    damageType: 'piercing',
    properties: ['finesse', 'light', 'thrown'],
    mastery: 'nick',
    range: { normal: 20, long: 60 },
  },
]

const meta = {
  title: 'Content/Weapons/WeaponsColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={weaponsColumns(CAMPAIGN_ID)}
      data={SAMPLE_WEAPONS}
      filters={weaponsFilters}
      caption="Weapons available in this campaign"
    />
  ),
}
