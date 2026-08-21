import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Heading } from '@rpg/ui'
import {
  formatSpellLevel,
  proficiencyBonus,
  getSlotRow,
  SLOT_TABLES,
  DEFAULT_CHARACTER_ALLOWED_CREATURE_TYPES,
  defaultMulticlassingRules,
  defaultSubclassingRules,
  MAX_CHARACTER_LEVEL,
  isSpellcastingActiveAtLevel,
  spellcastingFeatureLabel,
  spellcastingUnlockLevel,
  type ResolvedCampaignRules,
} from '@rpg/contracts'
import type { CharacterClass, Spellcasting } from '@rpg/contracts'

import { isSubclassChoiceFeatureRow } from '../../lib/class-subclass-choice-features'

type ProgressionRow = {
  level: number
  profBonus: number
  features: string[]
  resources?: Record<string, number>
  cantrips?: number
  spellsAvailable?: number
  slots?: number[]
}

function fillForward(
  entries: { level: number; value: number }[],
  currentLevel: number,
): number | undefined {
  const sorted = [...entries].sort((a, b) => a.level - b.level)
  let result: number | undefined
  for (const entry of sorted) {
    if (entry.level <= currentLevel) result = entry.value
  }
  return result
}

function isLegacySpellcastingFeature(
  feature: CharacterClass['features'][number],
  spellcasting: CharacterClass['spellcasting'],
): boolean {
  if (feature.id === 'spellcasting') return true
  return feature.id === 'pact-magic' && spellcasting?.progression === 'pact'
}

function featuresAtLevel(
  features: CharacterClass['features'],
  spellcasting: CharacterClass['spellcasting'],
  level: number,
  subclassingEnabled: boolean,
): string[] {
  const names = features
    .filter((feature) => {
      if (feature.level !== level) return false
      if (isLegacySpellcastingFeature(feature, spellcasting)) return false
      if (!subclassingEnabled && isSubclassChoiceFeatureRow(feature)) return false
      return true
    })
    .map((feature) => feature.name)

  const unlockLevel = spellcastingUnlockLevel(spellcasting)
  if (spellcasting && unlockLevel === level) {
    const label = spellcastingFeatureLabel(spellcasting.progression)
    if (!names.includes(label)) names.push(label)
  }

  return names
}

function buildResourceRow(
  resources: CharacterClass['resources'],
  level: number,
): Record<string, number> | undefined {
  if (!resources) return undefined
  return Object.fromEntries(resources.map((r) => [r.name, fillForward(r.entries, level) ?? 0]))
}

function buildRow(
  level: number,
  characterClass: CharacterClass,
  slotTable: number[][] | undefined,
  subclassingEnabled: boolean,
): ProgressionRow {
  const { features, spellcasting } = characterClass
  const castingActive = isSpellcastingActiveAtLevel(spellcasting, level)
  const cantripsNorm = spellcasting?.cantrips?.map((c) => ({ level: c.level, value: c.known }))
  const spellsAvailableNorm = spellcasting?.spellsAvailable?.map((s) => ({
    level: s.level,
    value: s.count,
  }))
  return {
    level,
    profBonus: proficiencyBonus(level),
    features: featuresAtLevel(features, spellcasting, level, subclassingEnabled),
    resources: buildResourceRow(characterClass.resources, level),
    cantrips: castingActive && cantripsNorm ? fillForward(cantripsNorm, level) : undefined,
    spellsAvailable:
      castingActive && spellsAvailableNorm ? fillForward(spellsAvailableNorm, level) : undefined,
    slots: castingActive ? getSlotRow(slotTable ?? [], level) : undefined,
  }
}

function resourceNamesFrom(characterClass: CharacterClass): string[] {
  return characterClass.resources?.map((r) => r.name) ?? []
}

function slotTableFor(characterClass: CharacterClass): number[][] | undefined {
  return characterClass.spellcasting
    ? SLOT_TABLES[characterClass.spellcasting.progression]
    : undefined
}

function buildRows(
  characterClass: CharacterClass,
  maxCharacterLevel: number,
  subclassingEnabled: boolean,
): ProgressionRow[] {
  const slotTable = slotTableFor(characterClass)
  return Array.from({ length: maxCharacterLevel }, (_, i) =>
    buildRow(i + 1, characterClass, slotTable, subclassingEnabled),
  )
}

function spellsAvailableColumnLabel(preparation: Spellcasting['preparation']): string {
  return preparation === 'known' ? 'Spells Known' : 'Spells Prepared'
}

function hasCantripProgression(rows: ProgressionRow[]): boolean {
  return rows.some((r) => r.cantrips !== undefined)
}

function hasSpellsAvailableProgression(
  preparation: Spellcasting['preparation'] | undefined,
  rows: ProgressionRow[],
): boolean {
  return preparation !== 'full_list' && rows.some((r) => r.spellsAvailable !== undefined)
}

