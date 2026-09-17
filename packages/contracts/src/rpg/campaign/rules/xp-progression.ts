import { z } from 'zod'

import { defineMessage } from '../../../validation/define-message'
import { absoluteLevelSchema } from '../../primitives/level'
import { formatGroupedNumber } from '../../primitives/number-format'
import type { XpProgressionEntry } from '../../primitives/xp-progression'
import { xpRequiredForLevel } from '../../primitives/xp-progression'

// ---------------------------------------------------------------------------
// XP thresholds — campaign rules overrides for character level advancement.
// SRD defaults ship from @rpg/catalog; campaigns patch sparse explicit levels.
// ---------------------------------------------------------------------------

export const xpThresholdOverrideEntrySchema = z.object({
  level: absoluteLevelSchema.min(2),
  xpRequired: z.number().int().min(0),
})

export type XpThresholdOverrideEntry = z.infer<typeof xpThresholdOverrideEntrySchema>

export const xpThresholdOverrideEntriesSchema = z
  .array(xpThresholdOverrideEntrySchema)
  .superRefine((entries, ctx) => {
    const seen = new Set<number>()
    entries.forEach((entry, index) => {
      if (seen.has(entry.level)) {
        ctx.addIssue({
          code: 'custom',
          message: xpThresholdsValidationMessages.duplicateLevel({ level: entry.level }),
          path: [index, 'level'],
        })
      }
      seen.add(entry.level)
    })
  })

export type XpThresholdOverrideEntries = z.infer<typeof xpThresholdOverrideEntriesSchema>

export const xpThresholdsPatchSchema = z
  .object({
    entries: xpThresholdOverrideEntriesSchema,
  })
  .strict()

export type XpThresholdsPatch = z.infer<typeof xpThresholdsPatchSchema>

/** XP threshold validation messages (tier 2 domain catalog). */
export const xpThresholdsValidationMessages = {
  duplicateLevel: defineMessage<{ level: number }>(
    'validation.xpThresholds.duplicateLevel',
    ({ level }) => `Level ${level} appears more than once in XP threshold overrides.`,
  ),
  levelOneNotOverridable: defineMessage(
    'validation.xpThresholds.levelOneNotOverridable',
    () => 'Level 1 XP cannot be overridden.',
  ),
  increasingXp: defineMessage(
    'validation.xpThresholds.increasingXp',
    () => 'XP required must increase with each level.',
  ),
  levelOneZeroXp: defineMessage(
    'validation.xpThresholds.levelOneZeroXp',
    () => 'Level 1 must require 0 XP.',
  ),
}

export type XpThresholdProvenance = 'system' | 'override' | 'derived'

export type EffectiveXpThresholdEntry = XpProgressionEntry & {
  provenance: XpThresholdProvenance
}

export type ResolveEffectiveXpProgressionInput = {
  systemEntries: readonly XpProgressionEntry[]
  overrides?: readonly XpThresholdOverrideEntry[]
  effectiveMaxLevel: number
}

function overrideMap(
  overrides: readonly XpThresholdOverrideEntry[] | undefined,
): Map<number, number> {
  const map = new Map<number, number>()
  for (const entry of overrides ?? []) {
    map.set(entry.level, entry.xpRequired)
  }
  return map
}

/** Resolves effective XP thresholds for active levels, deriving missing extended values. */
export function resolveEffectiveXpProgression(
  input: ResolveEffectiveXpProgressionInput,
): EffectiveXpThresholdEntry[] {
  const overrides = overrideMap(input.overrides)
  const result: EffectiveXpThresholdEntry[] = []

  for (let level = 1; level <= input.effectiveMaxLevel; level += 1) {
    const overrideValue = overrides.get(level)
    if (overrideValue !== undefined) {
      result.push({ level, xpRequired: overrideValue, provenance: 'override' })
      continue
    }

    const systemValue = xpRequiredForLevel({ entries: [...input.systemEntries] }, level)
    if (systemValue !== undefined) {
      result.push({ level, xpRequired: systemValue, provenance: 'system' })
      continue
    }

    const previous = result[result.length - 1]
    const previousPrevious = result[result.length - 2]
    const increment =
      previous !== undefined && previousPrevious !== undefined
        ? previous.xpRequired - previousPrevious.xpRequired
        : 0
    const derivedXp = (previous?.xpRequired ?? 0) + increment
    result.push({ level, xpRequired: derivedXp, provenance: 'derived' })
  }

  return result
}

