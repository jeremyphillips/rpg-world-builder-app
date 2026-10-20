import { Link } from 'react-router-dom'
import { ButtonLink } from '@rpg/ui'

import { OverviewPageShell } from '@/components/layout/page/overview-page-shell'
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
  /** When provided, replaces the default `newHref` link action. */
  actions?: React.ReactNode
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
  actions,
  children,
}: ContentOverviewShellProps) {
  const canManage = useCanManageCampaign(campaignId)
  const showNew = canManage && (actions != null || newHref)
  const resolvedActions =
    actions ??
    (newHref ? (
      <ButtonLink link={<Link to={newHref} />} size="sm">
        {newLabel}
      </ButtonLink>
    ) : undefined)

  return (
    <OverviewPageShell
      heading={heading}
      isPending={isPending}
      isError={isError}
      errorLabel={errorLabel}
      actions={showNew ? resolvedActions : undefined}
    >
      {children}
    </OverviewPageShell>
  )
}
