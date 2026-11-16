import type { MonsterActionSection } from './action-sections'
import { actionsReferencingAction, type ReferencedActionRow } from './action/action-references'
import {
  planMonsterActionRemoval,
  shapeShiftRows,
  type MonsterActionPlanBody,
} from './action/action-removal-plan'

export type FormRestrictedRow = ReferencedActionRow & {
  onlyInFormIds?: readonly string[]
  name?: string
  prerequisite?: string
  description?: string
}

export type FormsRemovalSummary = {
  unrestricted: { id?: string; name?: string }[]
  deletedShapeShifts: {
    id?: string
    section: MonsterActionSection
    hadPrerequisite: boolean
    hadDescription: boolean
  }[]
  strippedReferences: { id?: string; name?: string }[]
  indirectlyAffectedReferences: { id?: string; name?: string }[]
  deletedNotes: string[]
}

type MonsterFormsPlanBody = {
  forms?: { alternates?: readonly { id?: string; name?: string; notes?: string }[] }
  traits?: readonly FormRestrictedRow[]
  actions?: readonly FormRestrictedRow[]
  bonusActions?: readonly FormRestrictedRow[]
  reactions?: readonly FormRestrictedRow[]
  legendaryActions?: MonsterActionPlanBody<FormRestrictedRow>['legendaryActions']
}

type ShapeShiftRemovalResult = {
  working: MonsterActionPlanBody<FormRestrictedRow>
  deletedShapeShifts: FormsRemovalSummary['deletedShapeShifts']
  strippedReferences: FormsRemovalSummary['strippedReferences']
}

function actionRows(body: MonsterActionPlanBody<FormRestrictedRow>): FormRestrictedRow[] {
  return [
    ...(body.actions ?? []),
    ...(body.bonusActions ?? []),
    ...(body.reactions ?? []),
    ...(body.legendaryActions?.actions ?? []),
  ]
}

function removeShapeShifts(
  initial: MonsterActionPlanBody<FormRestrictedRow>,
): ShapeShiftRemovalResult {
  let working = initial
  const deletedShapeShifts: FormsRemovalSummary['deletedShapeShifts'] = []
  const strippedReferences: FormsRemovalSummary['strippedReferences'] = []

  for (const located of shapeShiftRows(initial)) {
    for (const row of actionsReferencingAction(actionRows(working), located.row.id ?? '')) {
      strippedReferences.push({ id: row.id, name: row.name })
    }
    deletedShapeShifts.push({
      id: located.row.id,
      section: located.section,
      hadPrerequisite: Boolean(located.row.prerequisite),
      hadDescription: Boolean(located.row.description),
    })
    const plan = planMonsterActionRemoval(working, located.row.id ?? '')
    if (plan) {
      working = {
        actions: plan.next.actions ?? working.actions,
        bonusActions: plan.next.bonusActions ?? working.bonusActions,
        reactions: plan.next.reactions ?? working.reactions,
        legendaryActions:
          plan.next.legendaryActions === null
            ? undefined
            : (plan.next.legendaryActions ?? working.legendaryActions),
      }
    }
  }

  return { working, deletedShapeShifts, strippedReferences }
}

function dropRestriction(row: FormRestrictedRow): FormRestrictedRow {
  if (!row.onlyInFormIds) return row
  const { onlyInFormIds: _ids, ...rest } = row
  return rest
}

function unrestrictedRows(body: MonsterFormsPlanBody): FormsRemovalSummary['unrestricted'] {
  return [...(body.traits ?? []), ...actionRows(body)].flatMap((row) =>
    row.onlyInFormIds && row.onlyInFormIds.length > 0 ? [{ id: row.id, name: row.name }] : [],
  )
}

function indirectlyAffectedReferences(
  body: MonsterFormsPlanBody,
  unrestricted: FormsRemovalSummary['unrestricted'],
): FormsRemovalSummary['indirectlyAffectedReferences'] {
  const rows = actionRows(body)
  return unrestricted.flatMap((target) =>
    target.id
      ? actionsReferencingAction(rows, target.id).map((row) => ({
          id: row.id,
          name: row.name,
        }))
      : [],
  )
}

function deletedFormNotes(body: MonsterFormsPlanBody): string[] {
  return (body.forms?.alternates ?? []).flatMap((form) =>
    form.notes ? [form.name?.trim() || form.id || 'Untitled form'] : [],
  )
}

export function planMonsterFormsRemoval(body: MonsterFormsPlanBody): {
  next: {
    forms: undefined
    traits: FormRestrictedRow[]
    actions: FormRestrictedRow[]
    bonusActions: FormRestrictedRow[]
    reactions: FormRestrictedRow[]
    legendaryActions: MonsterActionPlanBody<FormRestrictedRow>['legendaryActions'] | null
  }
  summary: FormsRemovalSummary
} {
  const removal = removeShapeShifts({
    actions: body.actions ?? [],
    bonusActions: body.bonusActions ?? [],
    reactions: body.reactions ?? [],
    legendaryActions: body.legendaryActions,
  })
  const unrestricted = unrestrictedRows(body)
  return {
    next: {
      forms: undefined,
      traits: (body.traits ?? []).map(dropRestriction),
      actions: (removal.working.actions ?? []).map(dropRestriction),
      bonusActions: (removal.working.bonusActions ?? []).map(dropRestriction),
      reactions: (removal.working.reactions ?? []).map(dropRestriction),
      legendaryActions: removal.working.legendaryActions
        ? {
            ...removal.working.legendaryActions,
            actions: (removal.working.legendaryActions.actions ?? []).map(dropRestriction),
          }
        : null,
    },
    summary: {
      unrestricted,
      deletedShapeShifts: removal.deletedShapeShifts,
      strippedReferences: removal.strippedReferences,
      indirectlyAffectedReferences: indirectlyAffectedReferences(body, unrestricted),
      deletedNotes: deletedFormNotes(body),
    },
  }
}
