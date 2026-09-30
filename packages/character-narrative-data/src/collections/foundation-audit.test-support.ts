import type {
  NarrativeCollection,
  NarrativeFragment,
  NarrativeFragmentCondition,
  NarrativeSlot,
  NarrativeTheme,
} from '@rpg/contracts/character-narrative'
import { NARRATIVE_SLOTS, NARRATIVE_THEMES } from '@rpg/contracts/character-narrative'
import { ALIGNMENTS } from '@rpg/contracts'

type NarrativeAlignment = (typeof ALIGNMENTS)[number]

export const ALIGNMENT_SENSITIVE_SLOTS = [
  'ideals',
  'flaws',
  'choice',
  'motivation',
] as const satisfies readonly NarrativeSlot[]

export type AlignmentSensitiveSlot = (typeof ALIGNMENT_SENSITIVE_SLOTS)[number]

export const LINTABLE_GENERIC_PHRASES = [
  'person i am becoming',
  'reconsider what i want',
  'reconsider what i wanted',
  'what matters to me',
  'what mattered to me',
  'there was more to learn',
  'how much i still had to learn',
  'how much i had yet to learn',
  'gave me a new perspective',
] as const

export const LINTABLE_RETROSPECTIVE_PHRASES = [
  'i learned that',
  'this taught me',
  'taught me to',
  'i believe ',
  'i know that',
  'which made me',
  'made me wary of',
  'proves its strength by',
  'without claiming',
] as const

export const LINTABLE_PLACEHOLDER_PHRASES = [
  'someone made a costly promise',
  'something they valued',
  'a threatened place',
  'allies and resources',
  'my training as a {{class.name}}',
  'my being {{species.name}}',
] as const

export type HookShape = 'direct' | 'pressure' | 'tension'

const tensionPattern =
  /\b(although|but|despite|even (?:if|though|when)|however|while|yet)\b|;\s*(?:I|i)\s+(?:still|also)\b/
const pressurePattern =
  /\b(answer when|cannot ignore|cost|debt|fear|must|owe|promise|resent|tempt|trouble|until I|whenever)\b/i

export function inferHookShape(fragment: NarrativeFragment): HookShape {
  if (tensionPattern.test(fragment.text)) return 'tension'
  if (fragment.slot === 'bonds' || fragment.slot === 'flaws' || pressurePattern.test(fragment.text))
    return 'pressure'
  return 'direct'
}

function countBy<T extends string>(values: readonly T[]): Record<T, number> {
  return Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>
}

export function isFragmentEligibleForAlignment(
  fragment: NarrativeFragment,
  alignment: NarrativeAlignment,
): boolean {
  return !fragment.alignmentIds || fragment.alignmentIds.includes(alignment)
}

/** Generic plus fragments explicitly tagged for the alignment. */
export function buildEligibleByAlignment(collection: NarrativeCollection) {
  return Object.fromEntries(
    NARRATIVE_SLOTS.map((slot) => [
      slot,
      Object.fromEntries(
        ALIGNMENTS.map((alignment) => [
          alignment,
          collection.fragments.filter(
            (fragment) =>
              fragment.slot === slot && isFragmentEligibleForAlignment(fragment, alignment),
          ).length,
        ]),
      ),
    ]),
  ) as Record<NarrativeSlot, Record<NarrativeAlignment, number>>
}

/** Only fragments whose alignmentIds include the alignment. */
export function buildExplicitAlignmentCoverage(collection: NarrativeCollection) {
  return Object.fromEntries(
    NARRATIVE_SLOTS.map((slot) => [
      slot,
      Object.fromEntries(
        ALIGNMENTS.map((alignment) => [
          alignment,
          collection.fragments.filter(
            (fragment) =>
              fragment.slot === slot && fragment.alignmentIds?.includes(alignment) === true,
          ).length,
        ]),
      ),
    ]),
  ) as Record<NarrativeSlot, Record<NarrativeAlignment, number>>
}

export function buildFoundationInventory(collection: NarrativeCollection) {
  const slotTheme = Object.fromEntries(
    NARRATIVE_SLOTS.map((slot) => [slot, countBy(NARRATIVE_THEMES)]),
  ) as Record<NarrativeSlot, Record<NarrativeTheme, number>>
  const conditions: Partial<Record<NarrativeFragmentCondition, number>> = {}
  const hookShapes = { direct: 0, pressure: 0, tension: 0 } satisfies Record<HookShape, number>

  for (const fragment of collection.fragments) {
    for (const theme of fragment.themeIds) slotTheme[fragment.slot][theme]++
    for (const condition of fragment.conditions)
      conditions[condition] = (conditions[condition] ?? 0) + 1
    hookShapes[inferHookShape(fragment)]++
  }

  return {
    total: collection.fragments.length,
    bySlot: Object.fromEntries(
      NARRATIVE_SLOTS.map((slot) => [
        slot,
        collection.fragments.filter((fragment) => fragment.slot === slot).length,
      ]),
    ) as Record<NarrativeSlot, number>,
    slotTheme,
    eligibleByAlignment: buildEligibleByAlignment(collection),
    explicitAlignmentCoverage: buildExplicitAlignmentCoverage(collection),
    conditions,
    hookShapes,
  }
}

function normalizedWords(text: string): string[] {
  return text
    .replace(/\{\{[^{}]+\}\}/g, 'reference')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function ngrams(words: string[], size: number): Set<string> {
  const values = new Set<string>()
  for (let index = 0; index <= words.length - size; index++) {
    values.add(words.slice(index, index + size).join(' '))
  }
  return values
}

export interface FragmentOverlap {
  firstId: string
  secondId: string
  score: number
}

export function findHighTextOverlap(
  fragments: NarrativeFragment[],
  threshold = 0.72,
): FragmentOverlap[] {
  const normalized = fragments.map((fragment) => ({
    id: fragment.id,
    grams: ngrams(normalizedWords(fragment.text), 4),
  }))
  const overlaps: FragmentOverlap[] = []

  for (let firstIndex = 0; firstIndex < normalized.length; firstIndex++) {
    const first = normalized[firstIndex]!
    if (first.grams.size < 2) continue
    for (let secondIndex = firstIndex + 1; secondIndex < normalized.length; secondIndex++) {
      const second = normalized[secondIndex]!
      if (second.grams.size < 2) continue
      const shared = [...first.grams].filter((gram) => second.grams.has(gram)).length
      const score = (2 * shared) / (first.grams.size + second.grams.size)
      if (score >= threshold) overlaps.push({ firstId: first.id, secondId: second.id, score })
    }
  }

  return overlaps.sort((a, b) => b.score - a.score)
}

export function findRepeatedOpenings(
  fragments: NarrativeFragment[],
  wordCount = 4,
): Array<{ opening: string; fragmentIds: string[] }> {
  const groups = new Map<string, string[]>()
  for (const fragment of fragments) {
    const words = normalizedWords(fragment.text)
    if (words.length < wordCount) continue
    const opening = words.slice(0, wordCount).join(' ')
    groups.set(opening, [...(groups.get(opening) ?? []), fragment.id])
  }
  return [...groups.entries()]
    .filter(([, fragmentIds]) => fragmentIds.length > 2)
    .map(([opening, fragmentIds]) => ({ opening, fragmentIds }))
    .sort((a, b) => b.fragmentIds.length - a.fragmentIds.length)
}
