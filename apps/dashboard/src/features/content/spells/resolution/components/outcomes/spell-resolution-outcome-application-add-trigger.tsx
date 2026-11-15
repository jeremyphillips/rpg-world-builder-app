import { ActionIcon, ButtonDropdown, INLINE_HEADER_ACTION_BUTTON_SIZE } from '@rpg/ui'
import type { ButtonDropdownItem } from '@rpg/ui'

import {
  OUTCOME_APPLICATION_MENU_GROUPS,
  type OutcomeApplicationAddState,
} from '../../lib/form/resolution-outcome-effect-availability.lib'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'

const CREATE_EFFECT_ITEMS: ButtonDropdownItem[] = [
  { id: 'create:damage', label: 'Damage', groupId: 'create' },
  { id: 'create:healing', label: 'Healing', groupId: 'create' },
  { id: 'create:temporary-hit-points', label: 'Temporary hit points', groupId: 'create' },
  { id: 'note', label: 'Note', groupId: 'create' },
]

export function SpellResolutionOutcomeApplicationAddTrigger({
  addState,
  hintId: _hintId,
  onSelectItem,
}: {
  addState: OutcomeApplicationAddState
  hintId: string
  onSelectItem: (effectId: string) => void
}) {
  const buttonSize = INLINE_HEADER_ACTION_BUTTON_SIZE
  const label = RESOLUTION_SECTION_LABELS.addAppliedEffect

  const useExisting =
    addState.kind === 'ready'
      ? addState.eligible.map((item) => ({
          ...item,
          label: `Use existing effect: ${item.label}`,
        }))
      : []
  const unavailable = 'unavailable' in addState ? addState.unavailable : []
  const items = [...CREATE_EFFECT_ITEMS, ...useExisting, ...unavailable]
  const groups = [
    { id: 'create', label: 'Add' },
    ...(unavailable.length > 0
      ? OUTCOME_APPLICATION_MENU_GROUPS.map((group) => ({ ...group }))
      : [{ id: 'available', label: RESOLUTION_SECTION_LABELS.outcomeAvailableGroup }]),
  ]

  return (
    <ButtonDropdown
      label={label}
      leadingIcon={<ActionIcon action="add" size="lg" />}
      width="fit"
      items={items}
      groups={groups}
      size={buttonSize}
      onSelectItem={onSelectItem}
    />
  )
}
