import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentUsageReferencesSection } from './content-usage-references-section'

const meta = {
  title: 'Dashboard/Content/ContentUsageReferencesSection',
  component: ContentUsageReferencesSection,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ContentUsageReferencesSection>

export default meta
type Story = StoryObj<typeof meta>

/** Empty usage — section renders nothing until the query resolves with data. */
export const LoadingOrEmpty: Story = {
  args: {
    campaignId: 'camp_story',
    routeKey: 'classes',
    entityId: 'class_story',
  },
}