export type XpThresholdsSummaryStatus = 'system_default' | 'derived' | 'campaign_override'

export type XpThresholdsSummary = {
  levelCount: number
  status: XpThresholdsSummaryStatus
  derivedCount: number
  label: string
}

export function formatXpThresholdsSummary(summary: Omit<XpThresholdsSummary, 'label'>): string {
  const levelPart = `${summary.levelCount} level${summary.levelCount === 1 ? '' : 's'}`
  switch (summary.status) {
    case 'system_default':
      return `${levelPart} · System default`
    case 'derived':
      return `${levelPart} · ${summary.derivedCount} threshold${summary.derivedCount === 1 ? '' : 's'} derived`
    case 'campaign_override':
      return `${levelPart} · Campaign override`
  }
}

export function resolveXpThresholdsSummary(
  input: ResolveEffectiveXpProgressionInput,
): XpThresholdsSummary {
  const effective = resolveEffectiveXpProgression(input)
  const derivedCount = effective.filter((entry) => entry.provenance === 'derived').length
  const hasActiveOverride = effective.some((entry) => entry.provenance === 'override')

  let status: XpThresholdsSummaryStatus
  if (derivedCount > 0) {
    status = 'derived'
  } else if (hasActiveOverride) {
    status = 'campaign_override'
  } else {
    status = 'system_default'
  }

  const summary = {
    levelCount: input.effectiveMaxLevel,
    status,
    derivedCount,
  }

  return {
    ...summary,
    label: formatXpThresholdsSummary(summary),
  }
}

/** Validates the effective active XP table — domain boundary, not generic table contracts. */
export function refineEffectiveXpProgression(
  input: ResolveEffectiveXpProgressionInput,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const effective = resolveEffectiveXpProgression(input)

  effective.forEach((entry, index) => {
    if (index === 0 && entry.level === 1 && entry.xpRequired !== 0) {
      ctx.addIssue({
        code: 'custom',
        message: xpThresholdsValidationMessages.levelOneZeroXp(),
        path: [...pathPrefix, index, 'xpRequired'],
      })
    }

    const previous = effective[index - 1]
    if (previous !== undefined && entry.xpRequired <= previous.xpRequired) {
      ctx.addIssue({
        code: 'custom',
        message: xpThresholdsValidationMessages.increasingXp(),
        path: [...pathPrefix, index, 'xpRequired'],
      })
    }
  })
}

function systemValueForLevel(
  systemEntries: readonly XpProgressionEntry[],
  level: number,
): number | undefined {
  return xpRequiredForLevel({ entries: [...systemEntries] }, level)
}

/** Drops overrides that match the system seed for that level. Keeps dormant overrides above active max. */
export function normalizeXpThresholdOverrides(
  overrides: readonly XpThresholdOverrideEntry[],
  systemEntries: readonly XpProgressionEntry[],
): XpThresholdOverrideEntry[] {
  return overrides.filter((entry) => {
    const systemValue = systemValueForLevel(systemEntries, entry.level)
    if (systemValue === undefined) return true
    return entry.xpRequired !== systemValue
  })
}

/** Returns sparse patch when overrides differ from empty; undefined when no customization. */
export function computeXpThresholdsSparsePatch(
  overrides: readonly XpThresholdOverrideEntry[],
  systemEntries: readonly XpProgressionEntry[],
): XpThresholdsPatch | undefined {
  const normalized = normalizeXpThresholdOverrides(overrides, systemEntries)
  if (normalized.length === 0) return undefined
  return { entries: normalized }
}

export function mergeXpThresholdsPatch(
  _existing: XpThresholdsPatch | undefined,
  input: XpThresholdsPatch,
): XpThresholdsPatch {
  return { entries: input.entries }
}

export function resolveXpThresholdOverrides(
  patch: XpThresholdsPatch | undefined,
): XpThresholdOverrideEntry[] {
  return patch?.entries ?? []
}

export function formatXpThresholdValue(xpRequired: number): string {
  return formatGroupedNumber(xpRequired)
}

