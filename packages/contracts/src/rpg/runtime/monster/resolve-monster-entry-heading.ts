import type { CreatureFormsDraft } from '../../content/creature/forms'
import { resolveCreatureFormsContext } from '../creature/forms'
import { formatMonsterFormQualifier } from './format-monster-form-qualifier'

export const MONSTER_UNTITLED_FORM_LABEL = 'Untitled form'

export function formatMonsterMissingFormLabel(id: string): string {
  return `Missing form (${id})`
}

export type ResolvedMonsterEntryHeading = {
  name: string
  formQualifier?: string
}

export type ResolveMonsterEntryHeadingInput = {
  /** Base name from the action or trait name authority. Not persisted. */
  name: string
  onlyInFormIds?: readonly string[]
  forms?: CreatureFormsDraft
  creatureName: string
}

function formLabelById(forms: CreatureFormsDraft, creatureName: string): Map<string, string> {
  const context = resolveCreatureFormsContext(forms, creatureName)
  if (context.status === 'invalid') return new Map()
  const names = new Map<string, string>()
  const register = (id: string, label: string) => {
    names.set(id, label.trim() || MONSTER_UNTITLED_FORM_LABEL)
  }
  if (context.profile?.id) register(context.profile.id, context.profile.name)
  for (const form of context.definedForms) register(form.id, form.name)
  return names
}

/** Semantic heading for one monster action or trait. Formatting stays with `formatMonsterQualifiedHeading`. */
export function resolveMonsterEntryHeading(
  input: ResolveMonsterEntryHeadingInput,
): ResolvedMonsterEntryHeading {
  const name = input.name.trim()
  const ids = input.onlyInFormIds?.filter((id) => id.trim())
  if (!ids || ids.length === 0) return { name }

  const known = input.forms ? formLabelById(input.forms, input.creatureName) : new Map()
  const formQualifier = formatMonsterFormQualifier(
    ids.map((id) => known.get(id) ?? formatMonsterMissingFormLabel(id)),
  )
  return formQualifier ? { name, formQualifier } : { name }
}
