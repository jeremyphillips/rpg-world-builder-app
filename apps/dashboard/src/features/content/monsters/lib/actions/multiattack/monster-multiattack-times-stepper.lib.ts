import { multiattackPositiveInt } from '@rpg/contracts'

export function multiattackTimesStepperBinding(count: unknown): {
  value: number
  unbound: boolean
} {
  const parsed = multiattackPositiveInt(count)
  if (parsed !== undefined) return { value: parsed, unbound: false }
  return { value: 0, unbound: true }
}
