import {
  isFieldOptionGroup,
  type FieldOption,
  type SelectFieldOptionListItem,
} from '../../form/field-config'
import { cn } from '../../lib/utils'
import { fieldWidthVariants, type FieldWidth } from './field-control.variants'

import { joinedPairBoundNames } from './joined-pair-field.lib'
import type {
  InlineSentenceBelowChips,
  InlineSentenceBoundControl,
  InlineSentenceJoinedPairSegment,
  InlineSentenceNumberSegment,
  InlineSentenceSegment,
  InlineSentenceSelectSegment,
} from './inline-sentence-field.types'

export function isInlineSentenceBoundSegment(
  segment: InlineSentenceSegment,
): segment is InlineSentenceNumberSegment | InlineSentenceSelectSegment {
  return segment.kind === 'number' || segment.kind === 'select'
}

export function isInlineSentenceJoinedPairSegment(
  segment: InlineSentenceSegment,
): segment is InlineSentenceJoinedPairSegment {
  return segment.kind === 'joinedPair'
}

/** Stable key linking a joined-pair segment to its bound control. */
export function inlineSentenceJoinedPairSegmentKey(
  fieldName: string,
  segmentIndex: number,
): string {
  return `${fieldName}-joined-${segmentIndex}`
}

/** Max distinct bound paths per inline sentence (one controller each). */
export const MAX_INLINE_SENTENCE_BOUND_CONTROLLERS = 8

/** Distinct bound RHF paths for controller wiring (duplicate names share one controller). */
export function inlineSentenceUniqueBoundNames(
  segments: readonly InlineSentenceSegment[],
  below?: InlineSentenceBelowChips,
): string[] {
  return [...new Set(inlineSentenceBoundNames(segments, below))]
}

/** Collects `dependsOn` paths from bound segments that declare visibility. */
export function inlineSentenceSegmentVisibilityDeps(
  segments: readonly InlineSentenceSegment[],
): string[] {
  const deps = new Set<string>()
  for (const segment of segments) {
    if (segment.kind === 'text' || !segment.visibility) continue
    for (const dep of segment.visibility.dependsOn) deps.add(dep)
  }
  return [...deps]
}

/** Filters bound segments by optional per-segment visibility; text segments always remain. */
export function filterVisibleInlineSentenceSegments(
  segments: readonly InlineSentenceSegment[],
  watched: Record<string, unknown>,
): InlineSentenceSegment[] {
  return segments.filter((segment) => {
    if (segment.kind === 'text') return true
    if (!segment.visibility) return true
    return segment.visibility.visibleWhen(watched)
  })
}

/** Bound RHF paths declared by inline sentence segments and optional below chips. */
export function inlineSentenceBoundNames(
  segments: readonly InlineSentenceSegment[],
  below?: InlineSentenceBelowChips,
): string[] {
  const names = segments.flatMap((segment) => {
    if (isInlineSentenceBoundSegment(segment)) return [segment.name]
    if (isInlineSentenceJoinedPairSegment(segment)) {
      return joinedPairBoundNames({ start: segment.start, end: segment.end })
    }
    return []
  })
  if (below) names.push(below.name)
  return names
}

/** Primary path used for field-order and array default seeding. */
export function inlineSentencePrimaryName(
  fieldName: string,
  segments: readonly InlineSentenceSegment[],
  below?: InlineSentenceBelowChips,
): string {
  if (below) return below.name
  const firstBound = segments.find(isInlineSentenceBoundSegment)
  return firstBound?.name ?? fieldName
}

export function flattenInlineSentenceSelectOptions(
  options: SelectFieldOptionListItem[],
): FieldOption[] {
  return options.flatMap((item) => (isFieldOptionGroup(item) ? item.options : [item]))
}

/** Coerces stored select values (e.g. numeric die faces) to string for Radix Select. */
export function coerceInlineSentenceSelectValue(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  return String(raw)
}

/** True when every option value is a base-10 integer string (die faces, levels, etc.). */
export function inlineSentenceSelectOptionsAreNumeric(
  options: SelectFieldOptionListItem[],
): boolean {
  const flat = flattenInlineSentenceSelectOptions(options)
  return flat.length > 0 && flat.every((option) => /^\d+$/.test(option.value))
}

export function resolveInlineSentenceSelectChange(
  next: string,
  options: SelectFieldOptionListItem[],
): string | number {
  if (!inlineSentenceSelectOptionsAreNumeric(options)) return next
  return Number(next)
}

export function indexInlineSentenceControls(
  controls: readonly InlineSentenceBoundControl[],
): Map<string, InlineSentenceBoundControl> {
  const entries: Array<[string, InlineSentenceBoundControl]> = []
  for (const control of controls) {
    if (control.kind === 'joinedPair') {
      entries.push([control.segmentKey, control])
      continue
    }
    entries.push([control.name, control])
  }
  return new Map(entries)
}

const INLINE_SELECT_INTRINSIC_WIDTH_CLASSES = {
  xs: 'w-16',
  sm: 'w-24',
  md: 'w-36',
  lg: 'w-48',
  xl: 'w-64',
  auto: 'w-fit',
} as const satisfies Partial<Record<FieldWidth, string>>

/** Width classes for prose-length inline select triggers (non-digit sizing). */
export function inlineSentenceSelectTriggerWidthClasses(
  width: FieldWidth | undefined,
): string | undefined {
  const resolved = width ?? 'auto'
  return cn(
    fieldWidthVariants({ width: resolved }),
    'shrink-0',
    INLINE_SELECT_INTRINSIC_WIDTH_CLASSES[
      resolved as keyof typeof INLINE_SELECT_INTRINSIC_WIDTH_CLASSES
    ] ?? 'w-fit',
  )
}
