'use client'

import { Button } from './button.client'
import { Text } from './text'

export type NotificationErrorStateProps = {
  message?: string
  onRetry?: () => void
  retryLabel?: string
}

export function NotificationErrorState({
  message = 'Could not load notifications.',
  onRetry,
  retryLabel = 'Try again',
}: NotificationErrorStateProps) {
  return (
    <div className="space-y-3 px-4 py-6 text-center" role="alert">
      <Text as="p" variant="muted" className="text-sm">
        {message}
      </Text>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}
