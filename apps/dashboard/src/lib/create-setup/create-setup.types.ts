import type { NumberStepperDigits, RadioCardOption, RadioCardOptionGroup } from '@rpg/ui'

export type CreateSetupSequenceItem = {
  id: string
  isComplete: boolean
  required?: boolean
  /** Upstream set ids — when any change, dependents are reset via `onReset`. */
  dependsOn?: readonly string[]
  /**
   * Presentation: when false, completed visible sets stay expanded.
   * Does not affect `isComplete`. @default true
   */
  collapseWhenComplete?: boolean
}

export type CreateSetupSetBase = {
  id: string
  fieldLabel: string
  /** Optional — radio cards may explain; compact number controls may omit. */
  prompt?: string
  required?: boolean
  dependsOn?: readonly string[]
  collapseWhenComplete?: boolean
  isComplete: boolean
  onReset: () => void
}

export type CreateSetupChoiceSet = CreateSetupSetBase & {
  kind: 'choice'
  options: RadioCardOption[]
  optionGroups?: RadioCardOptionGroup[]
  value: string
  onValueChange: (value: string) => void
}

export type CreateSetupNumberSet = CreateSetupSetBase & {
  kind: 'number'
  value: number
  onValueChange: (value: number) => void
  min: number
  max: number
  digits?: NumberStepperDigits
}

export type CreateSetupNoteSet = CreateSetupSetBase & {
  kind: 'note'
  body: string
  description?: string
}

export type CreateSetupSet = CreateSetupChoiceSet | CreateSetupNumberSet | CreateSetupNoteSet
