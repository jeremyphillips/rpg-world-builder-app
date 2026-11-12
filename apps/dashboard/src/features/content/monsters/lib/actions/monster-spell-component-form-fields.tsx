import type { FormItem } from '@rpg/ui/form'

import { MonsterSpellComponentRequirementsField } from '../../components/form/monster-spell-component-requirements-field'

export function monsterSpellComponentRequirementsField(name = 'omittedComponents'): FormItem {
  return {
    kind: 'slot',
    name,
    render: () => <MonsterSpellComponentRequirementsField name={name} />,
  }
}
