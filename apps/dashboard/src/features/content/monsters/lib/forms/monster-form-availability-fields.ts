import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import { MonsterFormAvailabilityControl } from '../../components/form/monster-form-availability'

export const MONSTER_FORM_AVAILABILITY_FIELD = 'formAvailability'

export function monsterFormAvailabilityField(): FormItem {
  return {
    kind: 'slot',
    name: MONSTER_FORM_AVAILABILITY_FIELD,
    issuePaths: ['onlyInFormIds'],
    render: ({ namePrefix }) => createElement(MonsterFormAvailabilityControl, { namePrefix }),
  }
}

export function insertMonsterFormAvailabilityField(fields: FormItem[]): FormItem[] {
  const slot = monsterFormAvailabilityField()
  const advisoryIndex = fields.findIndex(
    (item) => 'name' in item && item.name === 'buildAdvisories',
  )
  if (advisoryIndex < 0) return [slot, ...fields]
  return [...fields.slice(0, advisoryIndex + 1), slot, ...fields.slice(advisoryIndex + 1)]
}
