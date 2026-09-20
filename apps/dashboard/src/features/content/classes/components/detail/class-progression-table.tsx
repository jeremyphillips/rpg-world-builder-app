import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Heading } from '@rpg/ui'
import {
  formatSpellLevel,
  proficiencyBonus,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  defaultMulticlassingRules,
  defaultSubclassingRules,
  MAX_CHARACTER_LEVEL,
  isSpellcastingActiveAtLevel,
  spellcastingUnlockLevel,
  collectFeatureProgressionColumns,
  formatProgressionTableValue,
  resolveProgressionTableColumnValue,
  resolveChoiceProgressionQuotaAtLevel,
  resolveDisplayChoiceColumns,
  resolveDisplaySlotRowAtLevel,
  resolveSpellcastingProfileForClass,
  spellcastingFeatureLabelFromProfile,
  isPactSpellcastingProfile,
  type ResolvedCampaignRules,
  type ResolvedSpellcastingProgressionConfig,
  type SpellChoiceProgression,
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

function isLegacySpellcastingFeature(
  feature: CharacterClass['features'][number],
  usesPactMagic: boolean,
): boolean {
  if (feature.id === 'spellcasting') return true
  return feature.id === 'pact-magic' && usesPactMagic
}

function featuresAtLevel(
  features: CharacterClass['features'],
  usesPactMagic: boolean,
  level: number,
  subclassingEnabled: boolean,
): string[] {
  return features
    .filter((feature) => {
      if (feature.level !== level) return false
      if (isLegacySpellcastingFeature(feature, usesPactMagic)) return false
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
  progressions: readonly SpellChoiceProgression[],
  level: number,
): Record<string, number | undefined> {
  return Object.fromEntries(
    progressions.map((progression) => [
      progression.id,
      resolveChoiceProgressionQuotaAtLevel(progression, level),
    ]),
  )
}

function buildRow(
  level: number,
  characterClass: CharacterClass,
  spellcastingProgression: ResolvedSpellcastingProgressionConfig,
  subclassingEnabled: boolean,
  progressionColumns: readonly ProgressionColumn[],
  displayChoiceProgressions: readonly SpellChoiceProgression[],
): ProgressionRow {
  const { features, spellcasting } = characterClass
  const bundle = spellcasting
    ? resolveSpellcastingProfileForClass(characterClass, spellcastingProgression)
    : null
  const castingActive = isSpellcastingActiveAtLevel(spellcasting, level)
  const usesPactMagic = bundle ? isPactSpellcastingProfile(bundle) : false

  const featureNames = featuresAtLevel(features, usesPactMagic, level, subclassingEnabled)

  const unlockLevel = spellcastingUnlockLevel(spellcasting)
  if (bundle && spellcasting && unlockLevel === level) {
    const label = spellcastingFeatureLabelFromProfile(bundle)
    if (!featureNames.includes(label)) featureNames.push(label)
  }

  return {
    level,
    profBonus: proficiencyBonus(level),
    features: featureNames,
    progressionValues: buildProgressionValueRow(progressionColumns, level),
    choiceColumns:
      castingActive && bundle ? resolveChoiceColumnValues(displayChoiceProgressions, level) : {},
    slots:
      castingActive && bundle
        ? resolveDisplaySlotRowAtLevel(bundle.slotProgression, level)
        : undefined,
  }
}

function buildRows(
  characterClass: CharacterClass,
  maxCharacterLevel: number,
  subclassingEnabled: boolean,
  progressionColumns: readonly ProgressionColumn[],
  spellcastingProgression: ResolvedSpellcastingProgressionConfig,
  displayChoiceProgressions: readonly SpellChoiceProgression[],
): ProgressionRow[] {
  const visibleFeatures = projectVisibleClassFeatures(characterClass.features, {
    subclassingEnabled,
  })
  const classForProgression = { ...characterClass, features: visibleFeatures }
  return Array.from({ length: maxCharacterLevel }, (_, index) =>
    buildRow(
      index + 1,
      classForProgression,
      spellcastingProgression,
      subclassingEnabled,
      progressionColumns,
      displayChoiceProgressions,
    ),
  )
}

function slotLevelRange(rows: ProgressionRow[]): number[] {
  const maxSlotCols = rows.reduce((max, row) => Math.max(max, row.slots?.length ?? 0), 0)
  return Array.from({ length: maxSlotCols }, (_, index) => index + 1)
}

type ColumnFlags = {
  progressionColumns: ProgressionColumn[]
  choiceColumns: SpellChoiceProgression[]
  slotLevels: number[]
}

function buildColumnFlags(
  progressionColumns: readonly ProgressionColumn[],
  displayChoiceProgressions: readonly SpellChoiceProgression[],
  rows: ProgressionRow[],
): ColumnFlags {
  return {
    progressionColumns: [...progressionColumns],
    choiceColumns: displayChoiceProgressions.filter((progression) =>
      rows.some((row) => row.choiceColumns[progression.id] !== undefined),
    ),
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
          <TableHead key={column.id} className="w-24 text-center">
            {column.presentation?.column?.label ?? column.id}
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
        <TableCell key={column.id} className="text-center">
          {row.choiceColumns[column.id] ?? '—'}
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
  const profileBundle = characterClass.spellcasting
    ? resolveSpellcastingProfileForClass(characterClass, spellcastingProgression)
    : null
  const displayChoiceProgressions = profileBundle
    ? resolveDisplayChoiceColumns(profileBundle.profile)
    : []
  const rows = buildRows(
    characterClass,
    rules.maxCharacterLevel,
    rules.subclassing.enabled,
    progressionColumns,
    spellcastingProgression,
    displayChoiceProgressions,
  )
  const flags = buildColumnFlags(progressionColumns, displayChoiceProgressions, rows)
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
