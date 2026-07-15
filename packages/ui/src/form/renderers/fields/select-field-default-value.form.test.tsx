import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { FormItems } from '../../containers/form-items.client'
import type { FormItem } from '../../field-config'

function PrefixedSelectHarness({
  items,
  namePrefix,
  defaultValues = {},
}: {
  items: FormItem[]
  namePrefix: string
  defaultValues?: Record<string, unknown>
}) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <FormItems items={items} idPrefix="test" namePrefix={namePrefix} />
    </FormProvider>
  )
}

describe('FormItems select defaultValue with namePrefix', () => {
  it('shows field config default when the prefixed path is unset in form defaultValues', () => {
    const items: FormItem[] = [
      {
        type: 'select',
        name: 'policy',
        label: 'Multiclass policy',
        options: [
          { value: 'inherit', label: 'Inherit campaign default' },
          { value: 'allowed', label: 'Allowed' },
        ],
        defaultValue: 'inherit',
      },
    ]

    render(
      <PrefixedSelectHarness
        items={items}
        namePrefix="characterCreation.multiclassing"
        defaultValues={{}}
      />,
    )

    expect(screen.getByLabelText('Multiclass policy')).toHaveTextContent('Inherit campaign default')
  })

  it('shows nested dotted field defaults under a namePrefix', () => {
    const items: FormItem[] = [
      {
        type: 'select',
        name: 'classPolicy.mode',
        label: 'Class policy',
        options: [
          { value: 'all', label: 'All classes' },
          { value: 'only', label: 'Only listed classes' },
        ],
        defaultValue: 'all',
      },
    ]

    render(
      <PrefixedSelectHarness
        items={items}
        namePrefix="characterCreation.multiclassing"
        defaultValues={{}}
      />,
    )

    expect(screen.getByLabelText('Class policy')).toHaveTextContent('All classes')
  })
})
