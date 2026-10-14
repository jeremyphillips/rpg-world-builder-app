import type { Ability } from '@rpg/contracts'
import { cn, StatusIcon } from '@rpg/ui'

import {
  MONSTER_SAVE_PROF_LABEL,
  monsterSavingThrowProficiencyAriaLabel,
} from '../../lib/monster-form-labels'

export type MonsterAbilitySaveProficiencyFooterProps = {
  ability: Ability
  proficient: boolean
  disabled?: boolean
  'aria-invalid'?: boolean
  onToggle: () => void
}

export function MonsterAbilitySaveProficiencyFooter({
  ability,
  proficient,
  disabled = false,
  'aria-invalid': ariaInvalid,
  onToggle,
}: MonsterAbilitySaveProficiencyFooterProps) {
  const iconVariant = disabled ? 'off' : proficient ? 'ready' : 'none'

  return (
    <button
      type="button"
      className={cn(
        'inline-flex w-full items-center justify-center gap-1.5',
        'whitespace-nowrap text-style-label',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled && 'text-muted-foreground',
      )}
      aria-pressed={proficient}
      aria-invalid={ariaInvalid || undefined}
      aria-label={monsterSavingThrowProficiencyAriaLabel(ability)}
      disabled={disabled}
      onClick={onToggle}
    >
      <StatusIcon variant={iconVariant} size="sm" />
      {MONSTER_SAVE_PROF_LABEL}
    </button>
  )
}
