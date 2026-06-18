type ContentOverviewShellProps = {
  heading: string
  isPending: boolean
  isError: boolean
  loadingLabel?: string
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
  loadingLabel,
  errorLabel,
  children,
}: ContentOverviewShellProps) {
  if (isPending) {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
        <p className="text-sm text-muted-foreground">
          {loadingLabel ?? `Loading ${heading.toLowerCase()}…`}
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
        <p role="alert" className="text-sm text-destructive">
          {errorLabel ?? `Could not load ${heading.toLowerCase()}.`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
      {children}
    </div>
  )
}
