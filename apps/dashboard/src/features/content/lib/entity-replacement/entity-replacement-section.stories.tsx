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
      entity: {
        heading: 'Dock Ward',
        headingSuffix: ' · District',
        supportingText: 'Located in Harborford',
      },
    },
    newHelper: 'Choose a valid parent location.',
  },
}

export const OrganizationReplacementUnavailable: Story = {
  args: {
    entityLabel: 'Organization',
    current: {
      entity: {
        heading: 'Unavailable organization',
      },
      unavailable: true,
    },
    newHelper: 'Choose a different organization.',
  },
}
