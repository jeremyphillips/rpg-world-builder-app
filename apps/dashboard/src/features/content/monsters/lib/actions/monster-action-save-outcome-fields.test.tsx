import { RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from '@rpg/contracts'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { MonsterActionSaveSuccessAmountField } from './monster-action-save-outcome-fields'

function Host() {
  const form = useForm({
    defaultValues: {
      actions: [
        {
          resolution: {
            effects: [{ id: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID }],
            outcomes: [
              {
                result: 'failed-save',
                applications: [{ effectId: RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
              },
            ],
          },
        },
      ],
    },
  })

  return (
    <FormProvider {...form}>
      <MonsterActionSaveSuccessAmountField namePrefix="actions.0" />
      <output data-testid="outcomes">
        {JSON.stringify(form.watch('actions.0.resolution.outcomes'))}
      </output>
    </FormProvider>
  )
}

describe('MonsterActionSaveSuccessAmountField', () => {
  it('names the successful-save control and leaves a missing slot unset', () => {
    render(<Host />)

    expect(screen.getByRole('combobox', { name: 'On successful save' })).toBeInTheDocument()
    expect(screen.queryByText('No effect')).not.toBeInTheDocument()
    expect(screen.getByTestId('outcomes')).not.toHaveTextContent('successful-save')
    expect(screen.getByTestId('outcomes')).toHaveTextContent(RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID)
  })
})
