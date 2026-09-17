import {
  computeXpThresholdsSparsePatch,
  formatXpThresholdDerivedCallout,
  formatXpThresholdValue,
  normalizeXpThresholdOverrides,
  resolveEffectiveXpProgression,
  resolveXpThresholdDerivedPresentation,
  type XpProgressionEntry,
  type XpThresholdOverrideEntry,
  type XpThresholdTierContext,
} from '@rpg/contracts'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'

import { createFixedLevelsTableBuilderDraft } from '@/features/content/lib/table-builder/create-fixed-levels-table-builder-draft'
import {
  isTableBuilderCellBlank,
  parseLevelDraft,
  parseNumberCellDraft,
  type TableBuilderFormValues,
} from '@/features/content/lib/table-builder/table-builder-draft'
import type {
  TableBuilderCellPresentation,
  TableBuilderCellPresentationContext,
  TableBuilderExtendedProgression,
  TableBuilderHostConfig,
} from '@/features/content/lib/table-builder/table-builder-host-config'

export const XP_THRESHOLDS_TABLE_NAME = 'Experience thresholds'
export const XP_REQUIRED_COLUMN_LABEL = 'XP required'

export type XpThresholdOverrideFormEntry = XpThresholdOverrideEntry

export function buildEffectiveMaxLevel(values: {
  maxCharacterLevel: number
  extendedProgressionEnabled: boolean
  extendedMaxLevel?: number
}): number {
  if (values.extendedProgressionEnabled) {
    return values.extendedMaxLevel ?? values.maxCharacterLevel
  }
  return values.maxCharacterLevel
}

export function buildAllowedLevels(effectiveMaxLevel: number): number[] {
  return Array.from({ length: effectiveMaxLevel }, (_, index) => index + 1)
}

export function resolveSystemXpEntries(rulesetId: 'srd-cc-5.2.1'): readonly XpProgressionEntry[] {
  return getStandardXpProgression(rulesetId).entries
}

function overrideMap(
  overrides: readonly XpThresholdOverrideEntry[],
): Map<number, XpThresholdOverrideEntry> {
  return new Map(overrides.map((entry) => [entry.level, entry]))
}

function filledDraftOverrides(
  draft: TableBuilderFormValues,
  columnKey: string,
): XpThresholdOverrideEntry[] {
  const overrides: XpThresholdOverrideEntry[] = []

  for (const row of draft.rows) {
    const level = parseLevelDraft(row.level ?? '')
    if (level === undefined || level <= 1) continue

    const cell = row.cells[columnKey]
    if (cell === undefined || isTableBuilderCellBlank(cell) || typeof cell !== 'string') continue

    const xpRequired = parseNumberCellDraft(cell)
    if (xpRequired === undefined || !Number.isInteger(xpRequired) || xpRequired < 0) continue

    overrides.push({ level, xpRequired })
  }

  return overrides
}

export function mergeDraftAndDormantOverrides(
  draft: TableBuilderFormValues,
  columnKey: string,
  dormantOverrides: readonly XpThresholdOverrideEntry[],
  effectiveMaxLevel: number,
): XpThresholdOverrideEntry[] {
  const active = filledDraftOverrides(draft, columnKey)
  const activeLevels = new Set(active.map((entry) => entry.level))
  const dormant = dormantOverrides.filter((entry) => entry.level > effectiveMaxLevel)
  const merged = [...active, ...dormant.filter((entry) => !activeLevels.has(entry.level))]
  return merged.sort((left, right) => left.level - right.level)
}

function resolveXpThresholdTierContext(input: {
  extendedProgressionEnabled: boolean
  maxCharacterLevel: number
  extendedTierName?: string
}): XpThresholdTierContext | undefined {
  if (!input.extendedProgressionEnabled) return undefined
  const tierName = input.extendedTierName?.trim()
  if (!tierName) return { extendedStartsAt: input.maxCharacterLevel + 1 }
  return {
    extendedStartsAt: input.maxCharacterLevel + 1,
    extendedTierName: tierName,
  }
}

function resolveXpThresholdExtendedProgression(input: {
  extendedProgressionEnabled: boolean
  maxCharacterLevel: number
  extendedTierName?: string
}): TableBuilderExtendedProgression | undefined {
  if (!input.extendedProgressionEnabled) return undefined
  const tierName = input.extendedTierName?.trim()
  if (!tierName) return undefined
  return {
    standardMaxLevel: input.maxCharacterLevel,
    tierName,
  }
}

export function resolveXpThresholdCellPresentation(
  ctx: TableBuilderCellPresentationContext,
  systemEntries: readonly XpProgressionEntry[],
  dormantOverrides: readonly XpThresholdOverrideEntry[],
  effectiveMaxLevel: number,
): TableBuilderCellPresentation | undefined {
  const level = ctx.level
  if (level === undefined) return undefined

  if (level === 1) {
    return { readOnly: true }
  }

  const columnKey = ctx.columnKey
  const draftOverrides = mergeDraftAndDormantOverrides(
    ctx.draft,
    columnKey,
    dormantOverrides,
    effectiveMaxLevel,
  )
  const effective = resolveEffectiveXpProgression({
    systemEntries,
    overrides: draftOverrides,
    effectiveMaxLevel,
  })
  const row = effective.find((entry) => entry.level === level)
  if (row === undefined) return undefined

  if (!isTableBuilderCellBlank(ctx.draftValue)) {
    return undefined
  }

  return {
    placeholder: formatXpThresholdValue(row.xpRequired),
    provenanceBadge: row.provenance === 'derived' ? 'derived' : undefined,
  }
}

