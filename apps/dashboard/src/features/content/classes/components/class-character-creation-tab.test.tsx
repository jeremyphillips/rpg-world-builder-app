import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { pickClass } from '../../lib/fixtures/pick'
import { characterCreationProficienciesToFormValues } from '../lib/character-creation/class-character-creation-proficiencies-form-values'
import { type StartingEquipmentForm } from '../lib/character-creation/class-starting-equipment-form-fields'
import {
  startingEquipmentEmptyFormValues,
  startingEquipmentToFormValues,
} from '../lib/character-creation/class-starting-equipment-form-values'
import { ClassCharacterCreationTab } from './class-character-creation-tab'

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
        startingEquipment: startingEquipment ?? startingEquipmentEmptyFormValues(),
        ...(proficiencies ? { proficiencies } : characterCreationProficienciesToFormValues()),
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

function packageListRow(name: string | RegExp) {
  return within(screen.getByRole('navigation', { name: 'Starting equipment packages' })).getByRole(
    'button',
    { name },
  )
}

describe('ClassCharacterCreationTab', () => {
  it('shows skill and tool proficiency choices with an empty starting-equipment master-detail', () => {
    render(<TabShell />)
    expect(screen.getAllByText('Character chooses').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Skill Proficiencies from:')).toBeInTheDocument()
    expect(
      screen.getByText(/Define the class's baseline equipment and wealth/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Starting equipment/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add package/i })).toBeInTheDocument()
    expect(screen.getByText(/No packages added/i)).toBeInTheDocument()
  })

  it('adds a package via the master-detail list action', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add package/i }))

    await waitFor(() => {
      expect(packageListRow(/Unnamed Package/)).toBeInTheDocument()
    })
    expect(screen.getByRole('group', { name: /Items/i })).toBeInTheDocument()
    expect(
      screen.queryByText('Character can choose one package from below'),
    ).not.toBeInTheDocument()
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
    expect(packageListRow(/Standard Equipment/)).toBeInTheDocument()
    expect(packageListRow(/Starting Gold/)).toBeInTheDocument()
  })

  it('shows campaign availability counts for packages', () => {
    render(
      <TabShell
        startingEquipment={{
          ...monkStartingEquipment,
          options: monkStartingEquipment.options.map((option, index) =>
            index === 1 ? { ...option, available: false } : option,
          ),
        }}
        formCtx={{
          entitySource: 'system',
          embeddedSeedRowIds: {
            'characterCreation.startingEquipment.options': monkSeedIds,
          },
        }}
      />,
    )

    expect(screen.getByText('1 available · 1 unavailable')).toBeInTheDocument()
  })

  it('shows compact package stats in list and detail headers instead of prose descriptions', async () => {
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

    const packageList = within(
      screen.getByRole('navigation', { name: 'Starting equipment packages' }),
    )

    expect(packageListRow(/4 items · 11 GP/)).toBeInTheDocument()
    expect(packageListRow(/0 items · 50 GP/)).toBeInTheDocument()
    expect(packageList.queryByText(/Class equipment and baseline wealth/i)).not.toBeInTheDocument()

    await user.click(packageListRow(/Standard Equipment/))
    expect(screen.getByText('4 items · 11 GP · System')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Description/i })).toHaveValue(
      'Class equipment and baseline wealth',
    )
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

    await user.click(packageListRow(/Standard Equipment/))
    expect(screen.queryByRole('textbox', { name: /Option id/i })).not.toBeInTheDocument()
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

    expect(screen.getAllByText(/System/).length).toBeGreaterThanOrEqual(1)
    expect(
      screen.queryByRole('button', { name: /Actions for Starting Gold/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Actions for Standard Equipment/i }),
    ).not.toBeInTheDocument()

    await user.click(packageListRow(/Starting Gold/))
    expect(screen.getByRole('group', { name: /Items/i })).toBeInTheDocument()
  })

  it('renders bard tool proficiency choices when pre-filled', () => {
    const bardProficiencies = characterCreationProficienciesToFormValues(
      pickClass('bard').characterCreation,
    )
    render(<TabShell proficiencies={bardProficiencies} />)
    const chooseSpinbuttons = screen.getAllByRole('spinbutton')
    expect(chooseSpinbuttons.some((input) => input.getAttribute('value') === '3')).toBe(true)
    expect(screen.getAllByText('Character chooses').length).toBeGreaterThanOrEqual(1)
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

  itAxe('has no axe accessibility violations in the empty state', async () => {
    const { container } = render(<TabShell />)
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe accessibility violations with monk starting equipment', async () => {
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

  itAxe('has no axe accessibility violations with bard starting equipment', async () => {
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
