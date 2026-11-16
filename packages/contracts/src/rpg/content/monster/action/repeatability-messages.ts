import { getMonsterActionKindLabel } from '../../../vocab/monster-action-kind'

export const MONSTER_WEAPON_EQUIPMENT_DUPLICATE_MESSAGE =
  'Each equipped weapon can have only one weapon action.'

export const MONSTER_NATURAL_FORM_DUPLICATE_MESSAGE =
  'Each natural attack form can be defined only once.'

export const MONSTER_CONSTRICT_PRESET_DUPLICATE_MESSAGE = 'Only one Constrict action is allowed.'

const SINGLETON_KIND_LABELS: Record<string, string> = {
  multiattack: getMonsterActionKindLabel('multiattack'),
  leap: getMonsterActionKindLabel('leap'),
  teleport: getMonsterActionKindLabel('teleport'),
  'take-actions': getMonsterActionKindLabel('take-actions'),
  parry: getMonsterActionKindLabel('parry'),
}

export function monsterSingletonKindMessage(kind: string): string {
  const label = SINGLETON_KIND_LABELS[kind] ?? getMonsterActionKindLabel(kind)
  return `Only one ${label} action is allowed.`
}
