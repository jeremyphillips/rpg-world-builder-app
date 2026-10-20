import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentCardHeadingAction } from './content-card-actions.client'

const meta = {
  title: 'UI/ContentCardHeadingAction',
  component: ContentCardHeadingAction,
  parameters: { semanticClasses: true },
} satisfies Meta<typeof ContentCardHeadingAction>

export default meta
type Story = StoryObj<typeof meta>

export const TextAction: Story = {
  render: () => <ContentCardHeadingAction>View</ContentCardHeadingAction>,
}

export const AsChildLink: Story = {
  render: () => (
    <ContentCardHeadingAction asChild>
      <a href="/example">View</a>
    </ContentCardHeadingAction>
  ),
}
