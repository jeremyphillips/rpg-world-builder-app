import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { OverviewPageShell } from '@/components/layout/overview-page-shell'
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
 * Managed content catalog list page — campaign-manager "New" action gating on
 * {@link OverviewPageShell}.
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
    <OverviewPageShell
      heading={heading}
      isPending={isPending}
      isError={isError}
      errorLabel={errorLabel}
      actions={actions}
    >
      {children}
    </OverviewPageShell>
  )
}
