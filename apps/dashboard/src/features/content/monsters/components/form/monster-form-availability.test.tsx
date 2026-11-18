import { useEffect } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { monsterFormRestrictionEligibleIds } from '@rpg/contracts'

import { monsterActionDetailFields } from '../../lib/actions/detail-fields/monster-action-detail-fields'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { makeEmptyMonsterForms } from '../../lib/forms/monster-forms-form-values'
import { monsterFormTestValues } from '../../lib/monster-form-test-values'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterFormAvailabilityControl } from './monster-form-availability'

const ctx = {} as ContentFormCtx

function AvailabilityHost({
  values,
  onMount,
}: {
  values: MonsterFormValues
  onMount?: (form: UseFormReturn<MonsterFormValues>) => void
}) {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  useEffect(() => {
    onMount?.(form)
  }, [form, onMount])
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

function renderControl(overrides: Partial<MonsterFormValues> & Pick<MonsterFormValues, 'name'>) {
  return render(
    <AvailabilityHost
      values={monsterFormTestValues({
        actions: [{ id: 'rend', kind: 'special', name: 'Rend' }] as MonsterFormValues['actions'],
        ...overrides,
      })}
    />,
  )
}

function expectFormAvailabilityVisible(visible: boolean) {
  const control = screen.queryByRole('radio', { name: 'All forms' })
  if (visible) expect(control).toBeInTheDocument()
  else expect(control).not.toBeInTheDocument()
}

describe('MonsterFormAvailabilityControl', () => {
  it('stores selected forms in click order and clears the key for all forms', async () => {
    const user = userEvent.setup()
    renderControl({
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
    })

    expect(screen.queryByRole('checkbox', { name: 'Bear' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: 'Only in selected forms' }))
    await user.click(screen.getByRole('checkbox', { name: 'Bear' }))
    await user.click(screen.getByRole('checkbox', { name: 'Bear-humanoid hybrid' }))

    expect(screen.getByLabelText('restriction')).toHaveTextContent('["bear","hybrid"]')
    expect(screen.getByText('Rend (Bear or Bear-humanoid hybrid Form Only)')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'All forms' }))
    expect(screen.getByLabelText('restriction')).toHaveTextContent('null')
  })

  it('hides when forms are absent and the row is unrestricted', () => {
    renderControl({ name: 'Werebear' })
    expectFormAvailabilityVisible(false)
  })

  it('hides when forms are configured but no defined forms exist', () => {
    renderControl({
      name: 'Werebear',
      forms: makeEmptyMonsterForms(),
    })
    expectFormAvailabilityVisible(false)
  })

  it('shows when the profile is true and at least one defined form exists', () => {
    renderControl({
      name: 'Werebear',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'profile' },
        definedForms: [{ id: 'bear', name: 'Bear' }],
      },
    })
    expectFormAvailabilityVisible(true)
  })

  it('hides when the designated defined form has no alternate', () => {
    renderControl({
      name: 'Werebear',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [{ id: 'humanoid', name: 'Humanoid' }],
      },
    })
    expectFormAvailabilityVisible(false)
  })

  it('shows when a defined true form has another eligible defined form', () => {
    renderControl({
      name: 'Werebear',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'humanoid' },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid' },
          { id: 'bear', name: 'Bear' },
        ],
      },
    })
    expectFormAvailabilityVisible(true)
  })

  it('shows during incomplete designation when multiple defined forms exist', () => {
    renderControl({
      name: 'Werebear',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined' },
        definedForms: [
          { id: 'humanoid', name: 'Humanoid' },
          { id: 'bear', name: 'Bear' },
        ],
      },
    })
    expectFormAvailabilityVisible(true)
  })

  it('stays visible when the restriction key is present with an empty list', () => {
    renderControl({
      name: 'Werebear',
      actions: [
        { id: 'rend', kind: 'special', name: 'Rend', onlyInFormIds: [] },
      ] as MonsterFormValues['actions'],
    })
    expectFormAvailabilityVisible(true)
    expect(screen.getByRole('radio', { name: 'Only in selected forms' })).toBeChecked()
  })

  it('stays visible for stale restriction ids and lists missing forms', () => {
    renderControl({
      name: 'Werebear',
      forms: makeEmptyMonsterForms(),
      actions: [
        { id: 'rend', kind: 'special', name: 'Rend', onlyInFormIds: ['stale-id'] },
      ] as MonsterFormValues['actions'],
    })
    expectFormAvailabilityVisible(true)
    expect(screen.getByRole('checkbox', { name: /Missing form/i })).toBeInTheDocument()
  })

  it('offers recovery through all forms when restrictions outlive form configuration', async () => {
    const user = userEvent.setup()
    renderControl({
      name: 'Werebear',
      actions: [
        { id: 'rend', kind: 'special', name: 'Rend', onlyInFormIds: ['bear'] },
      ] as MonsterFormValues['actions'],
    })
    expectFormAvailabilityVisible(true)
    await user.click(screen.getByRole('radio', { name: 'All forms' }))
    expect(screen.getByLabelText('restriction')).toHaveTextContent('null')
  })

  it('lists chip options that match restriction-eligible ids', async () => {
    const user = userEvent.setup()
    const forms = {
      profileFormId: 'profile',
      trueForm: { kind: 'profile' as const },
      definedForms: [
        { id: 'bear', name: 'Bear' },
        { id: 'hybrid', name: 'Hybrid' },
      ],
    }
    renderControl({ name: 'Werebear', forms })
    const eligible = monsterFormRestrictionEligibleIds(forms)
    expect(eligible).toHaveLength(3)

    await user.click(screen.getByRole('radio', { name: 'Only in selected forms' }))
    for (const id of eligible) {
      const label =
        id === 'profile'
          ? screen.getByRole('checkbox', { name: 'Werebear' })
          : id === 'bear'
            ? screen.getByRole('checkbox', { name: 'Bear' })
            : screen.getByRole('checkbox', { name: 'Hybrid' })
      expect(label).toBeInTheDocument()
    }
  })

  it('updates visibility when defined forms change without remounting', () => {
    const formRef: { current: UseFormReturn<MonsterFormValues> | null } = { current: null }
    render(
      <AvailabilityHost
        values={monsterFormTestValues({
          name: 'Werebear',
          forms: {
            profileFormId: 'profile',
            trueForm: { kind: 'profile' },
            definedForms: [],
          },
          actions: [{ id: 'rend', kind: 'special', name: 'Rend' }] as MonsterFormValues['actions'],
        })}
        onMount={(form) => {
          formRef.current = form
        }}
      />,
    )

    expectFormAvailabilityVisible(false)
    act(() => {
      formRef.current?.setValue(
        'forms',
        {
          profileFormId: 'profile',
          trueForm: { kind: 'profile' },
          definedForms: [{ id: 'bear', name: 'Bear' }],
        },
        { shouldDirty: true },
      )
    })
    return waitFor(() => expectFormAvailabilityVisible(true))
  })

  it('omits the control from Shape-Shift and includes it on other actions', () => {
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
