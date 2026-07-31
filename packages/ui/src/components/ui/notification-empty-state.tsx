import { Text } from './text'

export type NotificationEmptyStateProps = {
  title?: string
  description?: string
}

export function NotificationEmptyState({
  title = 'No notifications yet.',
  description = 'Updates about campaigns, messages, and characters will appear here.',
}: NotificationEmptyStateProps) {
  return (
    <div className="px-4 py-8 text-center">
      <Text as="p" className="text-sm font-body-emphasis text-foreground">
        {title}
      </Text>
      <Text as="p" variant="muted" className="mt-1 text-sm">
        {description}
      </Text>
    </div>
  )
}
