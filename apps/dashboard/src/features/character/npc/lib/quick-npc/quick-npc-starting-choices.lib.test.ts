import { describe, expect, it } from 'vitest'

import type { NpcStartingChoiceEntry } from '@rpg/contracts'

import {
  formatStartingChoiceProvenance,
  groupStartingChoicesByKind,
} from './quick-npc-starting-choices.lib'

function entry(overrides: Partial<NpcStartingChoiceEntry> = {}): NpcStartingChoiceEntry {
  return {
    kind: 'skill',
    ownership: 'allowance-fill',
    selectedIds: ['athletics', 'perception'],
    allowance: { chosen: 2, required: 2 },
    provenance: {
      ownerKind: 'npcTemplate',
      ownerLabel: 'Guard',
      suggestionOwnerLabel: 'Guard',
      suggestedBy: 'template',
    },
    choiceSetId: 'npcTemplate:guard:skills',
    editable: true,
    overridden: false,
    ...overrides,
  }
}

describe('formatStartingChoiceProvenance', () => {
  it('describes a suggested allowance, a grant, and a manual addition', () => {
    expect(formatStartingChoiceProvenance(entry())).toBe('2 skills · Suggested by Guard role')
    expect(
      formatStartingChoiceProvenance(
        entry({
          kind: 'equipment',
          ownership: 'fixed-grant',
          editable: false,
          allowance: undefined,
          overridden: false,
          provenance: { ownerKind: 'npcTemplate', ownerLabel: 'Guard' },
        }),
      ),
    ).toBe('Granted by Guard role')
    expect(
      formatStartingChoiceProvenance(
        entry({ kind: 'weapon', ownership: 'manual', provenance: {}, editable: true }),
      ),
    ).toBe('Added manually')
  })
})

describe('groupStartingChoicesByKind', () => {
  it('aggregates two skill allowances under one Skills section', () => {
    const categories = groupStartingChoicesByKind({
      entries: [
        entry(),
        entry({
          choiceSetId: 'class:fighter:class-skills',
          provenance: { ownerKind: 'class', ownerLabel: 'Fighter' },
          overridden: true,
        }),
      ],
    })

    expect(categories).toHaveLength(1)
    expect(categories[0]?.label).toBe('Skills')
    expect(categories[0]?.entries).toHaveLength(2)
    expect(categories[0]?.canChange).toBe(true)
  })
})
