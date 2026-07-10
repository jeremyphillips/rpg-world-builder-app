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
  equipmentStepCatalogFixture,
  equipmentStepDrumFixture,
  equipmentStepLeatherArmorFixture,
  equipmentStepLuteFixture,
  equipmentStepMonkClassFixture,
} from '../../lib/equipment-step.fixtures'
import {
  EQUIPMENT_INCLUDED_TOOL_RELATIONSHIP_GUIDANCE,
  EQUIPMENT_INCLUDED_TOOL_SECTION_LABEL,
  EQUIPMENT_STEP_BROWSE_LABEL,
  EQUIPMENT_STEP_CUSTOMIZE_LABEL,
} from '../../lib/equipment-step.lib'
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

    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL })).toBeInTheDocument()
    expect(screen.getAllByText('90 GP').length).toBeGreaterThanOrEqual(1)

    await user.click(screen.getByRole('button', { name: EQUIPMENT_STEP_BROWSE_LABEL }))

    expect(screen.getByRole('dialog', { name: 'Add equipment' })).toBeInTheDocument()
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
    await user.click(screen.getByRole('tab', { name: /All/i }))
    const leatherArmorRow = screen
      .getAllByRole('listitem')
      .find((row) => within(row).queryByText(equipmentStepLeatherArmorFixture.name))!
    await user.click(within(leatherArmorRow).getByRole('button', { name: 'Add' }))

    expect(onDraftChange).toHaveBeenCalledWith(
      expect.objectContaining({
        equipment: expect.objectContaining({
          purchases: [
            {
              equipmentId: equipmentStepLeatherArmorFixture.id,
              quantity: 1,
              sourceMode: 'startingGold',
            },
          ],
        }),
      }),
    )
  })

  it('shows customize controls for a selected package', async () => {
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

    expect(screen.getByRole('button', { name: EQUIPMENT_STEP_CUSTOMIZE_LABEL })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: EQUIPMENT_STEP_CUSTOMIZE_LABEL }))

    expect(screen.getByRole('dialog', { name: 'Add equipment' })).toBeInTheDocument()
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

  it('syncs inline tool changes to inventory and replaces the previous tool', () => {
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

  it('displays a proficiencies preselection in the inline field', () => {
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
