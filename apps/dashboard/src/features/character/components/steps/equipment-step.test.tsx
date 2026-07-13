import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildChoiceSetId,
  createEmptyCharacterBuilderDraft,
  nestedStartingEquipmentChoiceSetId,
  resolveAvailableChoices,
  startingEquipmentChoiceSetId,
  type CharacterBuilderDraft,
} from '@rpg/contracts'

import { characterBuilderStepReadinessMessages, formatFieldMessage } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../../lib/character-builder-fixtures'
import {
  equipmentStepBardClassFixture,
  equipmentStepBreastplateFixture,
  equipmentStepCatalogFixture,
  equipmentStepDrumFixture,
  equipmentStepLeatherArmorFixture,
  equipmentStepLuteFixture,
  equipmentStepMonkClassFixture,
  equipmentStepRationsFixture,
} from '../../lib/equipment-step.fixtures'
import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE,
  EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
  EQUIPMENT_STEP_BROWSE_LABEL,
} from '../../lib/equipment-step.lib'
import { EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL } from '../equipment/equipment-picker-drawer.types'
import { EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL } from '../equipment/equipment-picker-purchase.lib'
import { EquipmentStep } from './equipment-step.client'

const context = createStandaloneBuilderContextFixture({
  catalog: equipmentStepCatalogFixture,
})

const equipmentBlockedNoClassMessage = formatFieldMessage(
  characterBuilderStepReadinessMessages.equipmentBlockedNoClass(),
)

function renderEquipmentStep(
  draft: CharacterBuilderDraft = {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: equipmentStepBardClassFixture.id, level: 1 },
  },
  onDraftChange = vi.fn(),
) {
  const resolvedChoiceSets = resolveAvailableChoices(draft, context)

  return {
    onDraftChange,
    ...render(
      <EquipmentStep
        context={context}
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    ),
  }
}

const monkToolChoiceSetId = buildChoiceSetId(
  'class',
  equipmentStepMonkClassFixture.id,
  'class-tools',
)

function renderMonkEquipmentStep(draft: CharacterBuilderDraft, onDraftChange = vi.fn()) {
  const monkContext = createStandaloneBuilderContextFixture({
    catalog: equipmentStepCatalogFixture,
  })
  const resolvedChoiceSets = resolveAvailableChoices(draft, monkContext)

  return {
    onDraftChange,
    ...render(
      <EquipmentStep
        context={monkContext}
        draft={draft}
        resolvedChoiceSets={resolvedChoiceSets}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    ),
  }
}

