import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Weapon } from '@rpg/contracts'
import { Heading } from '@rpg/ui'

import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

const LONGSWORD: Weapon = {
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
}

const SHORTBOW: Weapon = {
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
}

const meta = {
  title: 'Content/Weapons/WeaponDetail',
  component: ContentDetailLayout,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

export const MeleeWeapon: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={LONGSWORD.name}>
      <div className="space-y-4">
        <Heading variant="display" as="h2">
          {LONGSWORD.name}
        </Heading>
        <div className="space-y-3">
          <ContentStatRow label="Category" value="Martial" />
          <ContentStatRow label="Mode" value="Melee" />
          <ContentStatRow label="Damage" value="1d8 slashing" />
          <ContentStatRow label="Versatile" value="1d10" />
          <ContentStatRow label="Properties" value="Versatile" />
          <ContentStatRow label="Mastery" value="Sap" />
          <ContentStatRow label="Weight" value="3 lb" />
          <ContentStatRow label="Cost" value="15 GP" />
        </div>
      </div>
    </ContentDetailLayout>
  ),
}

export const RangedWeapon: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={SHORTBOW.name}>
      <div className="space-y-4">
        <Heading variant="display" as="h2">
          {SHORTBOW.name}
        </Heading>
        <div className="space-y-3">
          <ContentStatRow label="Category" value="Simple" />
          <ContentStatRow label="Mode" value="Ranged" />
          <ContentStatRow label="Damage" value="1d6 piercing" />
          <ContentStatRow label="Properties" value="Ammunition, Two-Handed" />
          <ContentStatRow label="Mastery" value="Vex" />
          <ContentStatRow label="Range" value="80/320 ft." />
          <ContentStatRow label="Weight" value="2 lb" />
          <ContentStatRow label="Cost" value="25 GP" />
        </div>
      </div>
    </ContentDetailLayout>
  ),
}
