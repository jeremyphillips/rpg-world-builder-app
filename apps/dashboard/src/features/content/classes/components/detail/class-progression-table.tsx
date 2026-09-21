import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Heading } from '@rpg/ui'
import {
  formatSpellLevel,
  proficiencyBonus,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  defaultMulticlassingRules,
  defaultSubclassingRules,
  MAX_CHARACTER_LEVEL,
  isSpellcastingActiveAtLevel,
  collectFeatureProgressionColumns,
  formatProgressionTableValue,
  resolveProgressionTableColumnValue,
  resolveClassSpellcasting,
  resolveClassDisplayChoiceColumns,
  resolveCompiledChoiceProgressionQuotaAtLevel,
  findCompiledChoiceProgressionBySuffix,
  resolveDisplaySlotRowAtLevel,
  type ResolvedCampaignRules,
  type ResolvedClassSpellcasting,
  type ResolvedClassSpellcastingDisplayColumn,
  type ResolvedSpellcastingProgressionConfig,
} from '@rpg/contracts'
import type { CharacterClass } from '@rpg/contracts'

import { ProgressionTierSeparatorTableRow } from '../../../components/tables/progression-tier-separator'
import { projectVisibleClassFeatures } from '../../lib/class-display'
import { isSubclassChoiceFeatureRow } from '../../lib/class-subclass-choice-features'

type ProgressionColumn = ReturnType<typeof collectFeatureProgressionColumns>[number]

type ProgressionRow = {
  level: number
  profBonus: number
  features: string[]
  progressionValues?: Record<string, string | undefined>
  choiceColumns: Record<string, number | undefined>
  slots?: readonly number[]
}

function featuresAtLevel(
  features: CharacterClass['features'],
  level: number,
  subclassingEnabled: boolean,
): string[] {
  return features
    .filter((feature) => {
      if (feature.level !== level) return false
      if (!subclassingEnabled && isSubclassChoiceFeatureRow(feature)) return false
      return true
    })
    .map((feature) => feature.name)
}

function buildProgressionValueRow(
  columns: readonly ProgressionColumn[],
  level: number,
): Record<string, string | undefined> | undefined {
  if (columns.length === 0) return undefined
  return Object.fromEntries(
    columns.map((column) => {
      const value = resolveProgressionTableColumnValue(column.column, level)
      return [
        column.columnKey,
        value === undefined ? undefined : formatProgressionTableValue(column.column, value),
      ]
    }),
  )
}

function resolveChoiceColumnValues(
  resolved: ResolvedClassSpellcasting,
  columns: readonly ResolvedClassSpellcastingDisplayColumn[],
  level: number,
): Record<string, number | undefined> {
  return Object.fromEntries(
    columns.map((column) => {
      const compiled = findCompiledChoiceProgressionBySuffix(resolved, column.suffix, column.kind)
      return [
        column.suffix,
        compiled ? resolveCompiledChoiceProgressionQuotaAtLevel(compiled, level) : undefined,
      ]
    }),
  )
}

function resolveRowChoiceColumns(input: {
  level: number
  characterClass: CharacterClass
  resolved: ResolvedClassSpellcasting | null
  displayChoiceColumns: readonly ResolvedClassSpellcastingDisplayColumn[]
}): Record<string, number | undefined> {
  if (!isSpellcastingActiveAtLevel(input.characterClass, input.level) || !input.resolved) {
    return {}
  }

  return resolveChoiceColumnValues(input.resolved, input.displayChoiceColumns, input.level)
}

function buildRow(
  level: number,
  characterClass: CharacterClass,
  resolved: ResolvedClassSpellcasting | null,
  subclassingEnabled: boolean,
  progressionColumns: readonly ProgressionColumn[],
  displayChoiceColumns: readonly ResolvedClassSpellcastingDisplayColumn[],
): ProgressionRow {
  const castingActive = isSpellcastingActiveAtLevel(characterClass, level)

  const featureNames = featuresAtLevel(characterClass.features, level, subclassingEnabled)

  return {
    level,
    profBonus: proficiencyBonus(level),
    features: featureNames,
    progressionValues: buildProgressionValueRow(progressionColumns, level),
    choiceColumns: resolveRowChoiceColumns({
      level,
      characterClass,
      resolved,
      displayChoiceColumns,
    }),
    slots:
      castingActive && resolved
        ? resolveDisplaySlotRowAtLevel(resolved.slotProgression, level)
        : undefined,
  }
}

function buildRows(
  characterClass: CharacterClass,
  maxCharacterLevel: number,
  subclassingEnabled: boolean,
  progressionColumns: readonly ProgressionColumn[],
  resolved: ResolvedClassSpellcasting | null,
  displayChoiceColumns: readonly ResolvedClassSpellcastingDisplayColumn[],
): ProgressionRow[] {
  const visibleFeatures = projectVisibleClassFeatures(characterClass.features, {
    subclassingEnabled,
  })
  const classForProgression = { ...characterClass, features: visibleFeatures }
  return Array.from({ length: maxCharacterLevel }, (_, index) =>
    buildRow(
      index + 1,
      classForProgression,
      resolved,
      subclassingEnabled,
      progressionColumns,
      displayChoiceColumns,
    ),
  )
}

function slotLevelRange(rows: ProgressionRow[]): number[] {
  const maxSlotCols = rows.reduce((max, row) => Math.max(max, row.slots?.length ?? 0), 0)
  return Array.from({ length: maxSlotCols }, (_, index) => index + 1)
}

type ColumnFlags = {
  progressionColumns: ProgressionColumn[]
  choiceColumns: ResolvedClassSpellcastingDisplayColumn[]
  slotLevels: number[]
}

