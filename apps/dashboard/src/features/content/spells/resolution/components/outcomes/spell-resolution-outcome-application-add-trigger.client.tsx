'use client'

import { Plus } from 'lucide-react'
import { Button, ButtonDropdown, fieldSizeToArrayAddButtonSize } from '@rpg/ui'
import type { FieldSize } from '@rpg/ui'

import {
  OUTCOME_APPLICATION_MENU_GROUPS,
  type OutcomeApplicationAddState,
} from '../../lib/form/resolution-outcome-effect-availability.lib'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'

export function SpellResolutionOutcomeApplicationAddTrigger({
  addState,
  hintId,
  size,
  onSelectItem,
}: {
  addState: OutcomeApplicationAddState
  hintId: string
  size: FieldSize
  onSelectItem: (effectId: string) => void
}) {
  if (addState.kind === 'no-authored-effects' || addState.kind === 'all-applied') {
    return null
  }

  const buttonSize = fieldSizeToArrayAddButtonSize[size]
  const label = RESOLUTION_SECTION_LABELS.addAppliedEffect

  if (addState.kind === 'all-incomplete') {
    return (
      <Button
        type="button"
        variant="outline"
        size={buttonSize}
        className="w-fit shrink-0"
        disabled
        aria-describedby={hintId}
      >
        <Plus aria-hidden />
        {label}
      </Button>
    )
  }

  const items = [...addState.eligible, ...addState.unavailable]
  const groups =
    addState.unavailable.length > 0
      ? OUTCOME_APPLICATION_MENU_GROUPS.map((group) => ({ ...group }))
      : [{ id: 'available', label: RESOLUTION_SECTION_LABELS.outcomeAvailableGroup }]

  return (
    <ButtonDropdown
      label={label}
      leadingIcon={<Plus aria-hidden />}
      width="fit"
      items={items}
      groups={groups}
      size={buttonSize}
      onSelectItem={onSelectItem}
    />
  )
}
