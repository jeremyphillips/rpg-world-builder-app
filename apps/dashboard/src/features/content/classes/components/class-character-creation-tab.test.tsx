import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { pickClass } from '../../lib/fixtures/pick'
import { characterCreationProficienciesToFormValues } from '../lib/character-creation/class-character-creation-proficiencies-form-values'
import { type StartingEquipmentForm } from '../lib/character-creation/class-starting-equipment-form-fields'
import { startingEquipmentToFormValues } from '../lib/character-creation/class-starting-equipment-form-values'
import { ClassCharacterCreationTab } from './class-character-creation-tab.client'

function TabShell({
  startingEquipment,
  proficiencies,
  formCtx,
}: {
  startingEquipment?: StartingEquipmentForm
  proficiencies?: ReturnType<typeof characterCreationProficienciesToFormValues>
  formCtx?: ContentFormCtx
}) {
  const form = useForm({
    defaultValues: {
      characterCreation: {
        ...(proficiencies ? { proficiencies } : characterCreationProficienciesToFormValues()),
        ...(startingEquipment ? { startingEquipment } : {}),
      },
    },
  })

  return (
    <FormProvider {...form}>
      <ClassCharacterCreationTab
        formCtx={{
          entitySource: formCtx?.entitySource,
          embeddedSeedRowIds: formCtx?.embeddedSeedRowIds,
        }}
      />
    </FormProvider>
  )
}

const monkStartingEquipment = startingEquipmentToFormValues(
  pickClass('monk').characterCreation!.startingEquipment!,
)
const bardStartingEquipment = startingEquipmentToFormValues(
  pickClass('bard').characterCreation!.startingEquipment!,
)

const monkSeedIds = monkStartingEquipment.options.map((option) => option.id!)

describe('ClassCharacterCreationTab', () => {
  it('shows skill proficiency choices even when there is no starting equipment', () => {
    render(<TabShell />)
    expect(screen.getByText('Character can choose')).toBeInTheDocument()
    expect(screen.getByText('Skill Proficiencies from:')).toBeInTheDocument()
    expect(screen.getByText(/No starting equipment yet/i)).toBeInTheDocument()
  })

  it('shows the empty state when there is no starting equipment', () => {
    render(<TabShell />)
    expect(screen.getByText(/No starting equipment yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add starting equipment/i })).toBeInTheDocument()
  })

  it('adds starting equipment and shows inline choose field plus package master-detail', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add starting equipment/i }))

    await waitFor(() => {
      expect(
        screen.getByRole('spinbutton', { name: /Packages to choose count/i }),
      ).toBeInTheDocument()
    })
    expect(screen.getByText('package(s) from list')).toBeInTheDocument()
    expect(screen.getAllByText('Character can choose').length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Drag).*Standard Equipment/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Drag).*Starting Gold/ }),
    ).toBeInTheDocument()
  })

  it('renders monk packages when pre-filled', () => {
    render(
      <TabShell
        startingEquipment={monkStartingEquipment}
        formCtx={{
          entitySource: 'system',
          embeddedSeedRowIds: {
            'characterCreation.startingEquipment.options': monkSeedIds,
          },
        }}
      />,
    )
    expect(
      screen.getByRole('spinbutton', { name: /Packages to choose count/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Drag).*Standard Equipment/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Drag).*Starting Gold/ }),
    ).toBeInTheDocument()
  })

  it('renders bard pool choice packages when pre-filled', async () => {
    const user = userEvent.setup()
    render(
      <TabShell
        startingEquipment={bardStartingEquipment}
        formCtx={{
          entitySource: 'system',
          embeddedSeedRowIds: {
            'characterCreation.startingEquipment.options': bardStartingEquipment.options.map(
              (option) => option.id!,
            ),
          },
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^(?!Remove|Drag).*Standard Equipment/ }))
    expect(screen.queryByRole('textbox', { name: /Option id/i })).not.toBeInTheDocument()
    expect(screen.getByRole('switch', { name: /Active in campaign/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Items/i })).toBeInTheDocument()
  })

  it('protects system seed packages on a system class', async () => {
    const user = userEvent.setup()
    render(
      <TabShell
        startingEquipment={monkStartingEquipment}
        formCtx={{
          entitySource: 'system',
          embeddedSeedRowIds: {
            'characterCreation.startingEquipment.options': monkSeedIds,
          },
        }}
      />,
    )

    expect(screen.getAllByText('System').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByRole('button', { name: /Remove Starting Gold/i })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Remove Standard Equipment/i }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^(?!Remove|Drag).*Starting Gold/ }))
    await user.click(screen.getByRole('switch', { name: /Active in campaign/i }))

    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('renders rogue skill choices when pre-filled', () => {
    const rogueProficiencies = characterCreationProficienciesToFormValues(
      pickClass('rogue').characterCreation,
    )
    render(
      <TabShell
        proficiencies={rogueProficiencies}
        startingEquipment={monkStartingEquipment}
        formCtx={{
          entitySource: 'system',
          embeddedSeedRowIds: {
            'characterCreation.startingEquipment.options': monkSeedIds,
          },
        }}
      />,
    )
    const chooseSpinbuttons = screen.getAllByRole('spinbutton')
    expect(chooseSpinbuttons.some((input) => input.getAttribute('value') === '4')).toBe(true)
  })

  it('has no axe accessibility violations in the empty state', async () => {
    const { container } = render(<TabShell />)
    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations with monk starting equipment', async () => {
    const { container } = render(
      <TabShell
        startingEquipment={monkStartingEquipment}
        formCtx={{
          entitySource: 'system',
          embeddedSeedRowIds: {
            'characterCreation.startingEquipment.options': monkSeedIds,
          },
        }}
      />,
    )
    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations with bard starting equipment', async () => {
    const { container } = render(
      <TabShell
        startingEquipment={bardStartingEquipment}
        formCtx={{
          entitySource: 'system',
          embeddedSeedRowIds: {
            'characterCreation.startingEquipment.options': bardStartingEquipment.options.map(
              (option) => option.id!,
            ),
          },
        }}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
