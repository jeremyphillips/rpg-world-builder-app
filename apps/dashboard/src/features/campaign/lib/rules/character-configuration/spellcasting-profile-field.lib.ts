import type { SlotProgression, SpellcastingProfile, SpellChoiceProgression } from '@rpg/contracts'

/** Maps vocabulary entry records to option label maps for `toOptions`. */
export function labelsFromGameTermEntries<const T extends string>(
  entries: Record<T, { label: string }>,
): Record<T, string> {
  return Object.fromEntries(
    (Object.entries(entries) as [T, { label: string }][]).map(([key, value]) => [key, value.label]),
  ) as Record<T, string>
}

import {
  createFixedLevelsTableBuilderDraft,
  isTableBuilderCellBlank,
  parseLevelDraft,
  type TableBuilderFixedColumnDefinition,
  type TableBuilderFormValues,
  type TableBuilderHostConfig,
} from '@/lib/table-builder'
import { buildAllowedLevels } from './xp-thresholds-field.lib'

export const CHOICE_CURVE_COUNT_COLUMN_KEY = 'count'

export function resolveChoiceCurveFixedColumns(): readonly TableBuilderFixedColumnDefinition[] {
  return [
    {
      semanticKey: CHOICE_CURVE_COUNT_COLUMN_KEY,
      label: 'Count',
      valueType: 'number',
      format: 'plain',
    },
  ]
}

export function buildChoiceProgressionCurveHostConfig(input: {
  effectiveMaxLevel: number
  maxCharacterLevel?: number
  extendedTierName?: string
}): TableBuilderHostConfig {
  const maxCharacterLevel = input.maxCharacterLevel ?? 20
  return {
    allowedKinds: ['levelProgression'],
    recommendedKind: 'levelProgression',
    allowedLevels: buildAllowedLevels(input.effectiveMaxLevel),
    columns: 'fixed',
    rows: 'fixedLevels',
    resolveFixedColumns: resolveChoiceCurveFixedColumns,
    ...(input.effectiveMaxLevel > maxCharacterLevel && input.extendedTierName
      ? {
          extendedProgression: {
            standardMaxLevel: maxCharacterLevel,
            tierName: input.extendedTierName,
          },
        }
      : {}),
  }
}

function parseCurveCountCell(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined
  const parsed = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

export function buildChoiceProgressionCurveDraft(input: {
  progression: SpellChoiceProgression
  effectiveMaxLevel: number
  maxCharacterLevel?: number
  extendedTierName?: string
}): TableBuilderFormValues {
  const config = buildChoiceProgressionCurveHostConfig(input)
  const rowsByLevel = new Map(input.progression.curve.rows.map((row) => [row.level, row.count]))

  return createFixedLevelsTableBuilderDraft(config, {
    name: input.progression.presentation?.column?.label ?? input.progression.id,
    seedRowCells: (level) => {
      const count = rowsByLevel.get(level)
      return count === undefined ? undefined : String(count)
    },
  })
}

export function mapChoiceProgressionCurveDraftToRows(
  draft: TableBuilderFormValues,
): SpellChoiceProgression['curve']['rows'] {
  const columnKey = draft.columns[0]?.key
  if (columnKey === undefined) return []

  return draft.rows
    .map((row) => {
      const level = parseLevelDraft(row.level ?? '')
      if (level === undefined) return null
      const cell = row.cells[columnKey]
      if (cell === undefined || isTableBuilderCellBlank(cell) || typeof cell !== 'string') {
        return null
      }
      const count = parseCurveCountCell(cell)
      if (count === undefined) return null
      return { level, count }
    })
    .filter((row): row is { level: number; count: number } => row !== null)
    .sort((left, right) => left.level - right.level)
}

export function formatSpellcastingProfileMetadata(
  profile: SpellcastingProfile,
  slotProgressions: readonly SlotProgression[],
): string {
  const slotProgression = slotProgressions.find((entry) => entry.id === profile.slotProgressionId)
  const enabledColumns = profile.choiceProgressions.filter(
    (progression) => progression.presentation?.column?.enabled,
  ).length
  const slotLabel = slotProgression?.label ?? profile.slotProgressionId
  return `${slotLabel} · ${enabledColumns} table column${enabledColumns === 1 ? '' : 's'}`
}

export function createDefaultChoiceProgression(id: string): SpellChoiceProgression {
  return {
    id,
    kind: 'capacity',
    extension: 'carryForward',
    source: { kind: 'classList' },
    destination: 'prepared',
    mutation: { kind: 'replace', trigger: 'longRest', limit: 1 },
    curve: { rows: [] },
    presentation: { column: { enabled: true, label: 'Spells' } },
  }
}

export function createDefaultSpellcastingProfile(input: {
  id: string
  label: string
  slotProgressionId: string
}): SpellcastingProfile {
  return {
    id: input.id,
    label: input.label,
    slotProgressionId: input.slotProgressionId,
    choiceProgressions: [],
  }
}
