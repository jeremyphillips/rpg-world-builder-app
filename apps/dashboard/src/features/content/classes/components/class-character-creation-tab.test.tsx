import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../lib/content-form-registry'
import { pickClass } from '../../lib/fixtures/pick'
import {
  startingEquipmentToFormValues,
  type StartingEquipmentForm,
} from '../lib/class-starting-equipment-form-def'
import { ClassCharacterCreationTab } from './class-character-creation-tab.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

function TabShell({
  startingEquipment,
  formCtx,
}: {
  startingEquipment?: StartingEquipmentForm
  formCtx?: ContentFormCtx
}) {
  const form = useForm({
    defaultValues: {
      characterCreation: startingEquipment ? { startingEquipment } : undefined,
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
    expect(screen.getByText('packages from list')).toBeInTheDocument()
    expect(screen.getByText('Class can choose')).toBeInTheDocument()
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

  it('has no axe accessibility violations in the empty state', async () => {
    const { container } = render(<TabShell />)
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
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
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
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
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