function slotLevelRange(characterClass: CharacterClass): number[] {
  const maxSlotCols =
    slotTableFor(characterClass)?.reduce((max, row) => Math.max(max, row.length), 0) ?? 0
  return Array.from({ length: maxSlotCols }, (_, i) => i + 1)
}

type ColumnFlags = {
  resourceNames: string[]
  showCantrips: boolean
  showSpellsAvailable: boolean
  spellsAvailableLabel: string
  slotLevels: number[]
}

function buildColumnFlags(characterClass: CharacterClass, rows: ProgressionRow[]): ColumnFlags {
  const preparation = characterClass.spellcasting?.preparation

  return {
    resourceNames: resourceNamesFrom(characterClass),
    showCantrips: hasCantripProgression(rows),
    showSpellsAvailable: hasSpellsAvailableProgression(preparation, rows),
    spellsAvailableLabel: preparation ? spellsAvailableColumnLabel(preparation) : 'Spells Prepared',
    slotLevels: slotLevelRange(characterClass),
  }
}

function columnCount(flags: ColumnFlags): number {
  return (
    3 +
    flags.resourceNames.length +
    (flags.showCantrips ? 1 : 0) +
    (flags.showSpellsAvailable ? 1 : 0) +
    flags.slotLevels.length
  )
}

function ResourceCell({ resources, name }: { resources?: Record<string, number>; name: string }) {
  const value = resources?.[name]
  return <TableCell className="text-center">{value !== undefined ? value : '—'}</TableCell>
}

function SlotCell({ slots, slotIndex }: { slots?: number[]; slotIndex: number }) {
  const count = slots ? (slots[slotIndex] ?? 0) : 0
  return <TableCell className="text-center">{count > 0 ? count : '—'}</TableCell>
}

function ProgressionTableHeader({
  resourceNames,
  showCantrips,
  showSpellsAvailable,
  spellsAvailableLabel,
  slotLevels,
}: ColumnFlags) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-14">Level</TableHead>
        <TableHead className="w-20">Prof. Bonus</TableHead>
        <TableHead>Class Features</TableHead>
        {resourceNames.map((name) => (
          <TableHead key={name} className="w-24 text-center">
            {name}
          </TableHead>
        ))}
        {showCantrips && <TableHead className="w-20 text-center">Cantrips</TableHead>}
        {showSpellsAvailable && (
          <TableHead className="w-24 text-center">{spellsAvailableLabel}</TableHead>
        )}
        {slotLevels.map((sl) => (
          <TableHead key={sl} className="w-16 text-center">
            {formatSpellLevel(sl)}-level Slots
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

function OptionalCell({ show, value }: { show: boolean; value: number | undefined }) {
  if (!show) return null
  return <TableCell className="text-center">{value ?? '—'}</TableCell>
}

function ProgressionBodyRow({
  row,
  resourceNames,
  showCantrips,
  showSpellsAvailable,
  slotLevels,
}: { row: ProgressionRow } & Pick<
  ColumnFlags,
  'resourceNames' | 'showCantrips' | 'showSpellsAvailable' | 'slotLevels'
>) {
  const featuresText = row.features.length > 0 ? row.features.join(', ') : '—'
  return (
    <TableRow>
      <TableCell className="font-medium">{row.level}</TableCell>
      <TableCell>+{row.profBonus}</TableCell>
      <TableCell>{featuresText}</TableCell>
      {resourceNames.map((name) => (
        <ResourceCell key={name} resources={row.resources} name={name} />
      ))}
      <OptionalCell show={showCantrips} value={row.cantrips} />
      <OptionalCell show={showSpellsAvailable} value={row.spellsAvailable} />
      {slotLevels.map((sl) => (
        <SlotCell key={sl} slots={row.slots} slotIndex={sl - 1} />
      ))}
    </TableRow>
  )
}

function TierSeparatorRow({ tierName, colSpan }: { tierName: string; colSpan: number }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="border-border border-y bg-surface-muted py-2 text-center text-sm font-medium"
      >
        {tierName}
      </TableCell>
    </TableRow>
  )
}

type ClassProgressionTableProps = {
  characterClass: CharacterClass
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
  campaignRules,
  maxCharacterLevel,
}: ClassProgressionTableProps) {
  const rules = campaignRules ?? {
    ...DEFAULT_CAMPAIGN_RULES,
    maxCharacterLevel: maxCharacterLevel ?? MAX_CHARACTER_LEVEL,
  }
  const rows = buildRows(characterClass, rules.maxCharacterLevel, rules.subclassing.enabled)
  const flags = buildColumnFlags(characterClass, rows)
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
                <TierSeparatorRow
                  key={`tier-separator-${extended.tierName}`}
                  tierName={`${extended.tierName} Tier`}
                  colSpan={colSpan}
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
