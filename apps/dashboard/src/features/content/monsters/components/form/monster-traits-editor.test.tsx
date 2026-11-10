import { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

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
  const ctx: ContentFormCtx = {
    entityCatalogLayer: 'homebrew',
    damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
  }
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

  it('keeps water breathing duration behind a checkbox and out of the stored row when off', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<Host formRef={formRef} />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Water Breathing/ }))
    expect(screen.getByText(/can breathe only underwater/)).toBeInTheDocument()
    expect(screen.getByText('Trait preview').closest('.ui-panel')).not.toHaveTextContent(
      'outside water',
    )
    expect(screen.queryByRole('group', { name: 'Duration' })).not.toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox', { name: 'Hold breath outside water' })
    expect(checkbox).not.toBeChecked()
    expect(formRef.current?.getValues('traits.0')).not.toHaveProperty('outsideWaterBreathEnabled')

    await user.click(checkbox)
    await waitFor(() => {
      expect(screen.getByText(/hold its breath for 1 hour outside water/)).toBeInTheDocument()
    })
    expect(formRef.current?.getValues('traits.0')).toMatchObject({
      preset: 'water-breathing',
      outsideWaterBreathAmount: 1,
      outsideWaterBreathUnit: 'hour',
    })

    await user.click(screen.getByRole('checkbox', { name: 'Hold breath outside water' }))
    await waitFor(() => {
      expect(screen.getByText('Trait preview').closest('.ui-panel')).not.toHaveTextContent(
        'outside water',
      )
    })
    const cleared = formRef.current?.getValues('traits.0')
    expect(cleared).not.toHaveProperty('outsideWaterBreathAmount')
    expect(cleared).not.toHaveProperty('outsideWaterBreathUnit')
    expect(cleared).not.toHaveProperty('outsideWaterBreathEnabled')
  })

  it('builds regeneration rules from hit points, 0 HP, and interrupting damage types', async () => {
    const user = userEvent.setup()
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(<Host formRef={formRef} />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await user.click(screen.getByRole('menuitem', { name: /Regeneration/ }))

    const preview = () => screen.getByText('Trait preview').closest('.ui-panel')
    expect(preview()).toHaveTextContent(
      'The owl regains 10 Hit Points at the start of each of its turns if it has at least 1 Hit Point.',
    )
    expect(preview()).not.toHaveTextContent("doesn't regenerate")
    expect(screen.getByRole('checkbox', { name: 'Regenerates at 0 HP' })).not.toBeChecked()
    expect(formRef.current?.getValues('traits.0')).toMatchObject({
      preset: 'regeneration',
      hitPoints: 10,
      regeneratesAtZeroHp: false,
      interruptedByDamageTypes: [],
    })

    await user.click(screen.getByRole('checkbox', { name: 'Regenerates at 0 HP' }))
    await waitFor(() => {
      expect(preview()).toHaveTextContent(
        "The owl regains 10 Hit Points at the start of each of its turns. The owl dies only if it starts its turn with 0 Hit Points and doesn't regenerate.",
      )
    })
    expect(preview()).not.toHaveTextContent('at least 1 Hit Point')

    await user.click(
      screen.getByRole('combobox', { name: 'Damage types that interrupt regeneration' }),
    )
    await user.click(screen.getByRole('option', { name: 'Acid' }))
    const damageSearch = screen.getByRole('searchbox', { name: /search damage types/i })
    await user.type(damageSearch, 'fire')
    expect(screen.getByRole('option', { name: 'Fire' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Cold' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('option', { name: 'Fire' }))
    await waitFor(() => {
      expect(preview()).toHaveTextContent(
        "If the owl takes Acid or Fire damage, this trait doesn't function on the owl's next turn.",
      )
    })
    expect(preview()).toHaveTextContent("doesn't regenerate")
    expect(formRef.current?.getValues('traits.0')).toMatchObject({
      regeneratesAtZeroHp: true,
      interruptedByDamageTypes: ['acid', 'fire'],
    })

    await user.click(screen.getByRole('checkbox', { name: 'Regenerates at 0 HP' }))
    await waitFor(() => {
      expect(preview()).toHaveTextContent('at least 1 Hit Point')
    })
    expect(preview()).toHaveTextContent('Acid or Fire')
    expect(preview()).not.toHaveTextContent("doesn't regenerate")
    expect(formRef.current?.getValues('traits.0')).toMatchObject({
      regeneratesAtZeroHp: false,
      interruptedByDamageTypes: ['acid', 'fire'],
    })
    expect(screen.getByRole('button', { name: /^Regeneration/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Acid' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Fire' })).toBeInTheDocument()
  })
})
