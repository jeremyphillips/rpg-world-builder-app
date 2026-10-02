import { describe, expect, it } from 'vitest'

import type { ResolvedEquipmentOption } from './project-equipment-option-facts'
import {
  adaptCharacterSelectionToEquipmentSupply,
  formatEquipmentSupplySourceLabel,
  projectEquipmentSelection,
} from './project-equipment-selection'

const recommendation = {
  strength: 'strong' as const,
  signals: [
    {
      strength: 'strong' as const,
      basis: 'preference' as const,
      specificity: 'exact' as const,
      source: { kind: 'role' as const, id: 'guard' as const },
    },
  ],
}

function resolved(): ResolvedEquipmentOption {
  return {
    requirements: [
      {
        requirementId: 'wizard:focus',
        owner: { kind: 'class', id: 'wizard' },
        rule: 'anyOf',
        optionSatisfies: true,
        role: 'candidate',
      },
    ],
    recommendation,
    state: { compatibility: { proficient: false } },
  }
}

describe('projectEquipmentSelection', () => {
  it('records included quantity and whether more can be added', () => {
    const projected = projectEquipmentSelection({
      resolved: resolved(),
      quantity: 2,
      sources: [{ kind: 'manual' }],
      addition: 'quantity',
    })
    expect(projected.state.selection).toEqual({
      selected: true,
      quantity: 2,
      canAddMore: true,
      removable: true,
      sources: [{ kind: 'manual' }],
    })
    expect(projected.recommendation).toBe(recommendation)
    expect(projected.requirements).toEqual(resolved().requirements)
    expect(projected.state.compatibility).toEqual({ proficient: false })
  })

  it('allows the first copy of a singleton and blocks a second', () => {
    const open = projectEquipmentSelection({
      resolved: resolved(),
      quantity: 0,
      sources: [],
      addition: 'single',
    })
    const owned = projectEquipmentSelection({
      resolved: resolved(),
      quantity: 1,
      sources: [{ kind: 'role', id: 'guard' }],
      addition: 'single',
    })
    expect(open.state.selection?.canAddMore).toBe(true)
    expect(owned.state.selection?.canAddMore).toBe(false)
    expect(owned.state.selection?.quantity).toBe(1)
  })

  it('blocks a prohibited row even when quantity is zero', () => {
    const projected = projectEquipmentSelection({
      resolved: resolved(),
      quantity: 0,
      sources: [],
      addition: 'blocked',
    })
    expect(projected.state.selection?.selected).toBe(false)
    expect(projected.state.selection?.canAddMore).toBe(false)
  })

  it('keeps recommendation sources independent from supply sources', () => {
    const projected = projectEquipmentSelection({
      resolved: resolved(),
      quantity: 1,
      sources: [
        { kind: 'manual' },
        adaptCharacterSelectionToEquipmentSupply({
          kind: 'classStartingEquipment',
          sourceId: 'fighter',
          grantId: 'package-a',
        }),
      ],
      addition: 'quantity',
    })
    expect(projected.recommendation.signals.map((signal) => signal.source)).toEqual([
      { kind: 'role', id: 'guard' },
    ])
    expect(projected.state.selection?.sources.map((source) => source.kind)).toEqual([
      'manual',
      'recorded',
    ])
  })

  it('adapts legacy npcTemplate storage to role and role-default copy', () => {
    expect(
      adaptCharacterSelectionToEquipmentSupply({
        kind: 'npcTemplate',
        sourceId: 'guard',
        grantId: 'training',
      }),
    ).toEqual({ kind: 'role', id: 'guard' })
    expect(
      adaptCharacterSelectionToEquipmentSupply({
        kind: 'npcTemplate',
        sourceId: 'guard',
        grantId: 'role-default',
      }),
    ).toEqual({ kind: 'role-default', id: 'guard' })
    expect(formatEquipmentSupplySourceLabel({ kind: 'role', id: 'guard' })).toBe('Guard role')
    expect(formatEquipmentSupplySourceLabel({ kind: 'role-default', id: 'guard' })).toBe(
      'Guard role',
    )
    expect(formatEquipmentSupplySourceLabel({ kind: 'manual' })).toBe('Added manually')
  })
})
