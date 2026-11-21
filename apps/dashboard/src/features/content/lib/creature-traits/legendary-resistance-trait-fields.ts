import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import {
  MONSTER_LEGENDARY_LAIR_USES_LABEL,
  MONSTER_LEGENDARY_RESISTANCE_LAIR_USES_HINT,
  MONSTER_LEGENDARY_RESISTANCE_USES_HINT,
  MONSTER_LEGENDARY_USES_LABEL,
} from '@/features/content/monsters/lib/monster-form-labels'

const monsterLairEnabledVisibility: FieldVisibility = {
  dependsOn: ['lair.enabled'],
  visibleWhen: (values) => (values.lair as { enabled?: boolean } | undefined)?.enabled === true,
}

export function legendaryResistanceTemplateUseFields(options: {
  includeInLair: boolean
}): FormItem[] {
  const fields: FormItem[] = [
    {
      type: 'number',
      name: 'config.uses.normal',
      label: MONSTER_LEGENDARY_USES_LABEL,
      hint: MONSTER_LEGENDARY_RESISTANCE_USES_HINT,
      min: 1,
      digits: 2,
      control: 'stepper',
      required: true,
      shouldUnregister: false,
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
      shouldUnregister: false,
      visibility: monsterLairEnabledVisibility,
    })
  }
  return fields
}
