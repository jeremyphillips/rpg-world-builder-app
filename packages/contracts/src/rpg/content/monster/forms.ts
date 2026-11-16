import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'
import { creatureFormsDraftSchema, creatureFormsSchema } from '../creature/forms'

/**
 * Monster stat-block host for alternate forms.
 * Presentation (`differencesPresentation`) is added with movement and speech.
 */
export const monsterFormsSchema = creatureFormsSchema
export const monsterFormsDraftSchema = creatureFormsDraftSchema

export type MonsterForms = z.infer<typeof monsterFormsSchema>

type FormIdentity = { id: string; name?: string }

export function refineMonsterFormIdentity(
  forms: { trueForm: FormIdentity; alternates: readonly FormIdentity[] },
  ctx: z.RefinementCtx,
  prefix: (string | number)[] = [],
): void {
  const identities = [forms.trueForm, ...forms.alternates]
  const seenIds = new Set<string>()
  const seenNames = new Set<string>()
  identities.forEach((form, index) => {
    const path =
      index === 0 ? [...prefix, 'forms', 'trueForm'] : [...prefix, 'forms', 'alternates', index - 1]
    if (seenIds.has(form.id)) {
      addCustomRefinementIssue(ctx, 'Form ids must be unique.', [...path, 'id'])
    }
    seenIds.add(form.id)
    const name = form.name?.trim().toLowerCase()
    if (!name) return
    if (seenNames.has(name)) {
      addCustomRefinementIssue(ctx, 'Form names must be unique.', [...path, 'name'])
    }
    seenNames.add(name)
  })
}
