import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterTraitsEditor } from './monster-traits-editor'

function Host({
  values,
  formRef,
}: {
  values?: MonsterFormValues
  formRef?: { current: UseFormReturn<MonsterFormValues> | null }
}) {
  const form = useForm<MonsterFormValues>({
    defaultValues: values ?? { ...resolveMonsterCreateDefaultValues(), name: 'Owl' },
  })
  useEffect(() => {
    if (!formRef) return
    formRef.current = form
  }, [form, formRef])
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
    const preview = screen.getByText('Trait preview').closest('.ui-panel')
    expect(preview).toHaveTextContent(/The owl doesn't provoke an Opportunity Attack/)
    expect(preview).not.toHaveTextContent('Flyby')

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Custom trait/ }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
    expect(screen.queryByText('Trait preview')).not.toBeInTheDocument()
  })

  it('shows a Tunneler advisory only on that trait', async () => {
    const user = userEvent.setup()
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Ankheg'
    values.traits = [
      { id: 'note', name: 'Note', description: 'Custom.' },
      { id: 'tunnel', preset: 'tunneler' },
    ]
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<Host values={values} formRef={formRef} />)
    expect(
      screen.queryByText(/Tunneler uses half the creature's Burrow Speed/),
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Tunneler/ }))
    const preview = screen.getByText('Trait preview')
    const alert = screen.getByText(/Tunneler uses half the creature's Burrow Speed/)
    expect(preview.compareDocumentPosition(alert) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(alert.closest('.ui-alert')).toHaveClass('ui-alert--warning')
    expect(preview.closest('.ui-panel')).toHaveTextContent(/burrow through solid rock/)
    expect(preview.closest('.ui-panel')).not.toHaveTextContent('Tunneler')

    formRef.current?.setValue('movement', [{ mode: 'burrow', feet: 20 }])
    await waitFor(() => {
      expect(
        screen.queryByText(/Tunneler uses half the creature's Burrow Speed/),
      ).not.toBeInTheDocument()
    })
    expect(formRef.current?.getValues('traits.1')).toEqual({ id: 'tunnel', preset: 'tunneler' })

    await user.click(screen.getByRole('button', { name: /Note/ }))
    expect(screen.queryByText('Trait preview')).not.toBeInTheDocument()
  })
})
