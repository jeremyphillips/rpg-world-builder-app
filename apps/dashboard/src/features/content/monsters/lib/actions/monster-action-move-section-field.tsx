import { SelectField } from '@rpg/ui'
import { useFieldControlSize } from '@rpg/ui/form'

import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from './monster-action-equipment-references'
import { monsterActionSectionHeading } from './monster-action-presets'
import { MONSTER_MOVE_TO_LABEL } from '../monster-form-labels'

const moveSectionOptions = MONSTER_ACTION_SECTIONS.map((target) => ({
  value: target,
  label: monsterActionSectionHeading(target),
}))

export function MonsterActionMoveSectionField({
  id,
  section,
  onMove,
}: {
  id: string
  section: MonsterActionSection
  onMove: (target: MonsterActionSection) => void
}) {
  const size = useFieldControlSize()

  return (
    <SelectField
      id={id}
      label={MONSTER_MOVE_TO_LABEL}
      size={size}
      value={section}
      onValueChange={(value) => {
        if (value && value !== section) onMove(value as MonsterActionSection)
      }}
      options={moveSectionOptions}
    />
  )
}
