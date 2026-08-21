import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { SpeciesPersonalNameComponentsField } from './species-personal-name-components-field'

function TestHarness({
  defaultValues = { culture: { naming: { supported: true, personalNameComponents: [] } } },
}: {
  defaultValues?: {
    culture: { naming: { supported: true; personalNameComponents: string[] } }
  }
}) {
  const form = useForm({ defaultValues })

  return (
    <FormProvider {...form}>
      <SpeciesPersonalNameComponentsField />
    </FormProvider>
  )
}

describe('SpeciesPersonalNameComponentsField', () => {
  it('reveals chips from the optional disclosure control', async () => {
    const user = userEvent.setup()
    render(<TestHarness />)

    expect(screen.queryByText('Family name')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add personal name components/i }))

    expect(screen.getByText('Family name')).toBeInTheDocument()
  })

  it('starts expanded when values are already populated', () => {
    render(
      <TestHarness
        defaultValues={{
          culture: { naming: { supported: true, personalNameComponents: ['clan'] } },
        }}
      />,
    )

    expect(screen.getByText('Clan name')).toBeInTheDocument()
  })
})