describe('EquipmentStep', () => {
  it('prompts for a class before showing equipment options', () => {
    renderEquipmentStep(createEmptyCharacterBuilderDraft())

    expect(screen.getByText(equipmentBlockedNoClassMessage)).toBeInTheDocument()
  })

  it('renders package and gold starting equipment options', () => {
    renderEquipmentStep()

    expect(screen.getByText('Standard Equipment')).toBeInTheDocument()
    expect(screen.getByText('Starting Gold')).toBeInTheDocument()
    expect(screen.getByText('Inventory')).toBeInTheDocument()
  })

  it('selects gold and updates draft equipment mode', async () => {
    const user = userEvent.setup()
    const { onDraftChange } = renderEquipmentStep()

    await user.click(screen.getByRole('radio', { name: /^Starting Gold/ }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        choiceSelections: expect.objectContaining({
          [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
        }),
        equipment: expect.objectContaining({ mode: 'gold' }),
      }),
    )
  })

  it('selects standard equipment before nested instrument choice is required', async () => {
    const user = userEvent.setup()
    const { onDraftChange } = renderEquipmentStep()

    expect(screen.queryByRole('combobox', { name: 'Musical Instrument' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Standard Equipment/i }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        choiceSelections: expect.objectContaining({
          [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard'],
        }),
        equipment: expect.objectContaining({ mode: 'package' }),
      }),
    )
  })

  it('shows nested instrument pick after selecting standard equipment', async () => {
    const user = userEvent.setup()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }
    const { onDraftChange } = renderEquipmentStep(draft)

    await user.click(screen.getByRole('combobox', { name: 'Musical Instrument' }))
    await user.keyboard('{ArrowDown}{Enter}')

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        choiceSelections: expect.objectContaining({
          [nestedStartingEquipmentChoiceSetId(equipmentStepBardClassFixture.id, 'standard', 1)]: [
            'srd-cc-5.2.1:lute',
          ],
        }),
      }),
    )
  })

  it('shows budget and browse controls after selecting gold', async () => {
    const user = userEvent.setup()
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

    renderEquipmentStep(draft)

    expect(screen.getByText(EQUIPMENT_SELECTED_PACKAGE_EYEBROW)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Starting Gold' })).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /^Starting Gold/ })).not.toBeInTheDocument()
    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL })).toBeInTheDocument()
    expect(screen.getAllByText(/90 GP/).length).toBeGreaterThanOrEqual(1)

    await user.click(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL }))

    expect(screen.getByRole('dialog', { name: 'Add equipment' })).toBeInTheDocument()
  })

  it('reveals the option list when changing the selected package', async () => {
    const user = userEvent.setup()
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

    renderEquipmentStep(draft)

    expect(screen.queryByRole('radio', { name: /^Starting Gold/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))

    expect(screen.getByRole('radio', { name: /^Starting Gold/ })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Standard Equipment/i })).toBeInTheDocument()
  })

  it('collapses the chooser when clicking the already-selected package', async () => {
    const user = userEvent.setup()
    const onDraftChange = vi.fn()
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

    renderEquipmentStep(draft, onDraftChange)

    expect(screen.queryByRole('radio', { name: /^Starting Gold/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))
    await user.click(screen.getByRole('radio', { name: /^Starting Gold/ }))

    expect(screen.queryByRole('radio', { name: /^Starting Gold/ })).not.toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_SELECTED_PACKAGE_EYEBROW)).toBeInTheDocument()
    expect(onDraftChange).not.toHaveBeenCalled()
  })

  it('shows Proficiency available for instruments on the gold path before proficiency picks', async () => {
    const user = userEvent.setup()
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

    renderEquipmentStep(draft)

    await user.click(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL }))

    const luteRow = screen
      .getAllByRole('listitem')
      .find((row) => within(row).queryByText(equipmentStepLuteFixture.name))!

    expect(
      within(luteRow).getByText(EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL),
    ).toBeInTheDocument()
    expect(within(luteRow).queryByText('Not proficient')).not.toBeInTheDocument()
  })

  it('shows over-budget catalog armor on the gold path with purchase disabled', async () => {
    const user = userEvent.setup()
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

    renderEquipmentStep(draft)

    await user.click(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL }))
    await user.click(screen.getByRole('tab', { name: /All/i }))
    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'breastplate')

    const breastplateRow = screen
      .getAllByRole('listitem')
      .find((row) => within(row).queryByText(equipmentStepBreastplateFixture.name))!

    expect(within(breastplateRow).getByText('400 GP needed')).toBeInTheDocument()
    expect(within(breastplateRow).getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('adds a gold purchase from the picker drawer', async () => {
    const user = userEvent.setup()
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
    const { onDraftChange } = renderEquipmentStep(draft)

    await user.click(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL }))
    const leatherArmorRow = screen
      .getAllByRole('listitem')
      .find((row) => within(row).queryByText(equipmentStepLeatherArmorFixture.name))!
    await user.click(within(leatherArmorRow).getByRole('button', { name: 'Add' }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        equipment: expect.objectContaining({
          purchases: [
            expect.objectContaining({
              equipmentId: equipmentStepLeatherArmorFixture.id,
              quantity: 1,
              sourceMode: 'startingGold',
              origin: 'picker',
              id: expect.any(String),
            }),
          ],
        }),
      }),
    )
  })

  it('commits multi-quantity stackable purchases from the picker body', async () => {
    const user = userEvent.setup()
    const rationsId = equipmentStepRationsFixture.id
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
    const { onDraftChange } = renderEquipmentStep(draft)

    await user.click(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL }))
    await user.click(screen.getByRole('tab', { name: /All/i }))
    await user.type(screen.getByRole('textbox', { name: 'Search catalog' }), 'rations')

    const rationsRow = screen
      .getAllByRole('listitem')
      .find((row) => within(row).queryByText(equipmentStepRationsFixture.name))!

    await user.click(
      within(rationsRow).getByRole('button', {
        name: `Expand ${equipmentStepRationsFixture.name}`,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Increase Quantity to add for Rations' }))
    await user.click(screen.getByRole('button', { name: 'Increase Quantity to add for Rations' }))
    await user.click(screen.getByRole('button', { name: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        equipment: expect.objectContaining({
          purchases: [
            expect.objectContaining({
              equipmentId: rationsId,
              quantity: 3,
              sourceMode: 'startingGold',
              origin: 'picker',
              id: expect.any(String),
            }),
          ],
        }),
      }),
    )
  })

  it('updates stackable purchase quantity from the inventory stepper', async () => {
    const user = userEvent.setup()
    const rationsId = equipmentStepRationsFixture.id
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: rationsId,
            quantity: 2,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: false,
      },
    }
    const { onDraftChange } = renderEquipmentStep(draft)

    await user.click(screen.getByRole('button', { name: 'Increase Rations quantity' }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        equipment: expect.objectContaining({
          purchases: [
            expect.objectContaining({
              equipmentId: rationsId,
              quantity: 3,
              sourceMode: 'startingGold',
            }),
          ],
        }),
      }),
    )
  })

  it('shows package customize and browse shopping on the package path', async () => {
    const user = userEvent.setup()
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

    renderEquipmentStep(draft)

    expect(
      screen.getByRole('button', { name: EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getAllByText(/19 GP/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL }))
    expect(screen.getByRole('dialog', { name: 'Add equipment' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL }))

    expect(screen.getByRole('heading', { name: /Customize Starting Gold/i })).toBeInTheDocument()
  })

  describe('package switch resolution', () => {
    function goldDraftWithRations(quantity: number) {
      const rationsId = equipmentStepRationsFixture.id

      return {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
        choiceSelections: {
          [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
        },
        equipment: {
          mode: 'gold' as const,
          purchases: [
            {
              id: 'purchase-rations',
              equipmentId: rationsId,
              quantity,
              sourceMode: 'startingGold' as const,
              origin: 'picker' as const,
            },
          ],
          removedPackageItemKeys: [],
          customized: false,
        },
      }
    }

    async function openPackageSwitchToStandard(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))
      await user.click(screen.getByRole('radio', { name: /Standard Equipment/i }))
    }

    it('opens the resolution modal when gold purchases exceed the target allowance', async () => {
      const user = userEvent.setup()
      const { onDraftChange } = renderEquipmentStep(goldDraftWithRations(40))

      await openPackageSwitchToStandard(user)

      expect(
        screen.getByRole('heading', { name: 'Resolve purchases before switching' }),
      ).toBeInTheDocument()
      expect(onDraftChange).not.toHaveBeenCalled()
    })

    it('does not commit draft changes from the modal until confirmed', async () => {
      const user = userEvent.setup()
      const { onDraftChange } = renderEquipmentStep(goldDraftWithRations(40))

      await openPackageSwitchToStandard(user)
      await user.click(screen.getByRole('button', { name: 'Decrease Rations quantity' }))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onDraftChange).not.toHaveBeenCalled()
      expect(
        screen.queryByRole('heading', { name: 'Resolve purchases before switching' }),
      ).not.toBeInTheDocument()
    })

    it('shows the blocked modal when non-editable purchases exceed the allowance', async () => {
      const user = userEvent.setup()
      const draft = {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: equipmentStepBardClassFixture.id, level: 1 as const },
        choiceSelections: {
          [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['gold'],
        },
        equipment: {
          mode: 'gold' as const,
          purchases: [
            {
              id: 'purchase-breastplate',
              equipmentId: equipmentStepBreastplateFixture.id,
              quantity: 1,
              sourceMode: 'manual' as const,
              origin: 'picker' as const,
            },
          ],
          removedPackageItemKeys: [],
          customized: false,
        },
      }
      const { onDraftChange } = renderEquipmentStep(draft)

      await openPackageSwitchToStandard(user)

      expect(screen.getByRole('heading', { name: 'Cannot switch packages' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Switch package' })).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Decrease Breastplate quantity' }),
      ).not.toBeInTheDocument()
      expect(onDraftChange).not.toHaveBeenCalled()
    })

    it('commits the package switch when draft purchases fit the target allowance', async () => {
      const user = userEvent.setup()
      const rationsId = equipmentStepRationsFixture.id
      const { onDraftChange } = renderEquipmentStep(goldDraftWithRations(40))

      await openPackageSwitchToStandard(user)
      await user.click(screen.getByRole('button', { name: 'Decrease Rations quantity' }))
      await user.click(screen.getByRole('button', { name: 'Decrease Rations quantity' }))
      await user.click(screen.getByRole('button', { name: 'Switch package' }))

      expect(onDraftChange).toHaveBeenCalledWith(
        expect.objectContaining({
          choiceSelections: expect.objectContaining({
            [startingEquipmentChoiceSetId(equipmentStepBardClassFixture.id)]: ['standard'],
          }),
          equipment: expect.objectContaining({
            mode: 'package',
            purchases: [
              expect.objectContaining({
                equipmentId: rationsId,
                quantity: 38,
                sourceMode: 'startingGold',
              }),
            ],
          }),
        }),
      )
    })
  })

  it('has no axe accessibility violations', async () => {
    const { container } = renderEquipmentStep()

    await expectNoAxeViolations(container)
  })
})

