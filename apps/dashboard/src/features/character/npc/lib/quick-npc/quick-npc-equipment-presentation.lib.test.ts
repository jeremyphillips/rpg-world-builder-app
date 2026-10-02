import { describe, expect, it } from 'vitest'

import type { SelectionSourceLabelCatalogIndex } from '@rpg/contracts'

import {
  formatManualEquipmentQuantityLabel,
  formatQuickNpcAdditionalEquipmentContext,
  presentQuickNpcEquipmentSupplyClauses,
} from './quick-npc-equipment-presentation.lib'

const catalog = {
  classes: new Map([['fighter', { name: 'Fighter' }]]),
} as SelectionSourceLabelCatalogIndex

const fighterPackage = {
  kind: 'recorded' as const,
  source: {
    kind: 'classStartingEquipment' as const,
    sourceId: 'fighter',
    grantId: 'kit',
  },
}

describe('presentQuickNpcEquipmentSupplyClauses', () => {
  it('omits manual contributions and labels each automatic origin with its own quantity', () => {
    expect(
      presentQuickNpcEquipmentSupplyClauses({
        catalog,
        contributions: [
          { source: { kind: 'manual' }, quantity: 2 },
          { source: { kind: 'role', id: 'guard' }, quantity: 1 },
          { source: fighterPackage, quantity: 8 },
        ],
      }).map((clause) => clause.label),
    ).toEqual(['Fighter package ×8', 'Guard role ×1'])
  })
})

describe('formatQuickNpcAdditionalEquipmentContext', () => {
  const packageClause = { label: 'Fighter package ×8', source: fighterPackage }
  const roleClause = { label: 'Guard role ×1', source: { kind: 'role' as const, id: 'guard' } }
  const speciesClause = {
    label: 'Elf species ×1',
    source: {
      kind: 'recorded' as const,
      source: { kind: 'speciesTrait' as const, sourceId: 'elf' },
    },
  }

  it('omits context when the manual contribution already covers the total', () => {
    expect(
      formatQuickNpcAdditionalEquipmentContext({
        totalQuantity: 2,
        manualQuantity: 2,
        supplyClauses: [packageClause],
      }),
    ).toBeUndefined()
    expect(formatManualEquipmentQuantityLabel(2)).toBe('+2')
  })

  it('names the total when manual is short and no automatic clause is available', () => {
    expect(
      formatQuickNpcAdditionalEquipmentContext({
        totalQuantity: 10,
        manualQuantity: 2,
        supplyClauses: [],
      }),
    ).toBe('10 total')
  })

  it('shows one automatic source and collapses the rest', () => {
    expect(
      formatQuickNpcAdditionalEquipmentContext({
        totalQuantity: 10,
        manualQuantity: 2,
        supplyClauses: [packageClause],
      }),
    ).toBe('10 total · Fighter package ×8')

    expect(
      formatQuickNpcAdditionalEquipmentContext({
        totalQuantity: 10,
        manualQuantity: 1,
        supplyClauses: [
          { ...roleClause, label: 'Guard role ×1' },
          { ...packageClause, label: 'Fighter package ×7' },
          speciesClause,
        ],
      }),
    ).toBe('10 total · Fighter package ×7 · +2 other sources')
  })
})
