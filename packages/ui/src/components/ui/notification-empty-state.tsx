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
      <Text as="p" variant="body-compact" className="font-body-emphasis">
        {title}
      </Text>
      <Text as="p" variant="supporting" className="mt-1">
        {description}
      </Text>
    </div>
  )
}
