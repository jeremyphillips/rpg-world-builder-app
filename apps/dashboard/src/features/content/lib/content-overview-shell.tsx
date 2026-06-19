import { Heading, Spinner, Text } from '@rpg/ui'

type ContentOverviewShellProps = {
  heading: string
  isPending: boolean
  isError: boolean
  errorLabel?: string
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
  children,
}: ContentOverviewShellProps) {
  if (isPending) {
    return (
      <div className="space-y-2">
        <Heading variant="page" as="h2">
          {heading}
        </Heading>
        <Spinner />
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
      <Heading variant="page" as="h2">
        {heading}
      </Heading>
      {children}
    </div>
  )
}