export function resolveXpThresholdsValuesNotice(
  draft: TableBuilderFormValues,
  systemEntries: readonly XpProgressionEntry[],
  dormantOverrides: readonly XpThresholdOverrideEntry[],
  effectiveMaxLevel: number,
  tier?: XpThresholdTierContext,
) {
  const columnKey = draft.columns[0]?.key
  if (columnKey === undefined) return undefined

  const overrides = mergeDraftAndDormantOverrides(
    draft,
    columnKey,
    dormantOverrides,
    effectiveMaxLevel,
  )
  const presentation = resolveXpThresholdDerivedPresentation(
    { systemEntries, overrides, effectiveMaxLevel },
    tier,
  )
  if (presentation === undefined) return undefined
  return formatXpThresholdDerivedCallout(presentation)
}

export function buildXpThresholdsHostConfig(input: {
  effectiveMaxLevel: number
  systemEntries: readonly XpProgressionEntry[]
  dormantOverrides: readonly XpThresholdOverrideEntry[]
  extendedProgressionEnabled: boolean
  maxCharacterLevel: number
  extendedTierName?: string
}): TableBuilderHostConfig {
  const allowedLevels = buildAllowedLevels(input.effectiveMaxLevel)
  const tier = resolveXpThresholdTierContext(input)
  const extendedProgression = resolveXpThresholdExtendedProgression(input)

  return {
    allowedKinds: ['levelProgression'],
    recommendedKind: 'levelProgression',
    allowedLevels,
    columns: 'fixed',
    rows: 'fixedLevels',
    fixedColumns: [{ label: XP_REQUIRED_COLUMN_LABEL, valueType: 'number', format: 'plain' }],
    extendedProgression,
    resolveCellPresentation: (ctx) =>
      resolveXpThresholdCellPresentation(
        ctx,
        input.systemEntries,
        input.dormantOverrides,
        input.effectiveMaxLevel,
      ),
    resolveValuesNotice: (ctx) =>
      resolveXpThresholdsValuesNotice(
        ctx.draft,
        input.systemEntries,
        input.dormantOverrides,
        input.effectiveMaxLevel,
        tier,
      ),
  }
}

export function buildXpThresholdsDraft(input: {
  effectiveMaxLevel: number
  systemEntries: readonly XpProgressionEntry[]
  overrides: readonly XpThresholdOverrideEntry[]
  extendedProgressionEnabled?: boolean
  maxCharacterLevel?: number
  extendedTierName?: string
}): TableBuilderFormValues {
  const overrideByLevel = overrideMap(input.overrides)
  const effective = resolveEffectiveXpProgression({
    systemEntries: input.systemEntries,
    overrides: input.overrides,
    effectiveMaxLevel: input.effectiveMaxLevel,
  })

  const config = buildXpThresholdsHostConfig({
    effectiveMaxLevel: input.effectiveMaxLevel,
    systemEntries: input.systemEntries,
    dormantOverrides: input.overrides.filter((entry) => entry.level > input.effectiveMaxLevel),
    extendedProgressionEnabled: input.extendedProgressionEnabled ?? false,
    maxCharacterLevel: input.maxCharacterLevel ?? input.effectiveMaxLevel,
    extendedTierName: input.extendedTierName,
  })

  return createFixedLevelsTableBuilderDraft(config, {
    name: XP_THRESHOLDS_TABLE_NAME,
    seedRowCells: (level) => {
      if (level === 1) return '0'
      if (overrideByLevel.has(level)) {
        return String(overrideByLevel.get(level)!.xpRequired)
      }
      const row = effective.find((entry) => entry.level === level)
      if (row?.provenance === 'system') {
        return String(row.xpRequired)
      }
      return undefined
    },
  })
}

export function mapXpThresholdsDraftToOverrides(
  draft: TableBuilderFormValues,
  systemEntries: readonly XpProgressionEntry[],
  dormantOverrides: readonly XpThresholdOverrideEntry[],
  effectiveMaxLevel: number,
): XpThresholdOverrideEntry[] {
  const columnKey = draft.columns[0]?.key
  if (columnKey === undefined) return []

  const merged = mergeDraftAndDormantOverrides(
    draft,
    columnKey,
    dormantOverrides,
    effectiveMaxLevel,
  )

  return normalizeXpThresholdOverrides(merged, systemEntries)
}

export function buildXpThresholdsPatchInput(
  overrides: readonly XpThresholdOverrideEntry[],
  systemEntries: readonly XpProgressionEntry[],
) {
  return computeXpThresholdsSparsePatch(overrides, systemEntries)
}
