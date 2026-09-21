import { formatSpellLevel } from '@rpg/contracts'

export type SpellLevelTabLayoutRow = {
  levels: number[]
  columns: number
}

/** Desktop tab grid templates for unlocked spell levels. */
export function resolveSpellLevelTabLayout(maxLevel: number): SpellLevelTabLayoutRow[] {
  if (maxLevel <= 1) return []

  switch (maxLevel) {
    case 2:
      return [{ levels: [1, 2], columns: 2 }]
    case 3:
      return [{ levels: [1, 2, 3], columns: 3 }]
    case 4:
      return [{ levels: [1, 2, 3, 4], columns: 4 }]
    case 5:
      return [{ levels: [1, 2, 3, 4, 5], columns: 5 }]
    case 6:
      return [
        { levels: [1, 2, 3], columns: 3 },
        { levels: [4, 5, 6], columns: 3 },
      ]
    case 7:
      return [
        { levels: [1, 2, 3, 4], columns: 4 },
        { levels: [5, 6, 7], columns: 3 },
      ]
    case 8:
      return [
        { levels: [1, 2, 3, 4], columns: 4 },
        { levels: [5, 6, 7, 8], columns: 4 },
      ]
    case 9:
      return [
        { levels: [1, 2, 3, 4, 5], columns: 5 },
        { levels: [6, 7, 8, 9], columns: 4 },
      ]
    default:
      return resolveNarrowSpellLevelTabLayout(maxLevel)
  }
}

/** Narrow fallback — three tabs per row. */
export function resolveNarrowSpellLevelTabLayout(maxLevel: number): SpellLevelTabLayoutRow[] {
  const rows: SpellLevelTabLayoutRow[] = []
  for (let level = 1; level <= maxLevel; level += 3) {
    const levels = [level, level + 1, level + 2].filter((entry) => entry <= maxLevel)
    rows.push({ levels, columns: levels.length })
  }
  return rows
}

export function formatSpellLevelTabOrdinal(level: number): string {
  return formatSpellLevel(level)
}

export function formatSpellLevelTabLevelLabel(level: number): string {
  return `${formatSpellLevelTabOrdinal(level)} level`
}

export const SPELL_LEVEL_TABS_HEADING = 'Choose spells by level' as const

export const SPELL_LEVEL_TABS_SUBHEAD =
  'Choose spells by level. Use the level tabs below to review progress.' as const

export function formatSpellLevelTabsRangeHeading(minLevel: number, maxLevel: number): string {
  if (minLevel === maxLevel) {
    return `${formatSpellLevel(minLevel)}-Level Spells`
  }
  return `${formatSpellLevel(minLevel)}–${formatSpellLevel(maxLevel)}-Level Spells`
}
