import {
  isFieldOptionGroup,
  type FieldOption,
  type SelectFieldOptionListItem,
} from '../../form/field-config'
import { cn } from '../../lib/utils'
import { fieldWidthVariants, type FieldWidth } from './field-control.variants'

import type {
  InlineSentenceBelowChips,
  InlineSentenceBoundControl,
  InlineSentenceNumberSegment,
  InlineSentenceSegment,
  InlineSentenceSelectSegment,
} from './inline-sentence-field.types'

export function isInlineSentenceBoundSegment(
  segment: InlineSentenceSegment,
): segment is InlineSentenceNumberSegment | InlineSentenceSelectSegment {
  return segment.kind === 'number' || segment.kind === 'select'
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
    if (!isInlineSentenceBoundSegment(segment) || !segment.visibility) continue
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
    if (!isInlineSentenceBoundSegment(segment)) return true
    if (!segment.visibility) return true
    return segment.visibility.visibleWhen(watched)
  })
}

/** Bound RHF paths declared by inline sentence segments and optional below chips. */
export function inlineSentenceBoundNames(
  segments: readonly InlineSentenceSegment[],
  below?: InlineSentenceBelowChips,
): string[] {
  const names = segments.flatMap((segment) =>
    isInlineSentenceBoundSegment(segment) ? [segment.name] : [],
  )
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

export function indexInlineSentenceControls(
  controls: readonly InlineSentenceBoundControl[],
): Map<string, InlineSentenceBoundControl> {
  return new Map(controls.map((control) => [control.name, control]))
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
