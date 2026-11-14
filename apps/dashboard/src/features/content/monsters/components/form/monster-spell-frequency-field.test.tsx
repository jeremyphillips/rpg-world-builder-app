import { useEffect } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { MonsterSpellFrequencyField } from './monster-spell-frequency-field'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

function Host({
  values,
  onReady,
}: {
  values: Record<string, unknown>
  onReady?: (getValues: () => Record<string, unknown>) => void
}) {
  const form = useForm<Record<string, unknown>>({ defaultValues: values })
  onReady?.(() => form.getValues())
  return (
    <FormProvider {...form}>
      <MonsterSpellFrequencyField spellLimitName="spell.limitedUse" actionLimitName="limitedUse" />
    </FormProvider>
  )
}

describe('MonsterSpellFrequencyField', () => {
  it('names the control Frequency and does not write a limit on mount', () => {
    let read: (() => Record<string, unknown>) | undefined
    render(<Host values={{ spell: {} }} onReady={(getValues) => (read = getValues)} />)
    expect(screen.getByRole('combobox', { name: 'Frequency' })).toHaveTextContent('At will')
    expect(screen.getByText('Frequency')).toBeVisible()
    expect(read?.().spell).toEqual({})
  })

  it('shows a stored recharge instead of At will and replaces it only when chosen', async () => {
    const user = userEvent.setup()
    let read: (() => Record<string, unknown>) | undefined
    const recharge = { kind: 'recharge', minRoll: 5 }
    render(
      <Host
        values={{ spell: { limitedUse: recharge } }}
        onReady={(getValues) => (read = getValues)}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Frequency' })).not.toHaveTextContent('At will')
    expect(read?.().spell).toEqual({ limitedUse: recharge })
    await user.click(screen.getByRole('combobox', { name: 'Frequency' }))
    await user.click(screen.getByRole('option', { name: 'At will' }))
    expect(read?.().spell).toEqual({ limitedUse: undefined })
  })

  it('disables the menu and shows the shared pool when the spell has no limit', () => {
    render(
      <Host
        values={{
          spell: {},
          limitedUse: {
            kind: 'uses',
            count: { kind: 'fixed', value: 3 },
            recovery: { minimumRest: 'long' },
          },
        }}
      />,
    )
    const frequency = screen.getByRole('combobox', { name: 'Frequency' })
    expect(frequency).toBeDisabled()
    expect(frequency).toHaveTextContent('3/Day shared')
  })

  it('renders a field error through the select', () => {
    function Errored() {
      const form = useForm<{ spell: { limitedUse?: unknown } }>({ defaultValues: { spell: {} } })
      useEffect(() => {
        form.setError('spell.limitedUse', { type: 'custom', message: 'Choose a frequency' })
      }, [form])
      return (
        <FormProvider {...form}>
          <MonsterSpellFrequencyField
            spellLimitName="spell.limitedUse"
            actionLimitName="limitedUse"
          />
        </FormProvider>
      )
    }
    render(<Errored />)
    expect(screen.getByText('Choose a frequency')).toBeInTheDocument()
  })
})
