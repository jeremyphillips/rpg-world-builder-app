import type { MonsterActionSection } from '../action-sections'
import { stripReferencedActionId, type ReferencedActionRow } from './action-references'

export type MonsterActionPlanBody<T extends ReferencedActionRow> = {
  actions?: readonly T[]
  bonusActions?: readonly T[]
  reactions?: readonly T[]
  legendaryActions?:
    | {
        actions?: readonly T[]
        uses?: number
        usesInLair?: number
      }
    | undefined
}

export type MonsterActionRemovalPlan<T extends ReferencedActionRow> = {
  section: MonsterActionSection
  index: number
  next: {
    actions?: T[]
    bonusActions?: T[]
    reactions?: T[]
    /** `null` drops an emptied legendary block. */
    legendaryActions?: MonsterActionPlanBody<T>['legendaryActions'] | null
  }
}

function rowsOf<T extends ReferencedActionRow>(
  body: MonsterActionPlanBody<T>,
  section: MonsterActionSection,
): readonly T[] {
  if (section === 'legendaryActions') return body.legendaryActions?.actions ?? []
  return body[section] ?? []
}

/**
 * Removes one action row. References are stripped only when the row lives in Actions,
 * matching the authoring removal that already did that.
 */
export function planMonsterActionRemoval(
  body: MonsterActionPlanBody<ReferencedActionRow>,
  actionId: string,
): MonsterActionRemovalPlan<ReferencedActionRow> | undefined {
  const sections: MonsterActionSection[] = [
    'actions',
    'bonusActions',
    'reactions',
    'legendaryActions',
  ]
  for (const section of sections) {
    const rows = rowsOf(body, section)
    const index = rows.findIndex((row) => row.id === actionId)
    if (index < 0) continue
    if (section === 'actions') {
      const actions = stripReferencedActionId(rows, actionId).filter((row) => row.id !== actionId)
      const legendaryRows = stripReferencedActionId(body.legendaryActions?.actions ?? [], actionId)
      const reactions = stripReferencedActionId(body.reactions ?? [], actionId)
      const legendaryActions =
        legendaryRows.length === 0
          ? body.legendaryActions
            ? null
            : undefined
          : { ...body.legendaryActions, actions: legendaryRows }
      return {
        section,
        index,
        next: { actions, reactions, legendaryActions },
      }
    }
    const remaining = rows.filter((row) => row.id !== actionId)
    if (section === 'legendaryActions') {
      return {
        section,
        index,
        next: {
          legendaryActions:
            remaining.length === 0 ? null : { ...body.legendaryActions, actions: remaining },
        },
      }
    }
    return { section, index, next: { [section]: remaining } }
  }
  return undefined
}

export function shapeShiftRows(
  body: MonsterActionPlanBody<ReferencedActionRow>,
): { section: MonsterActionSection; row: ReferencedActionRow }[] {
  const sections: MonsterActionSection[] = [
    'actions',
    'bonusActions',
    'reactions',
    'legendaryActions',
  ]
  return sections.flatMap((section) =>
    rowsOf(body, section).flatMap((row) => (row.kind === 'shape-shift' ? [{ section, row }] : [])),
  )
}
