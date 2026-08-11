import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailSectionPanel } from './detail-section-panel.client'
import { RelationshipList } from '../../relationship/relationship-list.client'

const meta = {
  title: 'Content/Detail/DetailSectionPanel',
  component: DetailSectionPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DetailSectionPanel>

export default meta
type Story = StoryObj<typeof DetailSectionPanel>

export const TerritorialAuthorityPopulated: Story = {
  render: () => (
    <DetailSectionPanel
      heading="Territorial Authority"
      headingId="story-territorial-authority-heading"
      helper="Organizations that govern, control, or claim this location."
    >
      <RelationshipList.Root itemCount={1}>
        <RelationshipList.Group itemCount={1} label="Governs">
          <RelationshipList.Row title="City Council" />
        </RelationshipList.Group>
      </RelationshipList.Root>
      <RelationshipList.Root itemCount={1}>
        <RelationshipList.Group
          itemCount={0}
          label="Controls"
          emptyLabel="No controlling organization."
          headerAction={{ label: 'Add organization', onSelect: () => undefined }}
        />
      </RelationshipList.Root>
      <RelationshipList.Root itemCount={1}>
        <RelationshipList.Group
          itemCount={0}
          label="Claims"
          emptyLabel="No organizations claim this location."
          headerAction={{ label: 'Add claim', onSelect: () => undefined }}
        />
      </RelationshipList.Root>
    </DetailSectionPanel>
  ),
}

export const WithHeaderAction: Story = {
  render: () => (
    <DetailSectionPanel
      heading="Contained locations"
      headingId="story-contained-locations-heading"
      helper="Locations directly within this location."
      headerEndSlot={
        <button type="button" className="text-sm font-medium">
          Add location
        </button>
      }
    >
      <p className="px-4 py-2 text-sm text-muted-foreground">No contained locations yet.</p>
    </DetailSectionPanel>
  ),
}
