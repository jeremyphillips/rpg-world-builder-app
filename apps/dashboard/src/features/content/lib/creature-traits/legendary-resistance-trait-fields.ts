import { formatLimitedUseAuthoringHint } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { monsterLairEnabledVisibility } from '@/features/content/monsters/lib/statistics/monster-lair-form-fields'
import {
  MONSTER_LEGENDARY_LAIR_USES_LABEL,
  MONSTER_LEGENDARY_RESISTANCE_LAIR_USES_HINT,
  MONSTER_LEGENDARY_USES_LABEL,
} from '@/features/content/monsters/lib/monster-form-labels'

const LEGENDARY_RESISTANCE_USES_AUTHORING_HINT = formatLimitedUseAuthoringHint({
  kind: 'uses',
  count: { kind: 'fixed', value: 1 },
  recovery: { minimumRest: 'long' },
})

export function legendaryResistanceTemplateUseFields(options: {
  includeInLair: boolean
}): FormItem[] {
  const fields: FormItem[] = [
    {
      type: 'number',
      name: 'config.uses.normal',
      label: MONSTER_LEGENDARY_USES_LABEL,
      hint: LEGENDARY_RESISTANCE_USES_AUTHORING_HINT,
      min: 1,
      digits: 2,
      control: 'stepper',
      required: true,
    },
  ]
  if (options.includeInLair) {
    fields.push({
      type: 'number',
      name: 'config.uses.inLair',
      label: MONSTER_LEGENDARY_LAIR_USES_LABEL,
      hint: MONSTER_LEGENDARY_RESISTANCE_LAIR_USES_HINT,
      min: 1,
      digits: 2,
      control: 'stepper',
      width: 'auto',
      visibility: monsterLairEnabledVisibility,
    })
  }
  return fields
}
