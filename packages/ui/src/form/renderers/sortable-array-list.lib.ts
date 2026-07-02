import type { DragEndEvent } from '@dnd-kit/core'

/** Resolves drag-end indices for array field rows keyed by RHF field id. */
export function resolveSortableArrayMove(
  items: ReadonlyArray<{ id: string }>,
  event: DragEndEvent,
): { from: number; to: number } | null {
  const { active, over } = event
  if (!over || active.id === over.id) return null

  const from = items.findIndex((item) => item.id === active.id)
  const to = items.findIndex((item) => item.id === over.id)
  if (from < 0 || to < 0 || from === to) return null

  return { from, to }
}
