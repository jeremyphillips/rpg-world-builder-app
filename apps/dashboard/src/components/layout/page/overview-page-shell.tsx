import { PageHeader } from './page-header'
import { PageLoadState } from './page-load-state'
import { WidePage } from './wide-page'

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
