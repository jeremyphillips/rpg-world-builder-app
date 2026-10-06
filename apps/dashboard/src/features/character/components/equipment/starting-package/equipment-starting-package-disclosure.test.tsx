import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
  buildStartingPackageConversionPreview,
  createEmptyCharacterBuilderDraft,
  resolveStartingEquipmentFundingOptions,
  startingEquipmentChoiceSetId,
} from '@rpg/contracts'

import {
  equipmentStepCatalogIndexFixture,
  equipmentStepMonkClassFixture,
} from '../../../lib/equipment/equipment-step.fixtures'
import {
  EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE_SHORT,
  EQUIPMENT_PACKAGE_CHANGE_OPTION_MENU_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_MENU_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_UNAVAILABLE_REASON,
  EQUIPMENT_STARTING_PACKAGE_TITLE,
} from '../../../lib/equipment/equipment-step.lib'
import { buildEquipmentInventoryViewModel } from '../../../lib/equipment/equipment-inventory-summary.lib'
import {
  EquipmentStartingPackageDisclosure,
  EquipmentStartingPackageGoldHeader,
} from './equipment-starting-package-disclosure'

function monkPackageDraft() {
  return {
    ...createEmptyCharacterBuilderDraft(),
    class: { classId: equipmentStepMonkClassFixture.id, level: 1 as const },
    choiceSelections: {
      [startingEquipmentChoiceSetId(equipmentStepMonkClassFixture.id)]: ['standard-equipment'],
    },
    equipment: {
      mode: 'package' as const,
      purchases: [],
      editedSincePackageSelection: false,
    },
  }
}

function packageFixture() {
  const draft = monkPackageDraft()
  const viewModel = buildEquipmentInventoryViewModel(draft, equipmentStepCatalogIndexFixture)
  if (viewModel?.layout !== 'split' || viewModel.startingEquipment.kind !== 'package') {
    throw new Error('Expected a starting package channel')
  }

  const goldOptionFunding = resolveStartingEquipmentFundingOptions({
    draft,
    catalogIndex: equipmentStepCatalogIndexFixture,
  }).get('starting-gold')
  if (!goldOptionFunding) throw new Error('Expected starting-gold funding')

  const preview = buildStartingPackageConversionPreview({
    draft,
    catalogIndex: equipmentStepCatalogIndexFixture,
    departingOptionId: viewModel.startingEquipment.group.optionId,
    targetFunding: goldOptionFunding,
    selectedPackageItemKeys: new Set(),
  })

  return {
    draft,
    packageGroup: viewModel.startingEquipment.group,
    goldOptionFunding,
    initialKeys: new Set(
      preview?.items
        .filter((item) => item.status === 'selectable')
        .map((item) => item.packageItemKey) ?? [],
    ),
  }
}

function DisclosureHarness({
  conversionStartsOpen = false,
  customizeDisabled = false,
  defaultExpanded = false,
}: {
  conversionStartsOpen?: boolean
  customizeDisabled?: boolean
  defaultExpanded?: boolean
}) {
  const fixture = packageFixture()
  const [conversionEditorOpen, setConversionEditorOpen] = useState(conversionStartsOpen)
  const [selectedPackageItemKeys, setSelectedPackageItemKeys] = useState(fixture.initialKeys)
  const onChangeEquipmentOption = vi.fn()
  const onCommitConversion = vi.fn()

  return (
    <EquipmentStartingPackageDisclosure
      packageGroup={
        customizeDisabled
          ? {
              ...fixture.packageGroup,
              customize: {
                status: 'disabled',
                reason: EQUIPMENT_PACKAGE_CUSTOMIZE_UNAVAILABLE_REASON,
              },
            }
          : fixture.packageGroup
      }
      draft={fixture.draft}
      catalogIndex={equipmentStepCatalogIndexFixture}
      goldOptionFunding={fixture.goldOptionFunding}
      conversionEditorOpen={conversionEditorOpen}
      selectedPackageItemKeys={selectedPackageItemKeys}
      defaultExpanded={defaultExpanded}
      onCustomize={() => setConversionEditorOpen(true)}
      onChangeEquipmentOption={onChangeEquipmentOption}
      onSelectedPackageItemKeysChange={(keys) => setSelectedPackageItemKeys(new Set(keys))}
      onCancelConversion={() => setConversionEditorOpen(false)}
      onCommitConversion={onCommitConversion}
    />
  )
}

