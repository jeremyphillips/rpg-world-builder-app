import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Button, Spinner, Text } from '@rpg/ui'

export interface PageLoadStateProps {
  isPending: boolean
  isError: boolean
  /** Shown when `isError` is true. Falls back to `defaultErrorLabel`. */
  errorLabel?: string
  defaultErrorLabel?: string
  errorBackLink?: {
    href: string
    label: string
  }
  onRetry?: () => void
  children: ReactNode
}

const PAGE_LOAD_RETRY_LABEL = 'Retry'

/** Async body slot — spinner, error alert, or ready children beneath a PageHeader. */
export function PageLoadState({
  isPending,
  isError,
  errorLabel,
  defaultErrorLabel = 'Could not load page data.',
  errorBackLink,
  onRetry,
  children,
}: PageLoadStateProps) {
  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-3">
        <Text variant="destructive" role="alert">
          {errorLabel ?? defaultErrorLabel}
        </Text>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            {PAGE_LOAD_RETRY_LABEL}
          </Button>
        ) : null}
        {errorBackLink ? (
          <Link
            to={errorBackLink.href}
            className="text-style-supporting underline-offset-4 hover:underline"
          >
            Back to {errorBackLink.label}
          </Link>
        ) : null}
      </div>
    )
  }

  return children
}