describe('EquipmentStep monk proficiency-linked grants', () => {
  it('shows the included tool field when standard equipment is selected', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    renderMonkEquipmentStep(draft)

    expect(screen.getByText(EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL)).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE)).toBeInTheDocument()
    expect(screen.getByText("Artisan's Tools or Musical Instrument")).toBeInTheDocument()
  })

  it('selects standard monk equipment without clearing proficiency answers', async () => {
    const user = userEvent.setup()
    const { onDraftChange } = renderMonkEquipmentStep({
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
    })

    await user.click(screen.getByRole('radio', { name: /Standard Equipment/i }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        choiceSelections: expect.objectContaining({
          [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
        }),
        equipment: expect.objectContaining({ mode: 'package' }),
      }),
    )
  })

  it('writes the shared class-tools answer when selecting a tool inline', async () => {
    const user = userEvent.setup()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }
    const { onDraftChange } = renderMonkEquipmentStep(draft)

    await user.click(screen.getByRole('radio', { name: /^Lute$/ }))

    expect(onDraftChange).toHaveBeenCalledWith({
      choiceSelections: expect.objectContaining({
        [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
      }),
    })
  })

  it('syncs inline tool changes to inventory and replaces the previous tool', async () => {
    const user = userEvent.setup()
    let draft: CharacterBuilderDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
        [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const monkContext = createStandaloneBuilderContextFixture({
      catalog: equipmentStepCatalogFixture,
    })

    const { rerender } = render(
      <EquipmentStep
        context={monkContext}
        draft={draft}
        resolvedChoiceSets={resolveAvailableChoices(draft, monkContext)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    expect(
      within(screen.getByLabelText('Starting equipment options')).getByRole('heading', {
        name: 'Standard Equipment',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))
    expect(screen.getByRole('radio', { name: /^Lute$/ })).toBeChecked()

    draft = {
      ...draft,
      choiceSelections: {
        ...draft.choiceSelections,
        [monkToolChoiceSetId]: [equipmentStepDrumFixture.id],
      },
    }

    rerender(
      <EquipmentStep
        context={monkContext}
        draft={draft}
        resolvedChoiceSets={resolveAvailableChoices(draft, monkContext)}
        validationIssues={[]}
        onDraftChange={() => undefined}
      />,
    )

    expect(screen.getByRole('radio', { name: /^Drum$/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /^Lute$/ })).not.toBeChecked()
  })

  it('displays a proficiencies preselection in the inline field', async () => {
    const user = userEvent.setup()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
        [monkToolChoiceSetId]: [equipmentStepDrumFixture.id],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    renderMonkEquipmentStep(draft)

    expect(
      within(screen.getByLabelText('Starting equipment options')).getByRole('heading', {
        name: 'Standard Equipment',
      }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))

    expect(screen.getByRole('radio', { name: /^Drum$/ })).toBeChecked()
  })

  it('preserves the class-tools answer when switching between standard and gold', async () => {
    const user = userEvent.setup()
    const monkContext = createStandaloneBuilderContextFixture({
      catalog: equipmentStepCatalogFixture,
    })

    let draft: CharacterBuilderDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard'],
        [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const onDraftChange = vi.fn()

    const { rerender } = render(
      <EquipmentStep
        context={monkContext}
        draft={draft}
        resolvedChoiceSets={resolveAvailableChoices(draft, monkContext)}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))
    await user.click(screen.getByRole('radio', { name: /^Starting Gold/ }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        choiceSelections: expect.objectContaining({
          [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
        }),
      }),
    )

    draft = {
      ...draft,
      choiceSelections: {
        [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['gold'],
        [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    rerender(
      <EquipmentStep
        context={monkContext}
        draft={draft}
        resolvedChoiceSets={resolveAvailableChoices(draft, monkContext)}
        validationIssues={[]}
        onDraftChange={onDraftChange}
      />,
    )

    expect(screen.queryByText(EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_CHANGE_PACKAGE_LABEL }))
    await user.click(screen.getByRole('radio', { name: /Standard Equipment/i }))

    expect(onDraftChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        choiceSelections: expect.objectContaining({
          [monkToolChoiceSetId]: [equipmentStepLuteFixture.id],
        }),
      }),
    )
  })
})
