/** Game-facing spell slot level label (1 → 1st, 2 → 2nd, …). */
export function formatSpellSlotLevelLabel(slotLevel: number): string {
  if (slotLevel <= 0) return '—'
  const suffix =
    slotLevel % 10 === 1 && slotLevel !== 11
      ? 'st'
      : slotLevel % 10 === 2 && slotLevel !== 12
        ? 'nd'
        : slotLevel % 10 === 3 && slotLevel !== 13
          ? 'rd'
          : 'th'
  return `${slotLevel}${suffix}`
}
