import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionSections } from './monster-action-sections'

vi.mock('@/features/character', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/character')>()
  return {
    ...actual,
    EquipmentPickerDrawer: ({
      open,
      onCommitAdd,
    }: {
      open: boolean
      onCommitAdd: (item: { equipment: { id: string; name: string } }) => boolean
    }) =>
      open ? (
        <button
          type="button"
          onClick={() => onCommitAdd({ equipment: { id: 'w1', name: 'Longsword' } })}
        >
          Commit mock weapon
        </button>
      ) : null,
  }
})

function Host({ ctx }: { ctx: ContentFormCtx }) {
  const form = useForm<MonsterFormValues>({ defaultValues: resolveMonsterCreateDefaultValues() })
  return (
    <FormProvider {...form}>
      <MonsterActionSections ctx={ctx} />
    </FormProvider>
  )
}

const readyCtx: ContentFormCtx = {
  entityCatalogLayer: 'homebrew',
  equipmentCatalogStatus: 'ready',
  equipmentCatalogById: new Map(),
}

describe('MonsterActionSections', () => {
  it('adds a natural weapon from the shared menu and selects it', async () => {
    const user = userEvent.setup()
    render(<Host ctx={readyCtx} />)

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0]!)
    await user.click(await screen.findByRole('menuitem', { name: /Claw/i }))

    expect(screen.getByDisplayValue('Claw')).toBeInTheDocument()
    expect(screen.getByRole('button', { current: true, name: /Claw/i })).toBeInTheDocument()
  })

  it('opens the weapon picker from add-weapon and commits an equipped row', async () => {
    const user = userEvent.setup()
    render(<Host ctx={readyCtx} />)

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0]!)
    await user.click(await screen.findByRole('menuitem', { name: /Add a weapon/i }))

    await user.click(screen.getByRole('button', { name: 'Commit mock weapon' }))

    expect(screen.getByText(/Longsword was added/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { current: true, name: /Action 1/i })).toBeInTheDocument()
  })
})
