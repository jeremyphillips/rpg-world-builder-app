import { joinNaturalList, resolveCreatureFormsContext } from '@rpg/contracts'

import type { MonsterFormValues } from '../monster-form-values'

export function monsterActionShapeShiftDestinationsProse(
  values: MonsterFormValues,
): string | undefined {
  if (!values.forms) return undefined
  const context = resolveCreatureFormsContext(values.forms, values.name)
  if (context.status !== 'complete' || context.alternateDestinations.length === 0) return undefined
  const names = context.alternateDestinations.map((form) => form.name || 'Untitled form')
  return joinNaturalList(names)
}
