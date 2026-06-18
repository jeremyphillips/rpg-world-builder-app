import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@rpg/ui'
import { proficiencyBonus, SLOT_TABLES, MAX_CHARACTER_LEVEL } from '@rpg/contracts'
import type { CharacterClass } from '@rpg/contracts'

type ProgressionRow = {
  level: number
  profBonus: number
  features: string[]
  resources?: Record<string, number>
  cantrips?: number
  spellsPrepared?: number
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

function featuresAtLevel(
  features: CharacterClass['features'],
  asiLevels: number[],
  subclassLevels: number[],
  level: number,
): string[] {
  const names = features.filter((f) => f.level === level).map((f) => f.name)
  if (asiLevels.includes(level)) names.push('Ability Score Improvement')
  if (subclassLevels.includes(level)) names.push('Subclass Feature')
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
): ProgressionRow {
  const { features, asiLevels, subclassLevels, spellcasting } = characterClass
  const cantripsNorm = spellcasting?.cantrips?.map((c) => ({ level: c.level, value: c.known }))
  const preparedNorm = spellcasting?.spellsPrepared?.map((s) => ({
    level: s.level,
    value: s.prepared,
  }))
  return {
    level,
    profBonus: proficiencyBonus(level),
    features: featuresAtLevel(features, asiLevels, subclassLevels, level),
    resources: buildResourceRow(characterClass.resources, level),
    cantrips: cantripsNorm ? fillForward(cantripsNorm, level) : undefined,
    spellsPrepared: preparedNorm ? fillForward(preparedNorm, level) : undefined,
    slots: slotTable?.[level - 1],
  }
}

function resourceNamesFrom(characterClass: CharacterClass): string[] {
  return characterClass.resources?.map((r) => r.name) ?? []
}

function buildRows(characterClass: CharacterClass): ProgressionRow[] {
  const slotTable = characterClass.spellcasting
    ? SLOT_TABLES[characterClass.spellcasting.progression]
    : undefined
  return Array.from({ length: MAX_CHARACTER_LEVEL }, (_, i) =>
    buildRow(i + 1, characterClass, slotTable),
  )
}

function ordinal(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

type ColumnFlags = {
  resourceNames: string[]
  showCantrips: boolean
  showPrepared: boolean
  slotLevels: number[]
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
  showPrepared,
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
        {showPrepared && <TableHead className="w-24 text-center">Spells Prepared</TableHead>}
        {slotLevels.map((sl) => (
          <TableHead key={sl} className="w-16 text-center">
            {ordinal(sl)}-level Slots
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
  showPrepared,
  slotLevels,
}: { row: ProgressionRow } & ColumnFlags) {
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
      <OptionalCell show={showPrepared} value={row.spellsPrepared} />
      {slotLevels.map((sl) => (
        <SlotCell key={sl} slots={row.slots} slotIndex={sl - 1} />
      ))}
    </TableRow>
  )
}

type ClassProgressionTableProps = {
  characterClass: CharacterClass
}

export function ClassProgressionTable({ characterClass }: ClassProgressionTableProps) {
  const rows = buildRows(characterClass)
  const slotTable = characterClass.spellcasting
    ? SLOT_TABLES[characterClass.spellcasting.progression]
    : undefined
  const maxSlotCols = slotTable ? Math.max(...slotTable.map((r) => r.length)) : 0
  const flags: ColumnFlags = {
    resourceNames: resourceNamesFrom(characterClass),
    showCantrips: rows.some((r) => r.cantrips !== undefined),
    showPrepared: rows.some((r) => r.spellsPrepared !== undefined),
    slotLevels: Array.from({ length: maxSlotCols }, (_, i) => i + 1),
  }

  return (
    <section aria-labelledby="progression-heading">
      <h3 id="progression-heading" className="mb-4 text-xl font-semibold tracking-tight">
        Class Progression
      </h3>
      <Table>
        <ProgressionTableHeader {...flags} />
        <TableBody>
          {rows.map((row) => (
            <ProgressionBodyRow key={row.level} row={row} {...flags} />
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
