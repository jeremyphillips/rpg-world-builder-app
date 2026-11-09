import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterTraitsEditor } from './monster-traits-editor'

function Host({ values }: { values?: MonsterFormValues }) {
  const form = useForm<MonsterFormValues>({
    defaultValues: values ?? { ...resolveMonsterCreateDefaultValues(), name: 'Owl' },
  })
  const ctx: ContentFormCtx = { entityCatalogLayer: 'homebrew' }
  return (
    <FormProvider {...form}>
      <MonsterTraitsEditor ctx={ctx} />
    </FormProvider>
  )
}

describe('MonsterTraitsEditor', () => {
  it('finds Flyby from its discovery description', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search traits…' }), 'flying')
    expect(screen.getByRole('menuitem', { name: /Flyby/ })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: /Pack Tactics/ })).not.toBeInTheDocument()
  })

  it('shows the generated sentence for a preset and keeps custom fields editable', async () => {
    const user = userEvent.setup()
    render(<Host />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Flyby/ }))
    expect(screen.getByText(/The owl doesn't provoke an Opportunity Attack/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Custom trait/ }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })
})
