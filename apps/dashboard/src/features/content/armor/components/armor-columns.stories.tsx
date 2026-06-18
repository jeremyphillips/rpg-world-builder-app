import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Armor } from '@rpg/contracts'
import { DataTable } from '@rpg/ui'

import { armorColumns, armorFilters } from './armor-columns'

const CAMPAIGN_ID = 'camp_1'

const SAMPLE_ARMOR: Armor[] = [
  {
    id: 'srd-cc-5.2.1:leather',
    slug: 'leather',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Leather',
    category: 'light',
    cost: { amount: 10, currency: 'gp' },
    weight: { value: 10, unit: 'lb' },
    material: 'organic',
    baseAc: 11,
    addDexModifier: true,
    stealthDisadvantage: false,
  },
  {
    id: 'srd-cc-5.2.1:chain-mail',
    slug: 'chain-mail',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Chain Mail',
    category: 'heavy',
    cost: { amount: 75, currency: 'gp' },
    weight: { value: 55, unit: 'lb' },
    material: 'metal',
    baseAc: 16,
    addDexModifier: false,
    stealthDisadvantage: true,
    strengthRequirement: 13,
  },
  {
    id: 'srd-cc-5.2.1:shield',
    slug: 'shield',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Shield',
    category: 'shields',
    cost: { amount: 10, currency: 'gp' },
    weight: { value: 6, unit: 'lb' },
    material: 'metal',
    acBonus: 2,
    addDexModifier: false,
    stealthDisadvantage: false,
  },
]

const meta = {
  title: 'Content/Armor/ArmorColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DataTable
      columns={armorColumns(CAMPAIGN_ID)}
      data={SAMPLE_ARMOR}
      filters={armorFilters}
      caption="Armor available in this campaign"
    />
  ),
}