function buildColumnFlags(
  progressionColumns: readonly ProgressionColumn[],
  displayChoiceColumns: readonly ResolvedClassSpellcastingDisplayColumn[],
  rows: ProgressionRow[],
): ColumnFlags {
  const choiceColumns = displayChoiceColumns.filter((column) =>
    rows.some((row) => row.choiceColumns[column.suffix] !== undefined),
  )

  return {
    progressionColumns: [...progressionColumns],
    choiceColumns,
    slotLevels: slotLevelRange(rows),
  }
}

function columnCount(flags: ColumnFlags): number {
  return 3 + flags.progressionColumns.length + flags.choiceColumns.length + flags.slotLevels.length
}

function ProgressionValueCell({
  values,
  columnKey,
}: {
  values?: Record<string, string | undefined>
  columnKey: string
}) {
  const value = values?.[columnKey]
  return <TableCell className="text-center">{value !== undefined ? value : '—'}</TableCell>
}

function SlotCell({ slots, slotIndex }: { slots?: readonly number[]; slotIndex: number }) {
  const count = slots ? (slots[slotIndex] ?? 0) : 0
  return <TableCell className="text-center">{count > 0 ? count : '—'}</TableCell>
}

function ProgressionTableHeader({ progressionColumns, choiceColumns, slotLevels }: ColumnFlags) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-14">Level</TableHead>
        <TableHead className="w-20">Prof. Bonus</TableHead>
        <TableHead>Class Features</TableHead>
        {progressionColumns.map((column) => (
          <TableHead key={column.columnKey} className="w-24 text-center">
            {column.label}
          </TableHead>
        ))}
        {choiceColumns.map((column) => (
          <TableHead key={column.suffix} className="w-24 text-center">
            {column.label}
          </TableHead>
        ))}
        {slotLevels.map((slotLevel) => (
          <TableHead key={slotLevel} className="w-16 text-center">
            {formatSpellLevel(slotLevel)}-level Slots
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

function ProgressionBodyRow({
  row,
  progressionColumns,
  choiceColumns,
  slotLevels,
}: { row: ProgressionRow } & Pick<
  ColumnFlags,
  'progressionColumns' | 'choiceColumns' | 'slotLevels'
>) {
  const featuresText = row.features.length > 0 ? row.features.join(', ') : '—'
  return (
    <TableRow>
      <TableCell className="font-medium">{row.level}</TableCell>
      <TableCell>+{row.profBonus}</TableCell>
      <TableCell>{featuresText}</TableCell>
      {progressionColumns.map((column) => (
        <ProgressionValueCell
          key={column.columnKey}
          values={row.progressionValues}
          columnKey={column.columnKey}
        />
      ))}
      {choiceColumns.map((column) => (
        <TableCell key={column.suffix} className="text-center">
          {row.choiceColumns[column.suffix] ?? '—'}
        </TableCell>
      ))}
      {slotLevels.map((slotLevel) => (
        <SlotCell key={slotLevel} slots={row.slots} slotIndex={slotLevel - 1} />
      ))}
    </TableRow>
  )
}

type ClassProgressionTableProps = {
  characterClass: CharacterClass
  spellcastingProgression: ResolvedSpellcastingProgressionConfig
  campaignRules?: ResolvedCampaignRules
  /** @deprecated Prefer `campaignRules`. */
  maxCharacterLevel?: number
}

const DEFAULT_CAMPAIGN_RULES: ResolvedCampaignRules = {
  maxCharacterLevel: MAX_CHARACTER_LEVEL,
  standardMaxCharacterLevel: MAX_CHARACTER_LEVEL,
  allowedCharacterCreatureTypes: [...DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES],
  multiclassing: defaultMulticlassingRules(),
  subclassing: defaultSubclassingRules(),
  standardArray: [15, 14, 13, 12, 10, 8],
}

export function ClassProgressionTable({
  characterClass,
  spellcastingProgression,
  campaignRules,
  maxCharacterLevel,
}: ClassProgressionTableProps) {
  const rules = campaignRules ?? {
    ...DEFAULT_CAMPAIGN_RULES,
    maxCharacterLevel: maxCharacterLevel ?? MAX_CHARACTER_LEVEL,
  }
  const progressionColumns = collectFeatureProgressionColumns(characterClass.features)
  const resolved = characterClass.spellcasting
    ? resolveClassSpellcasting(characterClass, spellcastingProgression)
    : null
  const displayChoiceColumns = resolved ? resolveClassDisplayChoiceColumns(resolved) : []
  const rows = buildRows(
    characterClass,
    rules.maxCharacterLevel,
    rules.subclassing.enabled,
    progressionColumns,
    resolved,
    displayChoiceColumns,
  )
  const flags = buildColumnFlags(progressionColumns, displayChoiceColumns, rows)
  const colSpan = columnCount(flags)
  const extended = rules.extendedProgression

  return (
    <section aria-labelledby="progression-heading">
      <Heading variant="section" as="h2" id="progression-heading" className="mb-4">
        Class Progression
      </Heading>
      <Table>
        <ProgressionTableHeader {...flags} />
        <TableBody>
          {rows.flatMap((row) => {
            const bodyRow = <ProgressionBodyRow key={`level-${row.level}`} row={row} {...flags} />
            if (extended && row.level === rules.standardMaxCharacterLevel) {
              return [
                bodyRow,
                <ProgressionTierSeparatorTableRow
                  key={`tier-separator-${extended.tierName}`}
                  label={`${extended.tierName} Tier`}
                  colSpan={colSpan}
                  variant="preview"
                />,
              ]
            }
            return [bodyRow]
          })}
        </TableBody>
      </Table>
    </section>
  )
}
