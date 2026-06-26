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
  entitySource,
}: {
  startingEquipment?: StartingEquipmentForm
  entitySource?: ContentFormCtx['entitySource']
}) {
  const form = useForm({
    defaultValues: {
      characterCreation: startingEquipment ? { startingEquipment } : undefined,
    },
  })

  return (
    <FormProvider {...form}>
      <ClassCharacterCreationTab formCtx={{ entitySource }} />
    </FormProvider>
  )
}

const monkStartingEquipment = startingEquipmentToFormValues(
  pickClass('monk').characterCreation!.startingEquipment!,
)
const bardStartingEquipment = startingEquipmentToFormValues(
  pickClass('bard').characterCreation!.startingEquipment!,
)

describe('ClassCharacterCreationTab', () => {
  it('shows the empty state when there is no starting equipment', () => {
    render(<TabShell />)
    expect(screen.getByText(/No starting equipment yet/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add starting equipment/i })).toBeInTheDocument()
  })

  it('adds starting equipment and shows choose field plus package master-detail', async () => {
    const user = userEvent.setup()
    render(<TabShell />)

    await user.click(screen.getByRole('button', { name: /Add starting equipment/i }))

    await waitFor(() => {
      expect(screen.getByRole('spinbutton', { name: /Packages to choose/i })).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Drag).*Standard Equipment/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Drag).*Starting Gold/ }),
    ).toBeInTheDocument()
  })

  it('renders monk packages when pre-filled', () => {
    render(<TabShell startingEquipment={monkStartingEquipment} entitySource="system" />)
    expect(screen.getByRole('spinbutton', { name: /Packages to choose/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Drag).*Standard Equipment/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^(?!Remove|Drag).*Starting Gold/ }),
    ).toBeInTheDocument()
  })

  it('renders bard pool choice packages when pre-filled', async () => {
    const user = userEvent.setup()
    render(<TabShell startingEquipment={bardStartingEquipment} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /^(?!Remove|Drag).*Standard Equipment/ }))
    expect(screen.getByRole('textbox', { name: /Option id/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /Items/i })).toBeInTheDocument()
  })

  it('allows deleting packages on a system class (no delete lock)', async () => {
    const user = userEvent.setup()
    render(<TabShell startingEquipment={monkStartingEquipment} entitySource="system" />)

    await user.click(screen.getByRole('button', { name: /Remove Starting Gold/i }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete package?')

    await user.click(screen.getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Starting Gold/i })).not.toBeInTheDocument()
    })
    expect(screen.queryByText('System')).not.toBeInTheDocument()
  })

  it('removes all starting equipment from the remove control', async () => {
    const user = userEvent.setup()
    render(<TabShell startingEquipment={monkStartingEquipment} />)

    await user.click(screen.getByRole('button', { name: /Remove starting equipment/i }))

    await waitFor(() => {
      expect(screen.getByText(/No starting equipment yet/i)).toBeInTheDocument()
    })
  })

  it('has no axe accessibility violations in the empty state', async () => {
    const { container } = render(<TabShell />)
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })

  it('has no axe accessibility violations with monk starting equipment', async () => {
    const { container } = render(
      <TabShell startingEquipment={monkStartingEquipment} entitySource="system" />,
    )
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })

  it('has no axe accessibility violations with bard starting equipment', async () => {
    const { container } = render(
      <TabShell startingEquipment={bardStartingEquipment} entitySource="system" />,
    )
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
