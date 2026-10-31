import { Field, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@rpg/ui'

import {
  MONSTER_ACTION_SECTIONS,
  type MonsterActionSection,
} from '../../lib/actions/monster-action-equipment-references'
import { monsterActionSectionHeading } from '../../lib/actions/monster-action-presets'
import { MONSTER_MOVE_TO_LABEL } from '../../lib/monster-form-labels'

export function MonsterActionMoveSectionField({
  section,
  onMove,
}: {
  section: MonsterActionSection
  onMove: (target: MonsterActionSection) => void
}) {
  return (
    <Field.Root id="monster-action-move-section" size="sm" width="full">
      <Field.Label>{MONSTER_MOVE_TO_LABEL}</Field.Label>
      <Select value={section} onValueChange={(value) => onMove(value as MonsterActionSection)}>
        <Field.Control>
          <SelectTrigger size="sm" aria-label={MONSTER_MOVE_TO_LABEL}>
            <SelectValue />
          </SelectTrigger>
        </Field.Control>
        <SelectContent>
          {MONSTER_ACTION_SECTIONS.map((target) => (
            <SelectItem key={target} value={target}>
              {monsterActionSectionHeading(target)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field.Root>
  )
}
