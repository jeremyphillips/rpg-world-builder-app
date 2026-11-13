import { PARRY_AC_BONUS_MAX, PARRY_AC_BONUS_MIN } from '../../content/monster/action'
import { formatMonsterStatBlockSubject } from './spell-entry-presentation'

function capitalSubject(monsterName: string): string {
  const subject = formatMonsterStatBlockSubject(monsterName)
  return subject.charAt(0).toUpperCase() + subject.slice(1)
}

/** Trigger sentence for a parry. It is not stored on the reaction. */
export function formatMonsterParryTrigger(monsterName: string): string {
  return `${capitalSubject(monsterName)} is hit by a melee attack roll while holding a weapon.`
}

function validAcBonus(acBonus: number | undefined): acBonus is number {
  return (
    typeof acBonus === 'number' &&
    Number.isInteger(acBonus) &&
    acBonus >= PARRY_AC_BONUS_MIN &&
    acBonus <= PARRY_AC_BONUS_MAX
  )
}

/**
 * Response sentence. Omits the on-miss clause when no attack name is resolved.
 * Returns undefined until the AC bonus is a valid integer so a draft does not invent one.
 */
export function formatMonsterParryResponse(args: {
  monsterName: string
  acBonus: number | undefined
  followUpAttackName?: string
}): string | undefined {
  if (!validAcBonus(args.acBonus)) return undefined
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const response = `${capitalSubject(args.monsterName)} adds ${args.acBonus} to its AC against that attack, possibly causing it to miss.`
  if (!args.followUpAttackName) return response
  return `${response} On a miss, ${subject} makes one ${args.followUpAttackName} attack against the triggering creature if within range.`
}
