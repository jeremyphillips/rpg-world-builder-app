import type { Meta, StoryObj } from '@storybook/react-vite'

import { CrossContentRelationshipRow } from './cross-content-relationship-row.client'
import {
  RelationshipFieldGroup,
  RelationshipFieldGroupRow,
} from './relationship-field-group.client'
import { RelationshipEmptyInlineRow } from './relationship-empty-inline-row.client'

const meta = {
  title: 'Content/Relationship/RelationshipFieldGroup',
  component: RelationshipFieldGroup,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RelationshipFieldGroup>

export default meta
type Story = StoryObj<typeof RelationshipFieldGroup>

export const TerritorialAuthorityPopulated: Story = {
  render: () => (
    <RelationshipFieldGroup
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
    </RelationshipFieldGroup>
  ),
}

export const TerritorialAuthorityControlsEmpty: Story = {
  render: () => (
    <RelationshipFieldGroup
      heading="Territorial Authority"
      headingId="story-territorial-controls-empty-heading"
      helper="Organizations that govern, control, or claim this location."
    >
      <RelationshipFieldGroupRow eyebrow="Controls">
        <RelationshipEmptyInlineRow
          emptyLabel="No controlling organization."
          addLabel="Add organization"
          onAdd={() => undefined}
        />
      </RelationshipFieldGroupRow>
    </RelationshipFieldGroup>
  ),
}

export const TerritorialAuthorityClaimsEmpty: Story = {
  render: () => (
    <RelationshipFieldGroup
      heading="Territorial Authority"
      headingId="story-territorial-claims-empty-heading"
      helper="Organizations that govern, control, or claim this location."
    >
      <RelationshipFieldGroupRow eyebrow="Claims">
        <RelationshipEmptyInlineRow
          emptyLabel="No organizations claim this location."
          addLabel="Add claim"
          onAdd={() => undefined}
        />
      </RelationshipFieldGroupRow>
    </RelationshipFieldGroup>
  ),
}
