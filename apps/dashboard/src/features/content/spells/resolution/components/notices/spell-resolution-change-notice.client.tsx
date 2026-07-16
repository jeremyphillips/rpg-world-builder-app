'use client'

import { Text } from '@rpg/ui'

import { useResolutionEditorContext } from '../../hooks/use-resolution-change-confirm.client'

/** Live status notice for post-confirm resolution changes. */
export function SpellResolutionChangeNotice() {
  const { notice, clearNotice } = useResolutionEditorContext()

  if (!notice) return null

  return (
    <Text
      as="p"
      variant="muted"
      className="text-sm"
      role="status"
      aria-live="polite"
      onClick={clearNotice}
    >
      {notice.message}
    </Text>
  )
}
