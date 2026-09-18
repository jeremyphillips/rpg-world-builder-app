import { z } from 'zod'

import { defineMessage } from '../../../validation/define-message'
import { absoluteLevelSchema } from '../../primitives/level'
import { formatGroupedNumber } from '../../primitives/number-format'
import type { XpProgressionEntry } from '../../primitives/xp-progression'
import { xpRequiredForLevel } from '../../primitives/xp-progression'
import { xpProgressionValidationMessages } from '../../content/xp-progression'

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
  increasingXp: xpProgressionValidationMessages.increasingXp,
  levelOneZeroXp: xpProgressionValidationMessages.levelOneZeroXp,
  minimumThreshold: defineMessage<{ minimum: number }>(
    'validation.xpThresholds.minimumThreshold',
    ({ minimum }) => `Enter ${formatGroupedNumber(minimum)} or more.`,
  ),
  resolveBlockedLevel: defineMessage<{ level: number }>(
    'validation.xpThresholds.resolveBlockedLevel',
    ({ level }) => `Resolve level ${level} to continue`,
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

export type XpThresholdValidationPolicy = 'standard' | 'extended'

/** True when the catalog has no system seed for this level (extended progression). */
export function isExtendedXpLevel(
  level: number,
  systemEntries: readonly XpProgressionEntry[],
): boolean {
  return systemValueForLevel(systemEntries, level) === undefined
}

export function resolveXpThresholdValidationPolicy(
  level: number,
  systemEntries: readonly XpProgressionEntry[],
): XpThresholdValidationPolicy {
  return isExtendedXpLevel(level, systemEntries) ? 'extended' : 'standard'
}

/** Delta-continued value for extended levels from a valid preceding chain (derivation only). */
export function resolveDerivedMinimumXpThreshold(
  _level: number,
  precedingEffective: readonly EffectiveXpThresholdEntry[],
): number | undefined {
  const previous = precedingEffective[precedingEffective.length - 1]
  if (previous === undefined) return undefined

  const previousPrevious = precedingEffective[precedingEffective.length - 2]
  const increment =
    previousPrevious !== undefined ? previous.xpRequired - previousPrevious.xpRequired : 0
  return previous.xpRequired + increment
}

export type XpThresholdExplicitValidationResult =
  | { valid: true }
  | { valid: false; message: string; minimumXpRequired?: number }

function resolveMinimumXpThreshold(
  precedingEffective: readonly EffectiveXpThresholdEntry[],
): number | undefined {
  const previous = precedingEffective[precedingEffective.length - 1]
  if (previous === undefined) return undefined
  return previous.xpRequired + 1
}

/** Validates that XP strictly increases versus the preceding effective threshold. */
export function validateXpThresholdExplicitValue(input: {
  level: number
  xpRequired: number
  precedingEffective: readonly EffectiveXpThresholdEntry[]
  systemEntries?: readonly XpProgressionEntry[]
}): XpThresholdExplicitValidationResult {
  const minimumXpRequired = resolveMinimumXpThreshold(input.precedingEffective)
  if (minimumXpRequired === undefined) return { valid: true }
  if (input.xpRequired >= minimumXpRequired) return { valid: true }

  return {
    valid: false,
    message: xpThresholdsValidationMessages.minimumThreshold({ minimum: minimumXpRequired }),
    minimumXpRequired,
  }
}

export type XpThresholdRestoreAction = 'system' | 'derived'

export const XP_THRESHOLD_RESTORE_ACTION_LABELS = {
  system: 'Restore system value',
  derived: 'Use derived value',
} as const

/** Whether a filled draft cell is an explicit override eligible for restore. */
export function resolveXpThresholdRestoreAction(input: {
  level: number
  xpRequired: number
  systemEntries: readonly XpProgressionEntry[]
}): XpThresholdRestoreAction | undefined {
  const systemValue = systemValueForLevel(input.systemEntries, input.level)
  if (systemValue !== undefined) {
    return input.xpRequired !== systemValue ? 'system' : undefined
  }
  return 'derived'
}

/** Highest level defined in the system catalog seed. */
export function resolveMaxSystemLevel(systemEntries: readonly XpProgressionEntry[]): number {
  return systemEntries.reduce((max, entry) => Math.max(max, entry.level), 1)
}

export type XpThresholdEditorRowState = {
  level: number
  provenance: XpThresholdProvenance
  readOnly: boolean
  minimumXpRequired?: number
  progressionError?: string
  blockedByLevel?: number
  blockedHint?: string
  /** Placeholder for blank cells — system, derived, or em dash when blocked. */
  displayPlaceholder?: string
  restoreAction?: XpThresholdRestoreAction
}

export type ResolveXpThresholdEditorStateInput = ResolveEffectiveXpProgressionInput & {
  /** Explicit draft values for filled cells only — blank levels are omitted. */
  explicitDraftValuesByLevel?: ReadonlyMap<number, number> | Record<number, number>
  /** When set, invalid explicit values apply only at these levels (e.g. blurred cells). */
  committedDraftLevels?: ReadonlySet<number>
}

function explicitDraftValueForLevel(
  explicitDraftValuesByLevel: ResolveXpThresholdEditorStateInput['explicitDraftValuesByLevel'],
  level: number,
): number | undefined {
  if (explicitDraftValuesByLevel === undefined) return undefined
  if (explicitDraftValuesByLevel instanceof Map) {
    return explicitDraftValuesByLevel.get(level)
  }
  return Object.prototype.hasOwnProperty.call(explicitDraftValuesByLevel, level)
    ? (explicitDraftValuesByLevel as Record<number, number>)[level]
    : undefined
}

function deriveEffectiveEntry(
  level: number,
  precedingEffective: readonly EffectiveXpThresholdEntry[],
): EffectiveXpThresholdEntry {
  const previous = precedingEffective[precedingEffective.length - 1]
  const previousPrevious = precedingEffective[precedingEffective.length - 2]
  const increment =
    previous !== undefined && previousPrevious !== undefined
      ? previous.xpRequired - previousPrevious.xpRequired
      : 0
  const derivedXp = (previous?.xpRequired ?? 0) + increment
  return { level, xpRequired: derivedXp, provenance: 'derived' }
}

function isCommittedDraftLevel(
  level: number,
  committedDraftLevels: ReadonlySet<number> | undefined,
): boolean {
  return committedDraftLevels === undefined || committedDraftLevels.has(level)
}

type XpThresholdEditorResolutionContext = {
  systemEntries: readonly XpProgressionEntry[]
  overrides: ReadonlyMap<number, number>
  explicitDraftValuesByLevel: ResolveXpThresholdEditorStateInput['explicitDraftValuesByLevel']
  committedDraftLevels: ReadonlySet<number> | undefined
}

function buildBlockedXpThresholdEditorRow(
  level: number,
  firstInvalidLevel: number,
  ctx: XpThresholdEditorResolutionContext,
): XpThresholdEditorRowState {
  const explicitDraft = explicitDraftValueForLevel(ctx.explicitDraftValuesByLevel, level)
  return {
    level,
    provenance: ctx.overrides.has(level) || explicitDraft !== undefined ? 'override' : 'derived',
    readOnly: true,
    blockedByLevel: firstInvalidLevel,
    blockedHint:
      level === firstInvalidLevel + 1
        ? xpThresholdsValidationMessages.resolveBlockedLevel({ level: firstInvalidLevel })
        : undefined,
    displayPlaceholder: explicitDraft === undefined ? '—' : undefined,
  }
}

function resolveExplicitDraftEditorRow(
  level: number,
  explicitDraft: number,
  validChain: EffectiveXpThresholdEntry[],
  ctx: XpThresholdEditorResolutionContext,
):
  | { kind: 'invalid'; row: XpThresholdEditorRowState; firstInvalidLevel: number }
  | { kind: 'valid'; row: XpThresholdEditorRowState; entry: EffectiveXpThresholdEntry }
  | { kind: 'uncommitted' } {
  const validation = validateXpThresholdExplicitValue({
    level,
    xpRequired: explicitDraft,
    precedingEffective: validChain,
    systemEntries: ctx.systemEntries,
  })

  if (!validation.valid) {
    if (isCommittedDraftLevel(level, ctx.committedDraftLevels)) {
      return {
        kind: 'invalid',
        row: {
          level,
          provenance: 'override',
          readOnly: false,
          minimumXpRequired: validation.minimumXpRequired,
          progressionError: validation.message,
          restoreAction: resolveXpThresholdRestoreAction({
            level,
            xpRequired: explicitDraft,
            systemEntries: ctx.systemEntries,
          }),
        },
        firstInvalidLevel: level,
      }
    }
    return { kind: 'uncommitted' }
  }

  const restoreAction = resolveXpThresholdRestoreAction({
    level,
    xpRequired: explicitDraft,
    systemEntries: ctx.systemEntries,
  })

  return {
    kind: 'valid',
    row: { level, provenance: 'override', readOnly: false, restoreAction },
    entry: { level, xpRequired: explicitDraft, provenance: 'override' },
  }
}

function buildFallbackInvalidRow(
  level: number,
  provenance: XpThresholdProvenance,
  xpRequired: number,
  validation: Extract<XpThresholdExplicitValidationResult, { valid: false }>,
): XpThresholdEditorRowState {
  return {
    level,
    provenance,
    readOnly: false,
    minimumXpRequired: validation.minimumXpRequired,
    progressionError: validation.message,
    displayPlaceholder: formatXpThresholdValue(xpRequired),
  }
}

function resolveKnownXpThresholdEditorRow(
  level: number,
  validChain: EffectiveXpThresholdEntry[],
  ctx: XpThresholdEditorResolutionContext,
):
  | { kind: 'valid'; row: XpThresholdEditorRowState; entry: EffectiveXpThresholdEntry }
  | { kind: 'invalid-fallback'; row: XpThresholdEditorRowState; firstInvalidLevel: number } {
  const overrideValue = ctx.overrides.get(level)
  if (overrideValue !== undefined) {
    const entry: EffectiveXpThresholdEntry = {
      level,
      xpRequired: overrideValue,
      provenance: 'override',
    }
    const validation = validateXpThresholdExplicitValue({
      level,
      xpRequired: overrideValue,
      precedingEffective: validChain,
    })
    if (!validation.valid) {
      return {
        kind: 'invalid-fallback',
        row: {
          ...buildFallbackInvalidRow(level, 'override', overrideValue, validation),
          restoreAction: resolveXpThresholdRestoreAction({
            level,
            xpRequired: overrideValue,
            systemEntries: ctx.systemEntries,
          }),
        },
        firstInvalidLevel: level,
      }
    }
    return {
      kind: 'valid',
      row: {
        level,
        provenance: 'override',
        readOnly: false,
        restoreAction: resolveXpThresholdRestoreAction({
          level,
          xpRequired: overrideValue,
          systemEntries: ctx.systemEntries,
        }),
      },
      entry,
    }
  }

  const systemValue = systemValueForLevel(ctx.systemEntries, level)
  if (systemValue !== undefined) {
    const entry: EffectiveXpThresholdEntry = {
      level,
      xpRequired: systemValue,
      provenance: 'system',
    }
    const validation = validateXpThresholdExplicitValue({
      level,
      xpRequired: systemValue,
      precedingEffective: validChain,
    })
    if (!validation.valid) {
      return {
        kind: 'invalid-fallback',
        row: buildFallbackInvalidRow(level, 'system', systemValue, validation),
        firstInvalidLevel: level,
      }
    }
    return {
      kind: 'valid',
      row: {
        level,
        provenance: 'system',
        readOnly: false,
        displayPlaceholder: formatXpThresholdValue(systemValue),
      },
      entry,
    }
  }

  const derived = deriveEffectiveEntry(level, validChain)
  const validation = validateXpThresholdExplicitValue({
    level,
    xpRequired: derived.xpRequired,
    precedingEffective: validChain,
  })
  if (!validation.valid) {
    return {
      kind: 'invalid-fallback',
      row: buildFallbackInvalidRow(level, 'derived', derived.xpRequired, validation),
      firstInvalidLevel: level,
    }
  }
  return {
    kind: 'valid',
    row: {
      level,
      provenance: 'derived',
      readOnly: false,
      displayPlaceholder: formatXpThresholdValue(derived.xpRequired),
    },
    entry: derived,
  }
}

/**
 * Resolves per-row editor state for the XP threshold table builder, including
 * validation errors and downstream blocking after the first invalid explicit value.
 */
export function resolveXpThresholdEditorState(
  input: ResolveXpThresholdEditorStateInput,
): XpThresholdEditorRowState[] {
  const { systemEntries, effectiveMaxLevel, explicitDraftValuesByLevel, committedDraftLevels } =
    input
  const ctx: XpThresholdEditorResolutionContext = {
    systemEntries,
    overrides: overrideMap(input.overrides),
    explicitDraftValuesByLevel,
    committedDraftLevels,
  }
  const validChain: EffectiveXpThresholdEntry[] = []
  const rows: XpThresholdEditorRowState[] = []
  let firstInvalidLevel: number | undefined

  for (let level = 1; level <= effectiveMaxLevel; level += 1) {
    if (level === 1) {
      validChain.push({ level: 1, xpRequired: 0, provenance: 'system' })
      rows.push({ level: 1, provenance: 'system', readOnly: true })
      continue
    }

    if (firstInvalidLevel !== undefined && level > firstInvalidLevel) {
      rows.push(buildBlockedXpThresholdEditorRow(level, firstInvalidLevel, ctx))
      continue
    }

    const explicitDraft = explicitDraftValueForLevel(explicitDraftValuesByLevel, level)
    if (explicitDraft !== undefined) {
      const resolved = resolveExplicitDraftEditorRow(level, explicitDraft, validChain, ctx)
      if (resolved.kind === 'invalid') {
        firstInvalidLevel = resolved.firstInvalidLevel
        rows.push(resolved.row)
        continue
      }
      if (resolved.kind === 'valid') {
        validChain.push(resolved.entry)
        rows.push(resolved.row)
        continue
      }
    }

    const known = resolveKnownXpThresholdEditorRow(level, validChain, ctx)
    if (known.kind === 'invalid-fallback') {
      firstInvalidLevel = known.firstInvalidLevel
      rows.push(known.row)
      continue
    }
    validChain.push(known.entry)
    rows.push(known.row)
  }

  return rows
}

export type ExtendedProgressionActionContext = {
  label: 'Set extended progression'
  extendedStartsAt: number
  currentIncrement: number
  anchorLevel: number
  anchorXpRequired: number
  extendedEndLevel: number
}

export type ApplyExtendedXpIncrementInput = {
  systemEntries: readonly XpProgressionEntry[]
  effectiveMaxLevel: number
  explicitDraftValuesByLevel: ReadonlyMap<number, number> | Record<number, number>
  increment: number
}

export type ApplyExtendedXpIncrementResult = {
  explicitDraftValuesByLevel: Map<number, number>
  anchorLevel: number
  anchorXpRequired: number
}

function explicitDraftValuesToMap(
  explicitDraftValuesByLevel: ApplyExtendedXpIncrementInput['explicitDraftValuesByLevel'],
): Map<number, number> {
  if (explicitDraftValuesByLevel instanceof Map) {
    return new Map(explicitDraftValuesByLevel)
  }
  return new Map(
    Object.entries(explicitDraftValuesByLevel).map(([level, xpRequired]) => [
      Number(level),
      xpRequired,
    ]),
  )
}

function explicitDraftValuesToOverrides(
  explicitDraftValuesByLevel: ReadonlyMap<number, number>,
): XpThresholdOverrideEntry[] {
  return [...explicitDraftValuesByLevel.entries()]
    .sort(([left], [right]) => left - right)
    .map(([level, xpRequired]) => ({ level, xpRequired }))
}

/** Resolves metadata for the sticky extended-progression bulk action. */
export function resolveExtendedProgressionActionContext(input: {
  systemEntries: readonly XpProgressionEntry[]
  effectiveMaxLevel: number
  explicitDraftValuesByLevel: ReadonlyMap<number, number> | Record<number, number>
}): ExtendedProgressionActionContext | undefined {
  const maxSystemLevel = resolveMaxSystemLevel(input.systemEntries)
  if (input.effectiveMaxLevel <= maxSystemLevel) return undefined

  const extendedStartsAt = maxSystemLevel + 1
  const overrides = explicitDraftValuesToOverrides(
    explicitDraftValuesToMap(input.explicitDraftValuesByLevel),
  )
  const effectiveToAnchor = resolveEffectiveXpProgression({
    systemEntries: input.systemEntries,
    overrides,
    effectiveMaxLevel: maxSystemLevel,
  })
  const anchorEntry = effectiveToAnchor[effectiveToAnchor.length - 1]
  const anchorLevel = anchorEntry?.level ?? maxSystemLevel
  const anchorXpRequired = anchorEntry?.xpRequired ?? 0
  const effectiveExtended = resolveEffectiveXpProgression({
    systemEntries: input.systemEntries,
    overrides,
    effectiveMaxLevel: input.effectiveMaxLevel,
  })

  return {
    label: 'Set extended progression',
    extendedStartsAt,
    currentIncrement: effectiveIncrementAtLevel(effectiveExtended, extendedStartsAt),
    anchorLevel,
    anchorXpRequired,
    extendedEndLevel: input.effectiveMaxLevel,
  }
}

/** Applies a uniform increment across the extended band from the anchor level. */
export function applyExtendedXpIncrement(
  input: ApplyExtendedXpIncrementInput,
): ApplyExtendedXpIncrementResult {
  const maxSystemLevel = resolveMaxSystemLevel(input.systemEntries)
  const extendedStartsAt = maxSystemLevel + 1
  const next = explicitDraftValuesToMap(input.explicitDraftValuesByLevel)
  const actionContext = resolveExtendedProgressionActionContext({
    systemEntries: input.systemEntries,
    effectiveMaxLevel: input.effectiveMaxLevel,
    explicitDraftValuesByLevel: next,
  })

  if (actionContext === undefined) {
    return {
      explicitDraftValuesByLevel: next,
      anchorLevel: extendedStartsAt,
      anchorXpRequired: 0,
    }
  }

  let currentXp = actionContext.anchorXpRequired + input.increment
  next.set(extendedStartsAt, currentXp)

  for (let level = extendedStartsAt + 1; level <= input.effectiveMaxLevel; level += 1) {
    currentXp += input.increment
    next.set(level, currentXp)
  }

  return {
    explicitDraftValuesByLevel: next,
    anchorLevel: extendedStartsAt,
    anchorXpRequired: next.get(extendedStartsAt) ?? currentXp,
  }
}

/** Validates the effective active XP table — domain boundary, not generic table contracts. */
export function refineEffectiveXpProgression(
  input: ResolveEffectiveXpProgressionInput,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const effective = resolveEffectiveXpProgression(input)
  const validChain: EffectiveXpThresholdEntry[] = []

  effective.forEach((entry, index) => {
    if (index === 0 && entry.level === 1 && entry.xpRequired !== 0) {
      ctx.addIssue({
        code: 'custom',
        message: xpThresholdsValidationMessages.levelOneZeroXp(),
        path: [...pathPrefix, index, 'xpRequired'],
      })
    }

    const previous = validChain[validChain.length - 1]
    if (previous !== undefined && entry.xpRequired <= previous.xpRequired) {
      ctx.addIssue({
        code: 'custom',
        message: xpThresholdsValidationMessages.increasingXp(),
        path: [...pathPrefix, index, 'xpRequired'],
      })
    }

    validChain.push(entry)
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
  'Edit a derived value to make it explicit; later derived values recalculate from the updated progression.'

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
