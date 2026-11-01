import { getAbilitySentenceForm } from '@rpg/contracts'

function abilitySentence(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? getAbilitySentenceForm(value) : undefined
}

export function monsterSaveAbilityHintWhen(values: Record<string, unknown>): string {
  const roll = abilitySentence(values['resolution.method.ability']) ?? '…'
  return `Targets roll a ${roll} saving throw against the DC below.`
}

export function monsterSaveDcAbilityHintWhen(values: Record<string, unknown>): string {
  const modifierAbility = abilitySentence(values['dcSource.ability']) ?? '…'
  return `The DC uses the creature's ${modifierAbility} modifier and, when enabled, its proficiency bonus.`
}
