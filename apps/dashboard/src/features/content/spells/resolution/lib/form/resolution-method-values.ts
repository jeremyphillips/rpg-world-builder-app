import type { SpellResolutionMethod } from '@rpg/contracts'

import type { ResolutionFormValues, ResolutionMethodKind } from './resolution-form-schema'

export function buildResolutionMethod(
  values: ResolutionFormValues,
): SpellResolutionMethod | undefined {
  if (values.methodKind === 'automatic') {
    return { kind: 'automatic' }
  }

  if (values.methodKind === 'attack') {
    if (!values.attackType) return undefined
    return { kind: 'attack', attackType: values.attackType }
  }

  if (!values.saveAbility) return undefined
  return { kind: 'saving-throw', ability: values.saveAbility }
}

export function buildMethodKind(method: SpellResolutionMethod): ResolutionMethodKind {
  if (method.kind === 'automatic') return 'automatic'
  if (method.kind === 'attack') return 'attack'
  return 'saving-throw'
}

export function applyMethodFields(form: ResolutionFormValues, method: SpellResolutionMethod): void {
  if (method.kind === 'attack') {
    form.attackType = method.attackType
    return
  }

  if (method.kind === 'saving-throw') {
    form.saveAbility = method.ability
  }
}
