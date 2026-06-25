import type { ReactNode } from 'react'

import { Spinner, Text } from '@rpg/ui'

export interface PageLoadStateProps {
  isPending: boolean
  isError: boolean
  /** Shown when `isError` is true. Falls back to `defaultErrorLabel`. */
  errorLabel?: string
  defaultErrorLabel?: string
  children: ReactNode
}

/** Async body slot — spinner, error alert, or ready children beneath a PageHeader. */
export function PageLoadState({
  isPending,
  isError,
  errorLabel,
  defaultErrorLabel = 'Could not load page data.',
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
      <Text variant="destructive" role="alert">
        {errorLabel ?? defaultErrorLabel}
      </Text>
    )
  }

  return children
}