describe('EquipmentStartingPackageDisclosure', () => {
  it('toggles the package body', async () => {
    const user = userEvent.setup()
    render(<DisclosureHarness />)

    expect(screen.queryByText('Spear')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^Starting Package/ }))
    expect(screen.getByText('Spear')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Collapse starting package' }))
    expect(screen.queryByText('Spear')).not.toBeInTheDocument()
  })

  it('opens customize from the overflow menu and strikes an unchecked row', async () => {
    const user = userEvent.setup()
    render(<DisclosureHarness />)

    await user.click(
      screen.getByRole('button', {
        name: `Actions for ${packageFixture().packageGroup.optionLabel}`,
      }),
    )
    await user.click(screen.getByRole('menuitem', { name: EQUIPMENT_PACKAGE_CUSTOMIZE_MENU_LABEL }))

    expect(
      screen.getByText('Choose which package items to keep as starting-gold purchases.'),
    ).toBeInTheDocument()

    const spear = screen.getByRole('checkbox', { name: 'Spear' })
    expect(spear).toBeChecked()
    await user.click(spear)
    expect(screen.getByText('Spear')).toHaveClass('line-through')
  })

  it('cancels and commits customize mode', async () => {
    const user = userEvent.setup()
    const onCommitConversion = vi.fn()
    const fixture = packageFixture()

    function CommitHarness() {
      const [conversionEditorOpen, setConversionEditorOpen] = useState(true)
      const [selectedPackageItemKeys, setSelectedPackageItemKeys] = useState<ReadonlySet<string>>(
        new Set(),
      )
      return (
        <EquipmentStartingPackageDisclosure
          packageGroup={fixture.packageGroup}
          draft={fixture.draft}
          catalogIndex={equipmentStepCatalogIndexFixture}
          goldOptionFunding={fixture.goldOptionFunding}
          conversionEditorOpen={conversionEditorOpen}
          selectedPackageItemKeys={selectedPackageItemKeys}
          onCustomize={() => setConversionEditorOpen(true)}
          onChangeEquipmentOption={vi.fn()}
          onSelectedPackageItemKeysChange={(keys) => setSelectedPackageItemKeys(new Set(keys))}
          onCancelConversion={() => setConversionEditorOpen(false)}
          onCommitConversion={onCommitConversion}
        />
      )
    }

    render(<CommitHarness />)

    await user.click(screen.getByRole('button', { name: 'Use starting gold' }))
    expect(onCommitConversion).toHaveBeenCalledOnce()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(
      screen.queryByText('Choose which package items to keep as starting-gold purchases.'),
    ).not.toBeInTheDocument()
  })

  it('disables customize when no gold alternative exists', async () => {
    const user = userEvent.setup()
    render(<DisclosureHarness customizeDisabled defaultExpanded />)

    expect(screen.getByText(EQUIPMENT_PACKAGE_CUSTOMIZE_UNAVAILABLE_REASON)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Customize' })).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: `Actions for ${packageFixture().packageGroup.optionLabel}`,
      }),
    )
    expect(
      screen.getByRole('menuitem', { name: EQUIPMENT_PACKAGE_CUSTOMIZE_MENU_LABEL }),
    ).toHaveAttribute('data-disabled')
    expect(
      screen.getByRole('menuitem', { name: EQUIPMENT_PACKAGE_CHANGE_OPTION_MENU_LABEL }),
    ).toBeInTheDocument()
  })
})

describe('EquipmentStartingPackageGoldHeader', () => {
  it('shows the static gold-path subtitle', () => {
    render(<EquipmentStartingPackageGoldHeader optionLabel="Starting Gold" />)

    expect(
      screen.getByRole('heading', { name: EQUIPMENT_STARTING_PACKAGE_TITLE }),
    ).toBeInTheDocument()
    expect(screen.getByText(/No package gear/)).toHaveTextContent(
      `${EQUIPMENT_GOLD_OPTION_STARTING_MESSAGE_SHORT} · Starting Gold`,
    )
    expect(screen.queryByRole('button', { name: /^Starting Package/ })).not.toBeInTheDocument()
  })
})
