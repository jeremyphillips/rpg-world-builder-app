import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentDetailQueryStatus } from '../content-detail-query-status'

const meta = {
  title: 'Content/Detail/ContentDetailQueryStatus',
  component: ContentDetailQueryStatus,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ContentDetailQueryStatus>

export default meta
type Story = StoryObj<typeof ContentDetailQueryStatus>

export const Pending: Story = {
  render: () => <ContentDetailQueryStatus status="pending" />,
}

export const CatalogError: Story = {
  render: () => <ContentDetailQueryStatus status="error" subject="classes" />,
}

export const SectionError: Story = {
  render: () => <ContentDetailQueryStatus status="error" subject="members" />,
}

export const MultipleCatalogs: Story = {
  render: () => (
    <ContentDetailQueryStatus status="error" subject={['equipment', 'skill-proficiencies']} />
  ),
}
