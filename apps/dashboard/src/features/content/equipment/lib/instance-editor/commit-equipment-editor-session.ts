import type { EquipmentInstance } from '@rpg/contracts'
import { splitEquipmentEntry } from '@rpg/contracts'

import { stripMagicPropertiesOnDone } from './equipment-instance-editor.lib'
import type { EquipmentEditorSession } from './equipment-editor-types'

function entriesEqual(a: EquipmentInstance, b: EquipmentInstance): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Applies an editor session to the current equipment list. When the source entry
 * was removed while the drawer was open, returns the list unchanged (no stale writes).
 */
export function commitEquipmentEditorSession<T extends EquipmentInstance & { entryId: string }>(
  entries: readonly T[],
  session: EquipmentEditorSession,
  newEntryId: () => string = () => crypto.randomUUID(),
): T[] {
  const sourceIndex = entries.findIndex((entry) => entry.entryId === session.sourceEntryId)
  if (sourceIndex < 0) return [...entries]

  const source = entries[sourceIndex]!
  if (entriesEqual(source, session.draft)) return [...entries]

  let draft = stripMagicPropertiesOnDone({ ...session.draft })
  if (session.scope === 'one') {
    draft = { ...draft, quantity: 1 }
    if (entriesEqual(source, draft)) return [...entries]
    return splitEquipmentEntry(entries, session.sourceEntryId, {
      newEntryId: newEntryId(),
      patch: draft,
    })
  }

  const next = [...entries]
  next[sourceIndex] = { ...source, ...draft, entryId: source.entryId }
  return next
}
