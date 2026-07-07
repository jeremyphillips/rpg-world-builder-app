import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  createEmptyCharacterBuilderDraft,
  nestedStartingEquipmentChoiceSetId,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  equipmentStepBardClassFixture,
  equipmentStepCatalogIndexFixture,
} from '../../lib/equipment-step.fixtures'
import { EquipmentInventorySummary } from './equipment-inventory-summary.client'

describe('EquipmentInventorySummary', () => {
  it('renders removable package rows', async () => {
    const user = userEvent.setup()
    const onRemoveItem = vi.fn()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard'],
        [nestedStartingEquipmentChoiceSetId(equipmentStepBardClassFixture.id, 'standard', 1)]: [
          'srd-cc-5.2.1:lute',
        ],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onRemoveItem={onRemoveItem}
      />,
    )

    expect(screen.getByText('Leather Armor')).toBeInTheDocument()
    expect(screen.getByText('Lute')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]!)

    expect(onRemoveItem).toHaveBeenCalledWith({
      kind: 'package',
      packageItemKey: `${equipmentStepBardClassFixture.id}:standard:0`,
    })
  })

  it('has no axe accessibility violations', async () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const { container } = render(
      <EquipmentInventorySummary
        draft={draft}
        catalogIndex={equipmentStepCatalogIndexFixture}
        onRemoveItem={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
