import type { SpellCastingTime } from '../../vocab/spell/casting-time'
import type { ActionEconomyId } from '../../vocab/action-economy'

export const MONSTER_SECTION_ECONOMY = {
  actions: 'action',
  bonusActions: 'bonus-action',
  reactions: 'reaction',
} as const satisfies Record<'actions' | 'bonusActions' | 'reactions', ActionEconomyId>

export type MonsterActionSectionId = keyof typeof MONSTER_SECTION_ECONOMY

/** Whether a spell's normal casting time can be started by this invoking economy. */
export function isSpellCastingTimeCompatibleWithEconomy(
  castingTime: SpellCastingTime,
  economy: ActionEconomyId,
): boolean {
  const unit = castingTime.normal.unit
  if (economy === 'action') return unit === 'action' || unit === 'minute' || unit === 'hour'
  if (economy === 'bonus-action') return unit === 'bonus-action'
  return unit === 'reaction'
}
