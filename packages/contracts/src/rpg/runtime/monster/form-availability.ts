import { joinNaturalList } from '../../primitives/prose'
import type { CreatureFormsDraft } from '../../content/creature/forms'
import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../../content/monster/action-sections'
import { resolveCreatureFormsContext } from '../creature/forms'

type FormAvailabilityRow = {
  id?: string
  kind?: string
  name?: string
  onlyInFormIds?: readonly string[]
  steps?: readonly {
    actionIds?: readonly string[]
    kind?: string
    actionId?: string
    choices?: readonly { actionId?: string }[]
  }[]
  actionIds?: readonly string[]
  followUpActionId?: string
}

export type FormAvailabilityAdvisory = {
  code: 'form-restricted-reference' | 'form-restricted-multiattack'
  message: string
  path: string
}

type FormAvailabilityBody = {
  name?: string
  forms?: CreatureFormsDraft
  traits?: readonly FormAvailabilityRow[]
  actions?: readonly FormAvailabilityRow[]
  bonusActions?: readonly FormAvailabilityRow[]
  reactions?: readonly FormAvailabilityRow[]
  legendaryActions?: { actions?: readonly FormAvailabilityRow[] } | null
}

function sectionRows(
  body: FormAvailabilityBody,
  section: MonsterActionSection,
): readonly FormAvailabilityRow[] {
  if (section === 'legendaryActions') return body.legendaryActions?.actions ?? []
  return body[section] ?? []
}

function rowPath(section: MonsterActionSection, index: number): string {
  if (section === 'legendaryActions') return `legendaryActions.actions.${index}`
  return `${section}.${index}`
}

/** Absent `onlyInFormIds` is every form. An empty list is available in none. */
export function isMonsterRowAvailableInForm(
  row: { onlyInFormIds?: readonly string[] },
  formId: string,
): boolean {
  if (!row.onlyInFormIds) return true
  return row.onlyInFormIds.includes(formId)
}

function hasRestriction(row: { onlyInFormIds?: readonly string[] }): boolean {
  return Array.isArray(row.onlyInFormIds) && row.onlyInFormIds.length > 0
}

/** True when a trait or action prints a form qualifier. */
export function monsterHasFormRestrictions(body: FormAvailabilityBody): boolean {
  const traitRestricted = (body.traits ?? []).some(hasRestriction)
  if (traitRestricted) return true
  return MONSTER_ACTION_SECTIONS.some((section) => sectionRows(body, section).some(hasRestriction))
}

function actionIndex(body: FormAvailabilityBody): Map<string, FormAvailabilityRow> {
  const index = new Map<string, FormAvailabilityRow>()
  for (const section of MONSTER_ACTION_SECTIONS) {
    for (const row of sectionRows(body, section)) {
      if (row.id) index.set(row.id, row)
    }
  }
  return index
}

type MultiattackStepRow = NonNullable<FormAvailabilityRow['steps']>[number]

/** Action ids referenced by one Multiattack step (attack group or use clause). */
export function multiattackStepReferencedActionIds(step: MultiattackStepRow): readonly string[] {
  if (step.actionIds?.length) return step.actionIds
  if (step.kind === 'use' && step.actionId) return [step.actionId]
  if (step.kind === 'use' && step.choices) {
    return step.choices.flatMap((choice) => (choice.actionId ? [choice.actionId] : []))
  }
  return []
}

function referencedIds(row: FormAvailabilityRow): readonly string[] {
  if (row.kind === 'multiattack') {
    return (row.steps ?? []).flatMap((step) => multiattackStepReferencedActionIds(step))
  }
  if (row.kind === 'action-reference') return row.actionIds ?? []
  if (row.kind === 'parry' && row.followUpActionId) return [row.followUpActionId]
  return []
}

type EligibleForm = { id: string; name: string }

function eligibleForms(body: FormAvailabilityBody): EligibleForm[] {
  if (!body.forms) return []
  const context = resolveCreatureFormsContext(body.forms, body.name ?? '')
  if (context.status !== 'complete') return []
  return context.eligibleForms.flatMap((form) =>
    form.id ? [{ id: form.id, name: form.name.trim() || form.id }] : [],
  )
}

function formsWhere(
  forms: readonly EligibleForm[],
  predicate: (form: EligibleForm) => boolean,
): EligibleForm[] {
  return forms.filter(predicate)
}

function appendMultiattackAdvisories(
  advisories: FormAvailabilityAdvisory[],
  row: FormAvailabilityRow,
  path: string,
  forms: readonly EligibleForm[],
  actions: ReadonlyMap<string, FormAvailabilityRow>,
): void {
  if (row.kind !== 'multiattack') return
  for (const step of row.steps ?? []) {
    const targets = multiattackStepReferencedActionIds(step).flatMap((id) => {
      const target = actions.get(id)
      return target ? [target] : []
    })
    if (targets.length === 0) continue
    const blocked = formsWhere(
      forms,
      (form) =>
        isMonsterRowAvailableInForm(row, form.id) &&
        targets.every((target) => !isMonsterRowAvailableInForm(target, form.id)),
    )
    if (blocked.length === 0) continue
    advisories.push({
      code: 'form-restricted-multiattack',
      message: `In ${joinNaturalList(
        blocked.map((form) => form.name),
        { conjunction: 'or' },
      )} form, this multiattack has no eligible attack.`,
      path,
    })
  }
}

function appendReferenceAdvisories(
  advisories: FormAvailabilityAdvisory[],
  row: FormAvailabilityRow,
  path: string,
  forms: readonly EligibleForm[],
  actions: ReadonlyMap<string, FormAvailabilityRow>,
): void {
  if (row.kind !== 'action-reference' && row.kind !== 'parry') return
  for (const targetId of referencedIds(row)) {
    const target = actions.get(targetId)
    if (!target) continue
    const blocked = formsWhere(
      forms,
      (form) =>
        isMonsterRowAvailableInForm(row, form.id) && !isMonsterRowAvailableInForm(target, form.id),
    )
    if (blocked.length === 0) continue
    const targetName = target.name?.trim() || 'This action'
    advisories.push({
      code: 'form-restricted-reference',
      message: `${targetName} is unavailable in ${joinNaturalList(
        blocked.map((form) => form.name),
        { conjunction: 'or' },
      )} form, where this action is available.`,
      path,
    })
  }
}

/**
 * One level of form compatibility. A row stays stored as authored.
 * Multiattack needs one eligible alternative in each form that can use it.
 * Legendary and reaction references, including Parry follow-ups, warn when
 * their target is missing from a form where the reference itself is available.
 */
export function collectFormAvailabilityAdvisories(
  body: FormAvailabilityBody,
): FormAvailabilityAdvisory[] {
  const forms = eligibleForms(body)
  if (forms.length === 0) return []
  const actions = actionIndex(body)
  const advisories: FormAvailabilityAdvisory[] = []
  for (const section of MONSTER_ACTION_SECTIONS) {
    sectionRows(body, section).forEach((row, index) => {
      const path = rowPath(section, index)
      appendMultiattackAdvisories(advisories, row, path, forms, actions)
      if (section === 'reactions' || section === 'legendaryActions') {
        appendReferenceAdvisories(advisories, row, path, forms, actions)
      }
    })
  }
  return advisories
}
