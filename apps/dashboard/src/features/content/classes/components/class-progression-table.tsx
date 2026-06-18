import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@rpg/ui'
import { proficiencyBonus, SLOT_TABLES, MAX_CHARACTER_LEVEL } from '@rpg/contracts'
import type { CharacterClass } from '@rpg/contracts'

type ProgressionRow = {
  level: number
  profBonus: number
  features: string[]
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
    cantrips: cantripsNorm ? fillForward(cantripsNorm, level) : undefined,
    spellsPrepared: preparedNorm ? fillForward(preparedNorm, level) : undefined,
    slots: slotTable?.[level - 1],
  }
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

type ClassProgressionTableProps = {
  characterClass: CharacterClass
}

export function ClassProgressionTable({ characterClass }: ClassProgressionTableProps) {
  const rows = buildRows(characterClass)
  const showCantrips = rows.some((r) => r.cantrips !== undefined)
  const showPrepared = rows.some((r) => r.spellsPrepared !== undefined)
  const slotTable = characterClass.spellcasting
    ? SLOT_TABLES[characterClass.spellcasting.progression]
    : undefined
  const maxSlotCols = slotTable ? Math.max(...slotTable.map((r) => r.length)) : 0
  const slotLevels = Array.from({ length: maxSlotCols }, (_, i) => i + 1)

  return (
    <section aria-labelledby="progression-heading">
      <h3 id="progression-heading" className="mb-4 text-xl font-semibold tracking-tight">
        Class Progression
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Level</TableHead>
            <TableHead className="w-20">Prof. Bonus</TableHead>
            <TableHead>Class Features</TableHead>
            {showCantrips && <TableHead className="w-20 text-center">Cantrips</TableHead>}
            {showPrepared && <TableHead className="w-24 text-center">Spells Prepared</TableHead>}
            {slotLevels.map((sl) => (
              <TableHead key={sl} className="w-16 text-center">
                {ordinal(sl)}-level Slots
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.level}>
              <TableCell className="font-medium">{row.level}</TableCell>
              <TableCell>+{row.profBonus}</TableCell>
              <TableCell>{row.features.length > 0 ? row.features.join(', ') : '—'}</TableCell>
              {showCantrips && <TableCell className="text-center">{row.cantrips ?? '—'}</TableCell>}
              {showPrepared && (
                <TableCell className="text-center">{row.spellsPrepared ?? '—'}</TableCell>
              )}
              {slotLevels.map((sl) => {
                const count = row.slots ? (row.slots[sl - 1] ?? 0) : 0
                return (
                  <TableCell key={sl} className="text-center">
                    {count > 0 ? count : '—'}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
