import { Spinner, Text } from '@rpg/ui'

type ContentDetailResolverProps<T extends { id: string }> = {
  isPending: boolean
  isError: boolean
  items: T[]
  itemId: string
  loadErrorLabel: string
  notFoundLabel: string
  children: (item: T) => React.ReactNode
}

/**
 * Handles the loading/error/not-found/ready pattern shared by every content
 * detail route shell. Pass a render prop for the ready state (typically
 * `*DetailContent`).
 */
export function ContentDetailResolver<T extends { id: string }>({
  isPending,
  isError,
  items,
  itemId,
  loadErrorLabel,
  notFoundLabel,
  children,
}: ContentDetailResolverProps<T>) {
  if (isPending) {
    return <Spinner />
  }

  if (isError) {
    return (
      <Text variant="destructive" role="alert">
        {loadErrorLabel}
      </Text>
    )
  }

  const item = items.find((entry) => entry.id === itemId)

  if (!item) {
    return (
      <Text variant="destructive" role="alert">
        {notFoundLabel}
      </Text>
    )
  }

  return children(item)
}
