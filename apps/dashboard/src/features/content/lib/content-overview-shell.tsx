import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page-header'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'
import { useCanManageCampaign } from '@/features/campaign'

type ContentOverviewShellProps = {
  heading: string
  isPending: boolean
  isError: boolean
  errorLabel?: string
  campaignId: string
  /** When provided, renders a "New" button linked to this href for campaign managers. */
  newHref?: string
  /** Label for the "New" button. Defaults to `"New"`. */
  newLabel?: string
  children: React.ReactNode
}

/**
 * Managed catalog list page — composes WidePage + PageHeader + PageLoadState with
 * campaign-manager "New" action gating.
 */
export function ContentOverviewShell({
  heading,
  isPending,
  isError,
  errorLabel,
  campaignId,
  newHref,
  newLabel = 'New',
  children,
}: ContentOverviewShellProps) {
  const canManage = useCanManageCampaign(campaignId)
  const showNew = canManage && newHref
  const actions = showNew ? (
    <Link to={newHref} className={buttonVariants({ size: 'sm' })}>
      {newLabel}
    </Link>
  ) : undefined

  return (
    <WidePage spacing="list">
      <PageHeader heading={heading} actions={actions} />
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={errorLabel}
        defaultErrorLabel={`Could not load ${heading.toLowerCase()}.`}
      >
        {children}
      </PageLoadState>
    </WidePage>
  )
}
