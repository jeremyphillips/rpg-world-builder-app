import type {
  MonsterLegendaryActionsBlock,
  MonsterLegendaryActionsBlockDraft,
} from './action/legendary-schema'
import { MONSTER_ACTION_SECTIONS, type MonsterActionSection } from './action-sections'

type ActionRow = { id?: string; kind?: string; [key: string]: unknown }

export type MonsterActionSectionBody = {
  actions?: readonly ActionRow[]
  bonusActions?: readonly ActionRow[]
  reactions?: readonly ActionRow[]
  legendaryActions?: MonsterLegendaryActionsBlock | MonsterLegendaryActionsBlockDraft
}

/** Row array for an action section; legendary rows live at `legendaryActions.actions`. */
export function monsterActionSectionRows<T extends ActionRow>(
  body: MonsterActionSectionBody,
  section: MonsterActionSection,
): readonly T[] {
  if (section === 'legendaryActions') {
    return (body.legendaryActions?.actions ?? []) as unknown as readonly T[]
  }
  return (body[section] ?? []) as unknown as readonly T[]
}

/** Issue and validation path prefix for a row in the given section. */
export function monsterActionSectionRowPath(
  section: MonsterActionSection,
  ...suffix: (string | number)[]
): (string | number)[] {
  if (section === 'legendaryActions') {
    return ['legendaryActions', 'actions', ...suffix]
  }
  return [section, ...suffix]
}

export function monsterActionSectionsForEach(
  body: MonsterActionSectionBody,
  visit: (section: MonsterActionSection, rows: readonly ActionRow[]) => void,
): void {
  for (const section of MONSTER_ACTION_SECTIONS) {
    visit(section, monsterActionSectionRows(body, section))
  }
}
