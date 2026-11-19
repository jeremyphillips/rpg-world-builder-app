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
  forms?: {
    profileFormId: string
    trueForm: { kind: 'profile'; name?: string } | { kind: 'defined'; formId?: string }
    definedForms: readonly {
      id: string
      name?: string
      notes?: string
      overrides?: { sizes?: readonly string[] }
    }[]
  }
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
  return (body.forms?.definedForms ?? []).flatMap((form) =>
    form.notes ? [form.name?.trim() || form.id || 'Untitled form'] : [],
  )
}

function formLabel(body: MonsterFormsPlanBody, formId: string): string {
  const forms = body.forms
  if (!forms) return formId
  if (formId === forms.profileFormId) {
    return forms.trueForm.kind === 'profile' && forms.trueForm.name?.trim()
      ? forms.trueForm.name.trim()
      : 'Creature profile'
  }
  return forms.definedForms.find((form) => form.id === formId)?.name?.trim() || 'Untitled form'
}

export type DefinedFormRemovalSummary = {
  removedForm: { id: string; name?: string }
  wasTrueForm: boolean
  deletedNote: boolean
  strippedReferences: { id?: string; name?: string }[]
  rowsLosingForm: { id?: string; name?: string; remainingFormNames: string[] }[]
  indirectlyAffectedReferences: { id?: string; name?: string }[]
}

function rowsLosingForm(
  body: MonsterFormsPlanBody,
  formId: string,
): DefinedFormRemovalSummary['rowsLosingForm'] {
  return [...(body.traits ?? []), ...actionRows(body)].flatMap((row) => {
    if (!row.onlyInFormIds?.includes(formId)) return []
    const remaining = row.onlyInFormIds.filter((id) => id !== formId)
    return [
      {
        id: row.id,
        name: row.name,
        remainingFormNames: remaining.map((id) => formLabel(body, id)),
      },
    ]
  })
}

function stripFormId(row: FormRestrictedRow, formId: string): FormRestrictedRow {
  if (!row.onlyInFormIds?.includes(formId)) return row
  return { ...row, onlyInFormIds: row.onlyInFormIds.filter((id) => id !== formId) }
}

function mapFormReferences(
  body: MonsterFormsPlanBody,
  formId: string,
): Pick<
  MonsterFormsPlanBody,
  'traits' | 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions'
> {
  return {
    traits: (body.traits ?? []).map((row) => stripFormId(row, formId)),
    actions: (body.actions ?? []).map((row) => stripFormId(row, formId)),
    bonusActions: (body.bonusActions ?? []).map((row) => stripFormId(row, formId)),
    reactions: (body.reactions ?? []).map((row) => stripFormId(row, formId)),
    legendaryActions: body.legendaryActions
      ? {
          ...body.legendaryActions,
          actions: (body.legendaryActions.actions ?? []).map((row) => stripFormId(row, formId)),
        }
      : undefined,
  }
}

export function planMonsterTrueFormDesignation(
  body: MonsterFormsPlanBody & { forms: NonNullable<MonsterFormsPlanBody['forms']> },
  trueForm: NonNullable<MonsterFormsPlanBody['forms']>['trueForm'],
) {
  const leavingProfile = body.forms.trueForm.kind === 'profile' && trueForm.kind === 'defined'
  const profileName = body.forms.trueForm.kind === 'profile' ? body.forms.trueForm.name : undefined
  const strippedProfileReferences = leavingProfile
    ? [...(body.traits ?? []), ...actionRows(body)].filter((row) =>
        row.onlyInFormIds?.includes(body.forms.profileFormId),
      )
    : []
  const references = leavingProfile ? mapFormReferences(body, body.forms.profileFormId) : body
  const definedForms = body.forms.definedForms.map((form) =>
    trueForm.kind === 'defined' && form.id === trueForm.formId ? { ...form, overrides: {} } : form,
  )
  return {
    next: {
      ...references,
      forms: { ...body.forms, trueForm, definedForms },
    },
    summary: {
      removedProfileName: leavingProfile && Boolean(profileName),
      strippedProfileReferences: strippedProfileReferences.map((row) => ({
        id: row.id,
        name: row.name,
      })),
      indirectlyAffectedReferences: indirectlyAffectedReferences(body, strippedProfileReferences),
      clearedOverrideLabels:
        trueForm.kind === 'defined'
          ? body.forms.definedForms
              .filter((form) => form.id === trueForm.formId)
              .flatMap((form) => (form.overrides?.sizes ? ['Sizes'] : []))
          : [],
    },
  }
}

export function planMonsterDefinedFormRemoval(
  body: MonsterFormsPlanBody & { forms: NonNullable<MonsterFormsPlanBody['forms']> },
  formId: string,
) {
  const form = body.forms.definedForms.find((entry) => entry.id === formId)
  if (!form) return undefined
  const references = mapFormReferences(body, formId)
  const wasTrue = body.forms.trueForm.kind === 'defined' && body.forms.trueForm.formId === formId
  const losingForm = rowsLosingForm(body, formId)
  const emptied = losingForm.filter((row) => row.remainingFormNames.length === 0)
  return {
    next: {
      ...references,
      forms: {
        ...body.forms,
        trueForm: wasTrue ? ({ kind: 'profile' } as const) : body.forms.trueForm,
        definedForms: body.forms.definedForms.filter((entry) => entry.id !== formId),
      },
    },
    summary: {
      removedForm: { id: form.id, name: form.name },
      wasTrueForm: wasTrue,
      deletedNote: Boolean(form.notes),
      strippedReferences: losingForm.map((row) => ({ id: row.id, name: row.name })),
      rowsLosingForm: losingForm,
      indirectlyAffectedReferences: indirectlyAffectedReferences(body, emptied),
    },
  }
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
