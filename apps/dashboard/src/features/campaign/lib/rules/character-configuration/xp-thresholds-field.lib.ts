import {
  computeXpThresholdsSparsePatch,
  formatXpThresholdDerivedCallout,
  formatXpThresholdValue,
  normalizeXpThresholdOverrides,
  resolveEffectiveXpProgression,
  resolveXpThresholdDerivedPresentation,
  resolveXpThresholdEditorState,
  type XpProgressionEntry,
  type XpThresholdEditorRowState,
  type XpThresholdOverrideEntry,
  type XpThresholdTierContext,
} from '@rpg/contracts'
import { parseGroupedNumber } from '@rpg/contracts/primitives'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'

import { createFixedLevelsTableBuilderDraft } from '@/features/content/lib/table-builder/create-fixed-levels-table-builder-draft'
import {
  isTableBuilderCellBlank,
  parseLevelDraft,
  type TableBuilderFormValues,
} from '@/features/content/lib/table-builder/table-builder-draft'
import type {
  TableBuilderCellPresentation,
  TableBuilderCellPresentationContext,
  TableBuilderDraftValidationResult,
  TableBuilderExtendedProgression,
  TableBuilderHostConfig,
  TableBuilderRowPresentation,
  TableBuilderRowPresentationContext,
} from '@/features/content/lib/table-builder/table-builder-host-config'

export const XP_THRESHOLDS_TABLE_NAME = 'Experience thresholds'
export const XP_REQUIRED_COLUMN_LABEL = 'XP required'

export type XpThresholdOverrideFormEntry = XpThresholdOverrideEntry

type XpThresholdHostContext = {
  systemEntries: readonly XpProgressionEntry[]
  dormantOverrides: readonly XpThresholdOverrideEntry[]
  effectiveMaxLevel: number
}

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

