import type { Meta, StoryObj } from '@storybook/react-vite'

import { DetailPreviewModal } from './detail-preview-modal.client'

const meta = {
  title: 'UI/DetailPreviewModal',
  component: DetailPreviewModal,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DetailPreviewModal>

export default meta
type Story = StoryObj<typeof DetailPreviewModal>

export const Default: Story = {
  args: {
    open: true,
    headline: 'Preview fighter',
    onOpenChange: () => undefined,
    children: <p className="text-sm text-muted-foreground">Caller-owned preview body.</p>,
  },
}
