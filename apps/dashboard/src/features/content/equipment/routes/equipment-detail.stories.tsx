import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Equipment } from '@rpg/contracts'

import { ContentDetailLayout } from '../../lib/content-detail-layout'
import { ContentStatRow } from '../../lib/content-stat-row'
import { getContentImageUrl } from '../../lib/content-image-url'

const TORCH: Equipment = {
  id: 'srd-cc-5.2.1:torch',
  slug: 'torch',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  kind: 'gear',
  name: 'Torch',
  description: 'A torch burns for 1 hour, shedding bright light in a 20-foot radius.',
  cost: { amount: 1, currency: 'cp' },
  weight: { value: 1, unit: 'lb' },
  gearCategory: 'lighting',
}

const ROWBOAT: Equipment = {
  id: 'srd-cc-5.2.1:rowboat',
  slug: 'rowboat',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  kind: 'ship',
  name: 'Rowboat',
  description: 'A small open boat propelled by oars.',
  cost: { amount: 50, currency: 'gp' },
  speed: '1½ mph',
  crew: 1,
  passengers: 3,
  ac: 11,
  hp: 50,
}

const RIDING_HORSE: Equipment = {
  id: 'srd-cc-5.2.1:riding-horse',
  slug: 'riding-horse',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  kind: 'mount',
  name: 'Horse, Riding',
  description: 'A common riding horse suited for travel on roads and open terrain.',
  cost: { amount: 75, currency: 'gp' },
  carryingCapacity: { value: 480, unit: 'lb' },
  speed: '60 ft.',
}

const meta = {
  title: 'Content/Equipment/EquipmentDetail',
  component: ContentDetailLayout,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailLayout>

export default meta
type Story = StoryObj<typeof meta>

export const GearItem: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={TORCH.name}>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">{TORCH.name}</h2>
        <div className="space-y-3">
          <ContentStatRow label="Kind" value="Adventuring Gear" />
          <ContentStatRow label="Cost" value="1 CP" />
          <ContentStatRow label="Weight" value="1 lb" />
          <ContentStatRow label="Category" value="Lighting" />
        </div>
        <p className="text-muted-foreground">{TORCH.description}</p>
      </div>
    </ContentDetailLayout>
  ),
}

export const ShipItem: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={ROWBOAT.name}>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">{ROWBOAT.name}</h2>
        <div className="space-y-3">
          <ContentStatRow label="Kind" value="Ship" />
          <ContentStatRow label="Cost" value="50 GP" />
          <ContentStatRow label="Speed" value="1½ mph" />
          <ContentStatRow label="Crew" value="1" />
          <ContentStatRow label="Passengers" value="3" />
          <ContentStatRow label="AC" value="11" />
          <ContentStatRow label="HP" value="50" />
        </div>
        <p className="text-muted-foreground">{ROWBOAT.description}</p>
      </div>
    </ContentDetailLayout>
  ),
}

export const MountItem: Story = {
  render: () => (
    <ContentDetailLayout imageUrl={getContentImageUrl(undefined)} imageName={RIDING_HORSE.name}>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">{RIDING_HORSE.name}</h2>
        <div className="space-y-3">
          <ContentStatRow label="Kind" value="Mount" />
          <ContentStatRow label="Cost" value="75 GP" />
          <ContentStatRow label="Carrying Capacity" value="480 lb" />
          <ContentStatRow label="Speed" value="60 ft." />
        </div>
        <p className="text-muted-foreground">{RIDING_HORSE.description}</p>
      </div>
    </ContentDetailLayout>
  ),
}