export type XpThresholdDerivedSegment = {
  startLevel: number
  endLevel: number
  increment: number
  extendedTierName?: string
}

export type XpThresholdDerivedPresentation = {
  derivedCount: number
  segments: XpThresholdDerivedSegment[]
}

export type XpThresholdTierContext = {
  extendedStartsAt?: number
  extendedTierName?: string
}

export type XpThresholdDerivedCallout = {
  title: string
  description: string
}

const XP_DERIVED_CALLOUT_CLOSING =
  'Derived values recalculate when the progression changes. Edit a derived value to make it explicit.'

function effectiveIncrementAtLevel(
  effective: readonly EffectiveXpThresholdEntry[],
  level: number,
): number {
  const index = effective.findIndex((entry) => entry.level === level)
  if (index <= 0) return 0
  return effective[index]!.xpRequired - effective[index - 1]!.xpRequired
}

function formatDerivedSegmentLevelRange(startLevel: number, endLevel: number): string {
  return startLevel === endLevel ? `Level ${startLevel}` : `Levels ${startLevel}–${endLevel}`
}

function resolveExtendedTierNameForLevel(
  level: number,
  tier?: XpThresholdTierContext,
): string | undefined {
  const trimmed = tier?.extendedTierName?.trim()
  if (!trimmed || tier?.extendedStartsAt === undefined || level < tier.extendedStartsAt) {
    return undefined
  }
  return trimmed
}

function groupDerivedSegments(
  effective: readonly EffectiveXpThresholdEntry[],
  tier?: XpThresholdTierContext,
): XpThresholdDerivedSegment[] {
  const derivedLevels = effective.filter((entry) => entry.provenance === 'derived')
  if (derivedLevels.length === 0) return []

  const segments: XpThresholdDerivedSegment[] = []
  let currentStart = derivedLevels[0]!.level
  let currentEnd = currentStart

  for (let index = 1; index < derivedLevels.length; index += 1) {
    const level = derivedLevels[index]!.level
    if (level === currentEnd + 1) {
      currentEnd = level
      continue
    }

    segments.push({
      startLevel: currentStart,
      endLevel: currentEnd,
      increment: effectiveIncrementAtLevel(effective, currentStart),
      extendedTierName: resolveExtendedTierNameForLevel(currentStart, tier),
    })
    currentStart = level
    currentEnd = level
  }

  segments.push({
    startLevel: currentStart,
    endLevel: currentEnd,
    increment: effectiveIncrementAtLevel(effective, currentStart),
    extendedTierName: resolveExtendedTierNameForLevel(currentStart, tier),
  })

  return segments
}

/** Groups active derived thresholds into contiguous segments with effective increments. */
export function resolveXpThresholdDerivedPresentation(
  input: ResolveEffectiveXpProgressionInput,
  tier?: XpThresholdTierContext,
): XpThresholdDerivedPresentation | undefined {
  const effective = resolveEffectiveXpProgression(input)
  const segments = groupDerivedSegments(effective, tier)
  if (segments.length === 0) return undefined

  return {
    derivedCount: effective.filter((entry) => entry.provenance === 'derived').length,
    segments,
  }
}

function formatDerivedSegmentSentence(segment: XpThresholdDerivedSegment): string {
  const range = formatDerivedSegmentLevelRange(segment.startLevel, segment.endLevel)
  const incrementLabel = `${formatGroupedNumber(segment.increment)} XP per level`

  if (segment.extendedTierName) {
    return `${range} in ${segment.extendedTierName} continue the latest XP increase of ${incrementLabel}.`
  }

  return `${range} continue the latest XP increase of ${incrementLabel}.`
}

/** Formats derived-threshold callout copy for the table builder values section. */
export function formatXpThresholdDerivedCallout(
  presentation: XpThresholdDerivedPresentation,
): XpThresholdDerivedCallout {
  const { derivedCount, segments } = presentation
  const title = `${derivedCount} threshold${derivedCount === 1 ? '' : 's'} are derived`
  const segmentCopy = segments.map(formatDerivedSegmentSentence).join(' ')
  return {
    title,
    description: `${segmentCopy} ${XP_DERIVED_CALLOUT_CLOSING}`,
  }
}
