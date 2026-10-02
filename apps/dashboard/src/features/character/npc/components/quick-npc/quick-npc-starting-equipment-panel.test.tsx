import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { NEUTRAL_OPTION_RECOMMENDATION, type NpcStartingChoices } from '@rpg/contracts'

import { buildEquipmentPickerRowViewModel } from '@/features/content'
import {
  equipmentStepBardClassFixture,
  equipmentStepContextFixture,
  equipmentStepRationsFixture,
  equipmentStepSpearFixture,
} from '@/features/character/lib/equipment/equipment-step.fixtures'

import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcEquipmentSelection,
} from '../../lib/quick-npc/quick-npc-form-fields'
import { quickNpcStandaloneSetupValues } from '../../lib/quick-npc/quick-npc-test-fixtures'
import type { QuickNpcAdditionalEquipmentOption } from '../../lib/quick-npc/quick-npc-additional-equipment.lib'
import { QuickNpcStartingEquipmentPanel } from './quick-npc-starting-equipment-panel'

const choices = {
  contributions: [],
  removedOverrideIds: [],
  draft: { class: { classId: '' }, choiceSelections: {} },
  resolvedChoiceSets: [],
} as unknown as NpcStartingChoices

function optionFor(
  equipment: typeof equipmentStepSpearFixture,
  recommendation = NEUTRAL_OPTION_RECOMMENDATION,
): QuickNpcAdditionalEquipmentOption {
  return {
    option: { value: equipment.id, label: equipment.name },
    pickerItem: {
      equipment,
      state: {
        isAvailable: true,
        isRecommended: false,
        disabledReasons: [],
        isProficient: true,
        isWithinRemainingBudget: true,
        purchaseAvailability: { status: 'available' },
        recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
        resolved: {
          requirements: [],
          recommendation,
          state: {},
        },
      },
    },
    row: buildEquipmentPickerRowViewModel(equipment),
  }
}

function PanelHarness({
  classId = '',
  level = 0,
  equipmentSelections = [],
  gearOnly = false,
}: {
  classId?: string
  level?: number
  equipmentSelections?: QuickNpcEquipmentSelection[]
  gearOnly?: boolean
}) {
  const form = useForm<QuickNpcAuthoringTabFormValues>({
    defaultValues: {
      ...quickNpcAuthoringTabDefaultValues,
      equipmentSelections,
    },
  })
  return (
    <FormProvider {...form}>
      <QuickNpcStartingEquipmentPanel
        setup={quickNpcStandaloneSetupValues({
          classId,
          level,
          npcTemplateId: 'guard',
        })}
        choices={choices}
        buildContext={equipmentStepContextFixture}
        additionalOptions={
          gearOnly
            ? [optionFor(equipmentStepRationsFixture)]
            : [
                optionFor(equipmentStepSpearFixture, {
                  strength: 'strong',
                  signals: [
                    {
                      strength: 'strong',
                      basis: 'preference',
                      specificity: 'exact',
                      source: { kind: 'role', id: 'guard' },
                    },
                  ],
                }),
                optionFor(equipmentStepRationsFixture),
              ]
        }
      />
    </FormProvider>
  )
}

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  Element.prototype.scrollIntoView = () => {}
})

describe('QuickNpcStartingEquipmentPanel', () => {
  afterEach(() => {
    cleanup()
  })

  it('keeps an owned weapon addable and increments its manual quantity', async () => {
    const user = userEvent.setup()
    render(
      <PanelHarness
        classId={equipmentStepBardClassFixture.id}
        level={1}
        equipmentSelections={[
          { equipmentId: equipmentStepSpearFixture.id, quantity: 1, origin: 'manual' },
        ]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Remove Spear' })).toBeTruthy()
    await user.click(screen.getByRole('combobox', { name: 'Add equipment' }))
    expect(screen.getByRole('combobox', { name: 'Equipment category' })).toHaveTextContent('Weapon')
    expect(screen.queryByRole('option', { name: /rations/i })).toBeNull()
    const spear = screen.getByRole('option', { name: /spear/i })
    expect(spear).toBeEnabled()
    expect(spear).toHaveTextContent('×1')
    expect(spear).toHaveTextContent('Quantity 1')
    expect(spear).toHaveTextContent('Weapon')
    expect(spear).toHaveTextContent('Recommended by Guard role')
    await user.click(spear)
    expect(screen.getByText('2 × Spear')).toBeTruthy()
  })

  it('filters the add-equipment list when a category is selected', async () => {
    const user = userEvent.setup()
    render(<PanelHarness />)

    await user.click(screen.getByRole('combobox', { name: 'Add equipment' }))
    await user.click(screen.getByRole('combobox', { name: 'Equipment category' }))
    await user.click(screen.getByRole('option', { name: 'Adventuring Gear' }))

    expect(screen.getByRole('combobox', { name: 'Equipment category' })).toHaveTextContent(
      'Adventuring Gear',
    )
    expect(screen.getByRole('option', { name: /rations/i })).toBeTruthy()
    expect(screen.queryByRole('option', { name: /spear/i })).toBeNull()
  })

  it('increments a multi-quantity item without replacing role supply', async () => {
    const user = userEvent.setup()
    render(
      <PanelHarness
        gearOnly
        equipmentSelections={[
          { equipmentId: equipmentStepRationsFixture.id, quantity: 1, origin: 'role-default' },
        ]}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Add equipment' }))
    const rations = screen.getByRole('option', { name: /rations/i })
    expect(rations).toHaveTextContent('Guard role')
    expect(rations).toHaveTextContent('×1')
    await user.keyboard('{Enter}')
    expect(screen.getByText('2 × Rations')).toBeTruthy()
  })
})
