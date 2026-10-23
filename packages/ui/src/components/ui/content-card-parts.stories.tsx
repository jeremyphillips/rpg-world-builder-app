import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentCardMedia } from './content-card-parts.client'

const meta = {
  title: 'UI/ContentCardMedia',
  component: ContentCardMedia,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ContentCardMedia>

export default meta
type Story = StoryObj<typeof meta>

export const FallbackDensities: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <ContentCardMedia density="compact" fallback="spell" alt="" />
      <ContentCardMedia density="comfortable" fallback="spell" alt="" />
      <ContentCardMedia density="spacious" fallback="location" alt="" />
    </div>
  ),
}
