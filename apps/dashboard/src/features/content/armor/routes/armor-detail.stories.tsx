import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Armor } from '@rpg/contracts'
import { Heading } from '@rpg/ui'

import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

const LEATHER: Armor = {
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
}

const CHAIN_MAIL: Armor = {
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
}

const SHIELD: Armor = {
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
}

const meta = {
  title: 'Content/Armor/ArmorDetail',
  component: ContentDetailLayout,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

export const LightArmor: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={LEATHER.name}>
      <div className="space-y-4">
        <Heading variant="display" as="h2">
          {LEATHER.name}
        </Heading>
        <div className="space-y-3">
          <ContentStatRow label="Category" value="Light Armor" />
          <ContentStatRow label="AC" value="11 + Dex" />
          <ContentStatRow label="Stealth" value="—" />
          <ContentStatRow label="Material" value="Organic" />
          <ContentStatRow label="Weight" value="10 lb" />
          <ContentStatRow label="Cost" value="10 GP" />
        </div>
      </div>
    </ContentDetailLayout>
  ),
}

export const HeavyArmor: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={CHAIN_MAIL.name}>
      <div className="space-y-4">
        <Heading variant="display" as="h2">
          {CHAIN_MAIL.name}
        </Heading>
        <div className="space-y-3">
          <ContentStatRow label="Category" value="Heavy Armor" />
          <ContentStatRow label="AC" value="16" />
          <ContentStatRow label="Stealth" value="Disadvantage" />
          <ContentStatRow label="Strength Required" value="13" />
          <ContentStatRow label="Material" value="Metal" />
          <ContentStatRow label="Weight" value="55 lb" />
          <ContentStatRow label="Cost" value="75 GP" />
        </div>
      </div>
    </ContentDetailLayout>
  ),
}

export const Shield: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={SHIELD.name}>
      <div className="space-y-4">
        <Heading variant="display" as="h2">
          {SHIELD.name}
        </Heading>
        <div className="space-y-3">
          <ContentStatRow label="Category" value="Shield" />
          <ContentStatRow label="AC" value="+2" />
          <ContentStatRow label="Stealth" value="—" />
          <ContentStatRow label="Material" value="Metal" />
          <ContentStatRow label="Weight" value="6 lb" />
          <ContentStatRow label="Cost" value="10 GP" />
        </div>
      </div>
    </ContentDetailLayout>
  ),
}
