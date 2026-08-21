import type { Meta, StoryObj } from '@storybook/react-vite'

import { ContentDeletionBlockedDialog } from './content-deletion-blocked-dialog'

const meta = {
  title: 'Content/ContentDeletionBlockedDialog',
  component: ContentDeletionBlockedDialog,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ContentDeletionBlockedDialog>

export default meta
type Story = StoryObj<typeof meta>

export const WithUsageBlockers: Story = {
  args: {
    open: true,
    entityName: 'Custom Folk',
    onOpenChange: () => {},
    blockers: [
      {
        kind: 'usage',
        usage: {
          kind: 'character',
          id: 'npc-1',
          label: 'Goblin Scout',
          characterType: 'npc',
          campaignId: 'camp-1',
        },
      },
    ],
  },
}
