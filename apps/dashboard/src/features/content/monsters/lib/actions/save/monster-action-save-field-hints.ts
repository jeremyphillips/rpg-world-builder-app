import { getAbilitySentenceForm } from '@rpg/contracts'

function abilitySentence(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? getAbilitySentenceForm(value) : undefined
}

export function monsterSaveDcAbilityHintWhen(values: Record<string, unknown>): string {
  const modifierAbility = abilitySentence(values['dcSource.ability']) ?? '…'
  return `The DC uses the creature's ${modifierAbility} modifier and, when enabled, its proficiency bonus.`
}
