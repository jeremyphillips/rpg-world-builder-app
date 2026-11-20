import type { FormItem } from '@rpg/ui/form'

import {
  MONSTER_MULTIATTACK_ADD_ATTACK_GROUP_LABEL,
  MONSTER_MULTIATTACK_ATTACKS_HINT,
  MONSTER_MULTIATTACK_ATTACKS_LABEL,
  MONSTER_MULTIATTACK_ATTACKS_PICKER_LABEL,
  MONSTER_MULTIATTACK_COMBINATION_HINT,
  MONSTER_MULTIATTACK_COUNT_LABEL,
} from '../../monster-form-labels'

export function monsterMultiattackAttackFields(input: {
  attackOptions: { value: string; label: string }[]
  showCombinationHint?: boolean
}): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'steps',
      heading: {
        label: MONSTER_MULTIATTACK_ATTACKS_LABEL,
        hint: { text: MONSTER_MULTIATTACK_ATTACKS_HINT },
      },
      addAction: { label: MONSTER_MULTIATTACK_ADD_ATTACK_GROUP_LABEL },
      item: { headerVisibility: 'hidden', header: { fallback: () => '' } },
      fields: [
        {
          type: 'number',
          name: 'count',
          label: MONSTER_MULTIATTACK_COUNT_LABEL,
          min: 1,
        },
        {
          type: 'chips',
          name: 'actionIds',
          label: MONSTER_MULTIATTACK_ATTACKS_PICKER_LABEL,
          hint: input.showCombinationHint
            ? { text: MONSTER_MULTIATTACK_COMBINATION_HINT }
            : undefined,
          options: input.attackOptions,
        },
      ],
    },
  ]
}