/** Parses a table-builder XP cell draft string into a domain integer. */
export function parseXpThresholdCellDraft(raw: string): number | undefined {
  const parsed = parseGroupedNumber(raw)
  if (parsed === undefined || !Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

export function buildDraftExplicitValuesByLevel(
  draft: TableBuilderFormValues,
  columnKey: string,
): Map<number, number> {
  const values = new Map<number, number>()

  for (const row of draft.rows) {
    const level = parseLevelDraft(row.level ?? '')
    if (level === undefined || level <= 1) continue

    const cell = row.cells[columnKey]
    if (cell === undefined || isTableBuilderCellBlank(cell) || typeof cell !== 'string') continue

    const xpRequired = parseXpThresholdCellDraft(cell)
    if (xpRequired === undefined) continue

    values.set(level, xpRequired)
  }

  return values
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

    const xpRequired = parseXpThresholdCellDraft(cell)
    if (xpRequired === undefined) continue

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

function resolveColumnKey(draft: TableBuilderFormValues): string | undefined {
  return draft.columns[0]?.key
}

function walkTouchedFormPaths(node: unknown, prefix: string, touchedPaths: string[]): void {
  if (node === true) {
    if (prefix) touchedPaths.push(prefix)
    return
  }

  if (Array.isArray(node)) {
    node.forEach((entry, index) => {
      if (entry === undefined || entry === null) return
      walkTouchedFormPaths(entry, `${prefix}.${index}`, touchedPaths)
    })
    return
  }

  if (typeof node !== 'object' || node === null) return

  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null) continue
    const nextPath = prefix ? `${prefix}.${key}` : key
    walkTouchedFormPaths(value, nextPath, touchedPaths)
  }
}

export function flattenFormTouchedPaths(touchedFields: unknown): string[] {
  const paths: string[] = []
  walkTouchedFormPaths(touchedFields, '', paths)
  return paths
}

/** Maps blurred XP threshold cells to their semantic levels. */
export function buildCommittedDraftLevelsForXpColumn(
  draft: TableBuilderFormValues,
  columnKey: string,
  touchedCellPaths: Iterable<string>,
): Set<number> {
  const committed = new Set<number>()

  for (const path of touchedCellPaths) {
    const match = path.match(/^rows\.(\d+)\.cells\.([^.]+)$/)
    if (match === null) continue
    const rowIndex = Number(match[1])
    const cellKey = match[2]
    if (cellKey !== columnKey) continue
    const level = parseLevelDraft(draft.rows[rowIndex]?.level ?? '')
    if (level !== undefined && level > 1) {
      committed.add(level)
    }
  }

  return committed
}

function resolveXpThresholdEditorRows(
  draft: TableBuilderFormValues,
  context: XpThresholdHostContext,
  committedDraftLevels?: ReadonlySet<number>,
): XpThresholdEditorRowState[] {
  const columnKey = resolveColumnKey(draft)
  if (columnKey === undefined) return []

  return resolveXpThresholdEditorState({
    systemEntries: context.systemEntries,
    overrides: context.dormantOverrides.filter((entry) => entry.level > context.effectiveMaxLevel),
    effectiveMaxLevel: context.effectiveMaxLevel,
    explicitDraftValuesByLevel: buildDraftExplicitValuesByLevel(draft, columnKey),
    committedDraftLevels,
  })
}

function findEditorRowForLevel(
  rows: readonly XpThresholdEditorRowState[],
  level: number | undefined,
): XpThresholdEditorRowState | undefined {
  if (level === undefined) return undefined
  return rows.find((row) => row.level === level)
}

export function resolveXpThresholdRowPresentation(
  ctx: TableBuilderRowPresentationContext,
  systemEntries: readonly XpProgressionEntry[],
  dormantOverrides: readonly XpThresholdOverrideEntry[],
  effectiveMaxLevel: number,
): TableBuilderRowPresentation | undefined {
  const level = ctx.level
  if (level === undefined) return undefined

  const editorRow = findEditorRowForLevel(
    resolveXpThresholdEditorRows(
      ctx.draft,
      {
        systemEntries,
        dormantOverrides,
        effectiveMaxLevel,
      },
      ctx.committedDraftLevels,
    ),
    level,
  )
  if (editorRow === undefined) return undefined

  return {
    readOnly: editorRow.readOnly,
    blockedByLevel: editorRow.blockedByLevel,
    blockedHint: editorRow.blockedHint,
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

  const editorRow = findEditorRowForLevel(
    resolveXpThresholdEditorRows(
      ctx.draft,
      {
        systemEntries,
        dormantOverrides,
        effectiveMaxLevel,
      },
      ctx.committedDraftLevels,
    ),
    level,
  )
  if (editorRow === undefined) return undefined

  const presentation: TableBuilderCellPresentation = { formatGrouped: true }

  if (level === 1) {
    return { ...presentation, readOnly: true }
  }

  if (!isTableBuilderCellBlank(ctx.draftValue)) {
    if (typeof ctx.draftValue === 'string') {
      const xpRequired = parseXpThresholdCellDraft(ctx.draftValue)
      if (xpRequired !== undefined) {
        presentation.formattedValue = formatXpThresholdValue(xpRequired)
      }
    }
    if (editorRow.progressionError !== undefined) {
      presentation.progressionError = editorRow.progressionError
    }
    return presentation
  }

  if (editorRow.displayPlaceholder !== undefined) {
    presentation.placeholder = editorRow.displayPlaceholder
  }

  if (editorRow.provenance === 'derived' && editorRow.displayPlaceholder !== '—') {
    presentation.provenanceBadge = 'derived'
  }

  return presentation
}

export function resolveXpThresholdsValuesNotice(
  draft: TableBuilderFormValues,
  systemEntries: readonly XpProgressionEntry[],
  dormantOverrides: readonly XpThresholdOverrideEntry[],
  effectiveMaxLevel: number,
  tier?: XpThresholdTierContext,
) {
  const columnKey = resolveColumnKey(draft)
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

export function validateXpThresholdsDraft(
  draft: TableBuilderFormValues,
  systemEntries: readonly XpProgressionEntry[],
  dormantOverrides: readonly XpThresholdOverrideEntry[],
  effectiveMaxLevel: number,
): TableBuilderDraftValidationResult {
  const columnKey = resolveColumnKey(draft)
  if (columnKey === undefined) return { valid: true }

  const editorRows = resolveXpThresholdEditorRows(draft, {
    systemEntries,
    dormantOverrides,
    effectiveMaxLevel,
  })

  const errors: Array<{ path: string; message: string }> = []

  draft.rows.forEach((row, rowIndex) => {
    const level = parseLevelDraft(row.level ?? '')
    if (level === undefined) return

    const editorRow = findEditorRowForLevel(editorRows, level)
    if (editorRow?.progressionError === undefined) return

    errors.push({
      path: `rows.${rowIndex}.cells.${columnKey}`,
      message: editorRow.progressionError,
    })
  })

  if (errors.length === 0) return { valid: true }
  return { valid: false, errors }
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
  const hostContext: XpThresholdHostContext = {
    systemEntries: input.systemEntries,
    dormantOverrides: input.dormantOverrides,
    effectiveMaxLevel: input.effectiveMaxLevel,
  }

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
        hostContext.systemEntries,
        hostContext.dormantOverrides,
        hostContext.effectiveMaxLevel,
      ),
    resolveRowPresentation: (ctx) =>
      resolveXpThresholdRowPresentation(
        ctx,
        hostContext.systemEntries,
        hostContext.dormantOverrides,
        hostContext.effectiveMaxLevel,
      ),
    resolveValuesNotice: (ctx) =>
      resolveXpThresholdsValuesNotice(
        ctx.draft,
        hostContext.systemEntries,
        hostContext.dormantOverrides,
        hostContext.effectiveMaxLevel,
        tier,
      ),
    validateDraftBeforeSave: (ctx) =>
      validateXpThresholdsDraft(
        ctx.draft,
        hostContext.systemEntries,
        hostContext.dormantOverrides,
        hostContext.effectiveMaxLevel,
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
  const columnKey = resolveColumnKey(draft)
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
