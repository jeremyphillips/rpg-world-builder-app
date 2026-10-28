export type CreatureArmorSlot = 'body-armor' | 'shield'

/** Body armor and shields occupy one monster equipment slot. Other items do not. */
export function resolveCreatureArmorSlot(
  item: { kind: string; category?: string } | undefined,
): CreatureArmorSlot | undefined {
  if (!item || item.kind !== 'armor') return undefined
  return item.category === 'shields' ? 'shield' : 'body-armor'
}
