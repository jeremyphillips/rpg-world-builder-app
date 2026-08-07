import type { Meta, StoryObj } from '@storybook/react-vite'

import { EntityReplacementSection } from './entity-replacement-section.client'

const meta = {
  title: 'Content/EntityReplacement/EntityReplacementSection',
  component: EntityReplacementSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EntityReplacementSection>

export default meta
type Story = StoryObj<typeof EntityReplacementSection>

export const LocationReplacement: Story = {
  args: {
    entityLabel: 'Location',
    current: {
      heading: 'Dock Ward',
      subheading: 'District',
    },
    newHelper: 'Choose a valid parent location.',
  },
}

export const OrganizationReplacementUnavailable: Story = {
  args: {
    entityLabel: 'Organization',
    current: {
      heading: 'Unavailable organization',
      unavailable: true,
    },
    newHelper: 'Choose a different organization.',
  },
}
