import { Link } from 'react-router-dom'
import { Heading, Spinner, Text, buttonVariants } from '@rpg/ui'

type ContentOverviewShellProps = {
  heading: string
  isPending: boolean
  isError: boolean
  errorLabel?: string
  /** When provided, renders a "New" button linked to this href. */
  newHref?: string
  /** Label for the "New" button. Defaults to `"New"`. */
  newLabel?: string
  children: React.ReactNode
}

/**
 * Handles the three-state loading/error/ready pattern shared by every content
 * overview page. Pass `children` for the ready state (typically a DataTable).
 */
export function ContentOverviewShell({
  heading,
  isPending,
  isError,
  errorLabel,
  newHref,
  newLabel = 'New',
  children,
}: ContentOverviewShellProps) {
  if (isPending) {
    return (
      <div className="space-y-2">
        <Heading variant="page" as="h2">
          {heading}
        </Heading>
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <Heading variant="page" as="h2">
          {heading}
        </Heading>
        <Text variant="destructive" role="alert">
          {errorLabel ?? `Could not load ${heading.toLowerCase()}.`}
        </Text>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading variant="page" as="h2">
          {heading}
        </Heading>
        {newHref ? (
          <Link to={newHref} className={buttonVariants({ size: 'sm' })}>
            {newLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  )
}
