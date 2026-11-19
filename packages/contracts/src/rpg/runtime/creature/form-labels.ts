import type { CreatureFormsDraft } from '../../content/creature/forms'

import { resolveCreatureFormsContext } from './forms'
import { MONSTER_UNTITLED_FORM_LABEL } from '../monster/resolve-monster-entry-heading'

/** Authoritative display labels by form id for monster restriction and heading copy. */
export function monsterFormLabelById(
  forms: CreatureFormsDraft,
  creatureName: string,
): Map<string, string> {
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
