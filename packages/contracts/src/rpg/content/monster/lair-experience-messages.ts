import { formatGroupedNumber } from '../../primitives/number-format'

export function monsterLairInLairXpMustExceedBaseMessage(baseXp: number): string {
  return `In-lair XP must exceed the normal XP of ${formatGroupedNumber(baseXp)}.`
}

export function monsterLairCustomXpMinimumHint(baseXp: number): string {
  return `In-lair XP must be greater than ${formatGroupedNumber(baseXp)} XP.`
}
