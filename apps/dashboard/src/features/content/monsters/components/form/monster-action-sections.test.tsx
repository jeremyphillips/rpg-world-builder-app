import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterActionSections } from './monster-action-sections'

function Host() {
  const form = useForm<MonsterFormValues>({ defaultValues: resolveMonsterCreateDefaultValues() })
  const ctx: ContentFormCtx = {
    entityCatalogLayer: 'homebrew',
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
  }
  return (
    <FormProvider {...form}>
      <MonsterActionSections ctx={ctx} />
    </FormProvider>
  )
}

describe('MonsterActionSections', () => {
  it('adds a natural weapon from the shared menu and selects it', async () => {
    const user = userEvent.setup()
    render(<Host />)

    const addButtons = screen.getAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0]!)
    await user.click(await screen.findByRole('menuitem', { name: /Claw/i }))

    expect(screen.getByDisplayValue('Claw')).toBeInTheDocument()
    expect(screen.getByRole('button', { current: true, name: /Claw/i })).toBeInTheDocument()
  })
})
