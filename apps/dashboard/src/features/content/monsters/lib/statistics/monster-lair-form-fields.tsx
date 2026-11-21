import { LAIR_TERM } from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import { MonsterLairField } from '../../components/form/slots/statistics/monster-lair-experience.slot'
import { MONSTER_LAIR_SECTION_HINT } from '../monster-form-labels'

export function monsterLairFormFields(): FormItem[] {
  return [
    {
      kind: 'group',
      heading: { label: LAIR_TERM.label, hint: MONSTER_LAIR_SECTION_HINT },
      fields: [
        {
          kind: 'slot',
          name: 'lair',
          render: () => <MonsterLairField />,
        },
      ],
    },
  ]
}
