import type { CreatureFormsDraft } from '../../content/creature/forms'
import { monsterFormLabelById } from '../creature/form-labels'
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

/** Semantic heading for one monster action or trait. Formatting stays with `formatMonsterQualifiedHeading`. */
export function resolveMonsterEntryHeading(
  input: ResolveMonsterEntryHeadingInput,
): ResolvedMonsterEntryHeading {
  const name = input.name.trim()
  const ids = input.onlyInFormIds?.filter((id) => id.trim())
  if (!ids || ids.length === 0) return { name }

  const known = input.forms ? monsterFormLabelById(input.forms, input.creatureName) : new Map()
  const formQualifier = formatMonsterFormQualifier(
    ids.map((id) => known.get(id) ?? formatMonsterMissingFormLabel(id)),
  )
  return formQualifier ? { name, formQualifier } : { name }
}
