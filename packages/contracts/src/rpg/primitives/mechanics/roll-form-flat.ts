export const ROLL_FLAT_OPERATORS = ['+', '-'] as const

export type RollFlatOperator = (typeof ROLL_FLAT_OPERATORS)[number]

const EMPTY_NUMBER_SENTINEL = '' as unknown as number

export function isRollFlatAmountPresent(amount: unknown): boolean {
  return (
    amount !== undefined && amount !== null && amount !== EMPTY_NUMBER_SENTINEL && amount !== ''
  )
}

/** Splits signed contract `flat` into form-only operator + unsigned amount. */
export function splitSignedRollFlat(flat: number | undefined): {
  flatOperator: RollFlatOperator
  flatAmount?: number
} {
  if (flat === undefined) {
    return { flatOperator: '+' }
  }

  return {
    flatOperator: flat >= 0 ? '+' : '-',
    flatAmount: Math.abs(flat),
  }
}

/** Joins form operator + unsigned amount into signed contract `flat`. */
export function joinSignedRollFlat(
  operator: RollFlatOperator | undefined,
  amount: number | undefined,
): number | undefined {
  if (!isRollFlatAmountPresent(amount)) return undefined

  const magnitude = Math.abs(Number(amount))
  if (magnitude === 0) return undefined

  return operator === '-' ? -magnitude : magnitude
}
