import type { FormItem } from '@rpg/ui/form'

import { MonsterActionTurnLimitControl } from '../../components/form/actions/shared/turn-limit.slot'

export function monsterActionTurnLimitField(name = 'onceUntilNextTurn'): FormItem {
  return {
    kind: 'slot',
    name: '_turnLimit',
    boundNames: [name],
    render: () => <MonsterActionTurnLimitControl name={name} />,
  }
}
