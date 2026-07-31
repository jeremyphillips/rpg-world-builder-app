import { Text } from '@rpg/ui'

export function MessagesDirectListStatus({
  isPending,
  isError,
}: {
  isPending: boolean
  isError: boolean
}) {
  if (isPending) {
    return <Text variant="muted">Loading conversations…</Text>
  }

  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        Could not load conversations.
      </Text>
    )
  }

  return null
}
