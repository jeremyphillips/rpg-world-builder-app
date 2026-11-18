import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { monsterActionDetailFields } from '../../lib/actions/detail-fields/monster-action-detail-fields'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { monsterFormTestValues } from '../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterFormAvailabilityControl } from './monster-form-availability'

const values = monsterFormTestValues({
  name: 'Werebear',
  forms: {
    profileFormId: 'profile',
    trueForm: { kind: 'defined', formId: 'humanoid' },
    definedForms: [
      { id: 'humanoid', name: 'Humanoid' },
      { id: 'hybrid', name: 'Bear-humanoid hybrid' },
      { id: 'bear', name: 'Bear' },
    ],
  },
  actions: [
    { id: 'rend', kind: 'special', name: 'Rend', description: '<p>Claws.</p>' },
  ] as MonsterFormValues['actions'],
})

function Host() {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <MonsterFormAvailabilityControl namePrefix="actions.0" />
      <RestrictionState />
    </FormProvider>
  )
}

function RestrictionState() {
  const ids = useWatch<MonsterFormValues>({ name: 'actions.0.onlyInFormIds' as never })
  return <output aria-label="restriction">{JSON.stringify(ids ?? null)}</output>
}

describe('MonsterFormAvailabilityControl', () => {
  it('stores selected forms in click order and clears the key for all forms', async () => {
    const user = userEvent.setup()
    render(<Host />)

    expect(screen.queryByRole('checkbox', { name: 'Bear' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Only in selected forms' }))
    await user.click(screen.getByRole('checkbox', { name: 'Bear' }))
    await user.click(screen.getByRole('checkbox', { name: 'Bear-humanoid hybrid' }))

    expect(screen.getByLabelText('restriction')).toHaveTextContent('["bear","hybrid"]')
    expect(screen.getByText('Rend (Bear or Bear-humanoid hybrid Form Only)')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'All forms' }))
    expect(screen.getByLabelText('restriction')).toHaveTextContent('null')
  })

  it('omits the control from Shape-Shift and includes it on other actions', () => {
    const ctx = {} as ContentFormCtx
    const shared = {
      ctx,
      section: 'actions' as const,
      namePrefix: 'actions.0',
      equipmentOptions: [],
      sharedCastingOptions: [],
    }
    const shapeShift = monsterActionDetailFields({
      ...shared,
      action: { id: 'shift', kind: 'shape-shift', equipment: 'unchanged' },
    })
    const rend = monsterActionDetailFields({
      ...shared,
      action: { id: 'rend', kind: 'special', name: 'Rend' },
    })
    expect(shapeShift.some((item) => 'name' in item && item.name === 'formAvailability')).toBe(
      false,
    )
    expect(rend.some((item) => 'name' in item && item.name === 'formAvailability')).toBe(true)
  })
})
