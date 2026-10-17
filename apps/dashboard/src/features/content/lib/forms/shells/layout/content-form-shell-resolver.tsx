import type { ReactNode } from 'react'
import { Button, Spinner, Text } from '@rpg/ui'

export const CONTENT_CATALOG_OPTIONS_ERROR = 'Could not load catalog options.'

export const CONTENT_CATALOG_OPTIONS_RETRY_LABEL = 'Retry'

export interface ContentFormShellResolverProps {
  isPending: boolean
  isError: boolean
  errorLabel?: string
  isRetrying?: boolean
  onRetry?: () => void
  children: ReactNode
}

/** Renders a spinner or error alert while async form prerequisites load. */
export function ContentFormShellResolver({
  isPending,
  isError,
  errorLabel,
  isRetrying = false,
  onRetry,
  children,
}: ContentFormShellResolverProps) {
  if (isPending) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <Text variant="destructive" role="alert">
          {errorLabel ?? 'Could not load page data.'}
        </Text>
        {onRetry ? (
          <Button type="button" variant="outline" disabled={isRetrying} onClick={onRetry}>
            {isRetrying ? 'Retrying…' : CONTENT_CATALOG_OPTIONS_RETRY_LABEL}
          </Button>
        ) : null}
      </div>
    )
  }
  return children
}
