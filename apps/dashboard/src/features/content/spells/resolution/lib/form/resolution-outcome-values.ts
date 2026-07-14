import type { SpellResolution } from '@rpg/contracts'

import {
  buildDefaultOutcomeFormSlots,
  formOutcomesToStoredShape,
  hydrateOutcomeFormSlots,
  resolutionMethodFromForm,
  storedOutcomesToFormSlots,
} from './resolution-outcome-slots.lib'
import type { ResolutionFormValues, ResolutionOutcomeFormItem } from './resolution-form-schema'

export function buildOutcomes(
  values: ResolutionFormValues,
): SpellResolution['outcomes'] | undefined {
  const method = resolutionMethodFromForm(values)
  if (!method) return undefined

  const fromForm = formOutcomesToStoredShape(method, values.outcomes)
  if (fromForm?.length) return fromForm

  const defaults = buildDefaultOutcomeFormSlots(values)
  return formOutcomesToStoredShape(method, defaults)
}

export function storedOutcomesToForm(
  method: SpellResolution['method'],
  outcomes: SpellResolution['outcomes'],
): ResolutionOutcomeFormItem[] {
  return storedOutcomesToFormSlots(method, outcomes)
}

export function ensureFormOutcomeSlots(values: ResolutionFormValues): ResolutionOutcomeFormItem[] {
  const method = resolutionMethodFromForm(values)
  if (!method) return values.outcomes ?? []

  const current = values.outcomes ?? buildDefaultOutcomeFormSlots(values) ?? []
  return hydrateOutcomeFormSlots(method, current)
}
