import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@rpg/ui'

import { ContentDetailEditAction } from '@/features/content/lib/detail/page/content-detail-edit-action'
import { PageChromeActionsProvider } from '@/components/layout/page-chrome/page-chrome-actions-provider'
import { useSetPageChromeActions } from '@/components/layout/page-chrome/use-set-page-chrome-actions'
import { withDashboardProviders } from '../../../../.storybook/decorators'

import { DetailPageHeader } from './detail-page-header'

function RegisteredEditAction() {
  useSetPageChromeActions(<ContentDetailEditAction to="/campaigns/demo/classes/fighter/edit" />)
  return null
}

const meta = {
  title: 'Layout/DetailPageHeader',
  component: DetailPageHeader,
  parameters: { layout: 'fullscreen' },
  decorators: [
    withDashboardProviders,
    (Story) => (
      <PageChromeActionsProvider>
        <div className="border-b border-border bg-background px-6">
          <Story />
        </div>
      </PageChromeActionsProvider>
    ),
  ],
} satisfies Meta<typeof DetailPageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const ActionsOnly: Story = {
  render: () => (
    <>
      <RegisteredEditAction />
      <DetailPageHeader />
    </>
  ),
}

export const ChromeShell: Story = {
  render: () => (
    <div className="flex h-8 shrink-0 items-center justify-between gap-4">
      <div className="min-w-0 flex-1 text-style-supporting">Breadcrumb slot (route-driven)</div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" density="compact">
          Edit
        </Button>
      </div>
    </div>
  ),
}
