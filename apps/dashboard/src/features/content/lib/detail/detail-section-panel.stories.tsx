import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailSectionPanel } from './detail-section-panel.client'
import { CrossContentRelationshipRow } from '../relationship/cross-content-relationship-row.client'
import { RelationshipEmptyInlineRow } from '../relationship/relationship-empty-inline-row.client'
import { RelationshipFieldGroupRow } from '../relationship/relationship-field-group-row.client'

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
      <RelationshipFieldGroupRow eyebrow="Governs">
        <CrossContentRelationshipRow heading="City Council" />
      </RelationshipFieldGroupRow>
      <RelationshipFieldGroupRow eyebrow="Controls">
        <RelationshipEmptyInlineRow
          emptyLabel="No controlling organization."
          addLabel="Add organization"
          onAdd={() => undefined}
        />
      </RelationshipFieldGroupRow>
      <RelationshipFieldGroupRow eyebrow="Claims">
        <RelationshipEmptyInlineRow
          emptyLabel="No organizations claim this location."
          addLabel="Add claim"
          onAdd={() => undefined}
        />
      </RelationshipFieldGroupRow>
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
