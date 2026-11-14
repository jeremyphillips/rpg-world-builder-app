import {
  SPELL_COMPONENT_ENTRIES,
  SPELL_COMPONENT_IDS,
  type SpellComponentId,
} from '../../vocab/spell/components'

/** Canonical omission set for “requiring no spell components”. */
export const ALL_OMITTED_SPELL_COMPONENTS: readonly SpellComponentId[] = [
  'verbal',
  'somatic',
  'material',
]

export function normalizeOmittedSpellComponents(
  omitted: readonly SpellComponentId[] | undefined,
): SpellComponentId[] {
  if (!omitted?.length) return []
  const selected = new Set(omitted)
  return SPELL_COMPONENT_IDS.filter((id) => selected.has(id))
}

export function omittedSpellComponentsEqual(
  left: readonly SpellComponentId[] | undefined,
  right: readonly SpellComponentId[] | undefined,
): boolean {
  const a = normalizeOmittedSpellComponents(left)
  const b = normalizeOmittedSpellComponents(right)
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function listPhrase(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? ''
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`
}

/** Stat-block clause for omitted spell components (no leading punctuation). */
export function formatMonsterSpellComponentOmissionClause(
  omitted: readonly SpellComponentId[] | undefined,
): string {
  const normalized = normalizeOmittedSpellComponents(omitted)
  if (normalized.length === 0) return ''
  if (omittedSpellComponentsEqual(normalized, ALL_OMITTED_SPELL_COMPONENTS)) {
    return 'requiring no spell components'
  }
  const labels = normalized.map((id) => SPELL_COMPONENT_ENTRIES[id].label)
  return `requiring no ${listPhrase(labels)} components`
}

export function joinMonsterSpellCastingIntroSegments(...segments: string[]): string {
  return segments.filter(Boolean).join(' and ')
}
