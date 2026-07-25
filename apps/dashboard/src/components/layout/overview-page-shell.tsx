import { PageHeader } from '@/components/layout/page-header'
import { PageLoadState } from '@/components/layout/page-load-state'
import { WidePage } from '@/components/layout/wide-page'

type OverviewPageShellProps = {
  heading: string
  isPending: boolean
  isError: boolean
  errorLabel?: string
  defaultErrorLabel?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

/** Shared overview page chrome — wide layout, heading, load boundary, optional actions. */
export function OverviewPageShell({
  heading,
  isPending,
  isError,
  errorLabel,
  defaultErrorLabel,
  actions,
  children,
}: OverviewPageShellProps) {
  return (
    <WidePage spacing="list">
      <PageHeader heading={heading} actions={actions} />
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={errorLabel}
        defaultErrorLabel={defaultErrorLabel ?? `Could not load ${heading.toLowerCase()}.`}
      >
        {children}
      </PageLoadState>
    </WidePage>
  )
}
