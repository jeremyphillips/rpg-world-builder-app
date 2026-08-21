import type { ReactNode } from 'react'
import { Spinner, Text } from '@rpg/ui'

export const CONTENT_CATALOG_OPTIONS_ERROR = 'Could not load catalog options.'

export interface ContentFormShellResolverProps {
  isPending: boolean
  isError: boolean
  errorLabel?: string
  children: ReactNode
}

/** Renders a spinner or error alert while async form prerequisites load. */
export function ContentFormShellResolver({
  isPending,
  isError,
  errorLabel,
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
      <Text variant="destructive" role="alert">
        {errorLabel ?? 'Could not load page data.'}
      </Text>
    )
  }
  return children
}
