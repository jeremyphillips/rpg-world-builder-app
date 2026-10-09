import type { Meta, StoryObj } from '@storybook/react-vite'
import { Link } from 'react-router-dom'
import { Button } from '@rpg/ui'

import { PageChromeActionsProvider } from '@/components/layout/page-chrome/page-chrome-actions-provider'
import { pageChromeOutlineActionClasses } from '@/components/layout/page-chrome/page-chrome-action.variants'
import { useSetPageChromeActions } from '@/components/layout/page-chrome/use-set-page-chrome-actions'
import { withDashboardProviders } from '../../../../.storybook/decorators'

import { DetailPageHeader } from './detail-page-header'
import { detailPageHeaderClasses } from './detail-page-header.variants'

function RegisteredEditAction() {
  useSetPageChromeActions(
    <Link to="/campaigns/demo/classes/fighter/edit" className={pageChromeOutlineActionClasses}>
      Edit
    </Link>,
  )
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
    <div className={detailPageHeaderClasses}>
      <div className="min-w-0 flex-1 text-sm text-muted-foreground">
        Breadcrumb slot (route-driven)
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" density="compact">
          Edit
        </Button>
      </div>
    </div>
  ),
}
