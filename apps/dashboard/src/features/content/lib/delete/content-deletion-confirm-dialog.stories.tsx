import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentDeletionConfirmDialog } from './content-deletion-confirm-dialog.client'

const meta = {
  title: 'Content/ContentDeletionConfirmDialog',
  component: ContentDeletionConfirmDialog,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ContentDeletionConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {
  args: {
    open: true,
    contentTypeKey: 'species',
    entityName: 'Custom Folk',
    onOpenChange: () => {},
    onConfirm: () => {},
  },
}
