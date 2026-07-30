import { Text } from './text'

export type NotificationLoadingStateProps = {
  label?: string
}

export function NotificationLoadingState({
  label = 'Loading notifications…',
}: NotificationLoadingStateProps) {
  return (
    <div className="px-4 py-8 text-center" aria-busy="true">
      <Text as="p" variant="muted" className="text-sm">
        {label}
      </Text>
    </div>
  )
}
