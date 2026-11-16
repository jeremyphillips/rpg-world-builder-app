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

export type LegendaryActionsPoolScalars = Pick<
  MonsterLegendaryActionsBlockDraft,
  'uses' | 'usesInLair'
>

/** Parse a persisted or authored legendary block; rejects legacy flat action arrays. */
export function readLegendaryActionsBlockFromUnknown(
  value: unknown,
): (LegendaryActionsPoolScalars & { actions: unknown[] }) | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  return {
    ...(typeof record.uses === 'number' ? { uses: record.uses } : {}),
    ...(typeof record.usesInLair === 'number' ? { usesInLair: record.usesInLair } : {}),
    actions: Array.isArray(record.actions) ? record.actions : [],
  }
}

/** Preserve pool scalars when replacing legendary action rows (form, provenance, casting). */
export function mergeLegendaryActionsBlock<TAction>(
  pool: LegendaryActionsPoolScalars | undefined,
  actions: readonly TAction[],
): MonsterLegendaryActionsBlockDraft {
  return {
    ...(pool?.uses !== undefined ? { uses: pool.uses } : {}),
    ...(pool?.usesInLair !== undefined ? { usesInLair: pool.usesInLair } : {}),
    actions: [...actions] as MonsterLegendaryActionsBlockDraft['actions'],
  }
}
