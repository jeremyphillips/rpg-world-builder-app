import type { Ability } from '@rpg/contracts'
import { Checkbox, cn } from '@rpg/ui'

import {
  abilityScoreCardFooterActionLabelClasses,
  abilityScoreCardFooterCheckboxClasses,
  abilityScoreCardFooterClasses,
} from '@/components/ability-score'

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
  return (
    <label
      className={cn(abilityScoreCardFooterClasses, disabled && 'cursor-not-allowed opacity-50')}
    >
      <Checkbox
        className={abilityScoreCardFooterCheckboxClasses}
        checked={proficient}
        disabled={disabled}
        aria-invalid={ariaInvalid || undefined}
        aria-label={monsterSavingThrowProficiencyAriaLabel(ability)}
        onCheckedChange={() => onToggle()}
      />
      <span className={abilityScoreCardFooterActionLabelClasses} aria-hidden>
        {MONSTER_SAVE_PROF_LABEL}
      </span>
    </label>
  )
}
