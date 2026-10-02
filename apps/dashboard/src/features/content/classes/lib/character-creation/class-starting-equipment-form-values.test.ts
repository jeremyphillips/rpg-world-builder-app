import { describe, expect, it } from 'vitest'

import type { StartingEquipmentChoice } from '@rpg/contracts'

import { createStartingEquipmentContributionId } from './class-starting-equipment-form-fields'
import {
  startingEquipmentFromFormValues,
  startingEquipmentToFormValues,
} from './class-starting-equipment-form-values'

const STARTING_EQUIPMENT: StartingEquipmentChoice = {
  choose: 1,
  options: [
    {
      id: 'standard-equipment',
      label: 'Standard Equipment',
      items: [
        {
          id: 'javelin',
          kind: 'grant',
          target: { source: 'equipment', equipmentSlug: 'javelin' },
          quantity: 8,
        },
        {
          id: 'musical-instrument-choice',
          kind: 'choice',
          choose: 1,
          pool: {
            source: 'filtered',
            equipmentKind: 'tool',
            toolCategory: 'musical_instrument',
          },
        },
      ],
    },
  ],
}

describe('starting equipment form values', () => {
  it('preserves contribution ids across a form round-trip and reorder', () => {
    const form = startingEquipmentToFormValues(STARTING_EQUIPMENT)
    const option = form.options[0]
    expect(option).toBeDefined()
    if (!option) return

    const reordered = {
      ...form,
      options: [{ ...option, items: [...option.items].reverse() }],
    }
    const stored = startingEquipmentFromFormValues(reordered, STARTING_EQUIPMENT)

    expect(stored?.options[0]?.items.map((item) => item.id)).toEqual([
      'musical-instrument-choice',
      'javelin',
    ])
  })

  it('assigns a fresh id when a new row has none', () => {
    const first = createStartingEquipmentContributionId()
    const second = createStartingEquipmentContributionId()
    expect(first).not.toBe(second)
    expect(first.length).toBeGreaterThan(0)
  })
})
