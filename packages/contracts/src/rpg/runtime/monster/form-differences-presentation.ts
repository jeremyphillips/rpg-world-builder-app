import type { FormDifferencesPresentation } from '../../vocab/form-differences-presentation'
import type { CreatureFormsDraft } from '../../content/creature/forms'
import type { MonsterForms } from '../../content/monster/forms'

const STAT_ROWS: FormDifferencesPresentation = 'stat-rows'

type FormsPresentationSource = Pick<MonsterForms, 'differencesPresentation'> | CreatureFormsDraft

/** Stored presentation applies only when a Shape-Shift row exists; otherwise stat rows show differences. */
export function resolveFormDifferencesPresentation(
  forms: FormsPresentationSource | undefined,
  hasShapeShift: boolean,
): FormDifferencesPresentation {
  if (!hasShapeShift) return STAT_ROWS
  const stored =
    forms && 'differencesPresentation' in forms ? forms.differencesPresentation : undefined
  return stored ?? STAT_ROWS
}
