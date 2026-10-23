import { ActionIcon, iconGhostControlVariants } from '@rpg/ui'

import { MONSTER_REMOVE_LABEL } from '../../lib/monster-form-labels'

export function MonsterCreatureDetailsRemoveRowButton({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <button
      type="button"
      className={iconGhostControlVariants({ hover: 'destructive', layout: 'flex' })}
      aria-label={`${MONSTER_REMOVE_LABEL} ${label}`}
      onClick={onRemove}
    >
      <ActionIcon action="remove" size="lg" />
    </button>
  )
}
