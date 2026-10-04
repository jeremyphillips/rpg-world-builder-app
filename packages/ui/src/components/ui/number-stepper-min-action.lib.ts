export type NumberStepperMinAction =
  | {
      mode?: 'disable'
    }
  | {
      mode: 'remove'
      onRemove: () => void
      removeAriaLabel: string
    }

export function resolveNumberStepperMinActionMode(
  minAction: NumberStepperMinAction | undefined,
): 'disable' | 'remove' {
  return minAction?.mode ?? 'disable'
}

export function resolveNumberStepperActions(args: {
  minAction: NumberStepperMinAction | undefined
  min: number
  max: number
  value: number
  disabled: boolean
}) {
  const mode = resolveNumberStepperMinActionMode(args.minAction)
  const canDecrement = args.value > args.min && !args.disabled
  const canIncrement = args.value < args.max && !args.disabled
  const canRemoveAtMin = mode === 'remove' && args.value === args.min && !args.disabled
  const leftDisabled = !canDecrement && !canRemoveAtMin
  const stepperLocked = args.disabled || (!canDecrement && !canRemoveAtMin && !canIncrement)

  return {
    mode,
    canDecrement,
    canIncrement,
    canRemoveAtMin,
    leftDisabled,
    stepperLocked,
  }
}
