import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { getEditionPresetMechanics } from '@rpg/contracts'

import type { MechanicsValues } from '../lib/rules/mechanics/mechanics-form-fields'
import { defaultMechanicsValues } from '../lib/rules/mechanics/mechanics-form-values'
import { EditionPresetEffects } from './edition-preset-effects'

function Harness({ defaultValues }: { defaultValues: MechanicsValues }) {
  const form = useForm<MechanicsValues>({ defaultValues })
  const armorClassBase = useWatch({ control: form.control, name: 'armorClassBase' })
  const armorClassMode = useWatch({ control: form.control, name: 'armorClassMode' })

  return (
    <FormProvider {...form}>
      <EditionPresetEffects />
      <button type="button" onClick={() => form.setValue('editionPresetId', 'becmi')}>
        Select BECMI
      </button>
      <div data-testid="armor-class-base">{armorClassBase}</div>
      <div data-testid="armor-class-mode">{armorClassMode}</div>
    </FormProvider>
  )
}

describe('EditionPresetEffects', () => {
  it('keeps a loaded drift on the first render', () => {
    render(
      <Harness
        defaultValues={{
          ...defaultMechanicsValues(),
          editionPresetId: 'becmi',
          armorClassMode: 'ascending',
          armorClassBase: '10',
        }}
      />,
    )

    expect(screen.getByTestId('armor-class-base')).toHaveTextContent('10')
    expect(screen.getByTestId('armor-class-mode')).toHaveTextContent('ascending')
  })

  it('applies the selected preset bundle after the user changes the preset', async () => {
    const user = userEvent.setup()
    const becmi = getEditionPresetMechanics('becmi')

    render(<Harness defaultValues={defaultMechanicsValues()} />)

    await user.click(screen.getByRole('button', { name: 'Select BECMI' }))

    expect(screen.getByTestId('armor-class-base')).toHaveTextContent(String(becmi.armorClass.base))
    expect(screen.getByTestId('armor-class-mode')).toHaveTextContent(becmi.armorClass.mode)
  })
})
