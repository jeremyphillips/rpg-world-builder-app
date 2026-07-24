import type { Meta, StoryObj } from '@storybook/react-vite'

import { DuplicateContentDialog } from './duplicate-content-dialog.client'
import { contentOverviewListQueryKey } from '../overview/content-overview-query-keys'

const meta = {
  title: 'Content/Duplication/DuplicateContentDialog',
  component: DuplicateContentDialog,
  parameters: { layout: 'padded' },
  args: {
    campaignId: 'camp-1',
    contentTypeKey: 'classes',
    queryKeyFn: (campaignId: string) => contentOverviewListQueryKey(campaignId, 'classes'),
    source: { id: 'cls-1', name: 'Fighter', source: 'homebrew' as const },
    trigger: <button type="button">Duplicate</button>,
  },
} satisfies Meta<typeof DuplicateContentDialog>

export default meta
type Story = StoryObj<typeof meta>

export const HomebrewSource: Story = {}

export const SystemSource: Story = {
  args: {
    source: { id: 'cls-1', name: 'Fighter', source: 'system' },
  },
}
