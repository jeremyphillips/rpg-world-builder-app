import type { FormItem } from '@rpg/ui/form'

import { MonsterSpellComponentRequirementsField } from '../../../components/form/slots/spells/component-requirements.slot'

export function monsterSpellComponentRequirementsField(name = 'omittedComponents'): FormItem {
  return {
    kind: 'slot',
    name,
    boundNames: [name],
    render: () => <MonsterSpellComponentRequirementsField name={name} />,
  }
}
