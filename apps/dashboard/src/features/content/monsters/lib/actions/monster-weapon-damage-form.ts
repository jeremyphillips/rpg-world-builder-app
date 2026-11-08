import {
  joinSignedRollFlat,
  splitSignedRollFlat,
  type RollFlatOperator,
  type RollValue,
} from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rollFlatOperator(value: unknown): RollFlatOperator | undefined {
  return value === '+' || value === '-' ? value : undefined
}

/** Contract `flat` becomes the operator and amount the roll control edits. */
export function mapWeaponActionDamageToForm<T>(action: T): T {
  if (!isRecord(action) || action.kind !== 'weapon' || !isRecord(action.damage)) return action
  const damage = action.damage
  if (typeof damage.flat !== 'number') return action
  if (damage.flatOperator !== undefined || damage.flatAmount !== undefined) return action
  const split = splitSignedRollFlat(damage.flat)
  const { flat: _flat, ...rest } = damage
  return { ...action, damage: { ...rest, ...split } }
}

function draftDice(
  damage: Record<string, unknown>,
): { count?: number; faces?: number } | undefined {
  if (!isRecord(damage.dice)) return undefined
  const dice: { count?: number; faces?: number } = {}
  if (typeof damage.dice.count === 'number') dice.count = damage.dice.count
  if (typeof damage.dice.faces === 'number') dice.faces = damage.dice.faces
  return Object.keys(dice).length > 0 ? dice : undefined
}

function draftFlat(damage: Record<string, unknown>): number | undefined {
  const joined = joinSignedRollFlat(
    rollFlatOperator(damage.flatOperator),
    typeof damage.flatAmount === 'number' ? damage.flatAmount : undefined,
  )
  if (joined !== undefined) return joined
  return typeof damage.flat === 'number' ? damage.flat : undefined
}

/**
 * Form roll paths become the draft weapon damage object.
 * An empty object stays present so an opened override is not dropped.
 */
export function weaponActionDamageToDraft(damage: unknown): Record<string, unknown> {
  if (!isRecord(damage)) return {}
  const dice = draftDice(damage)
  const flat = draftFlat(damage)
  return {
    ...(dice ? { dice } : {}),
    ...(flat !== undefined ? { flat } : {}),
  }
}

/** Catalog base roll when dice are complete or the roll is flat-only. */
export function catalogBaseRoll(damage: unknown): RollValue | undefined {
  if (!isRecord(damage)) return undefined
  const dice = isRecord(damage.dice) ? damage.dice : undefined
  const count = dice?.count
  const faces = dice?.faces
  const flat = typeof damage.flat === 'number' ? damage.flat : undefined
  const completeDice = typeof count === 'number' && typeof faces === 'number'
  if (!completeDice && flat === undefined) return undefined
  const roll: RollValue = {}
  if (completeDice) roll.dice = { count, faces: faces as NonNullable<RollValue['dice']>['faces'] }
  if (flat !== undefined) roll.flat = flat
  return roll
}
