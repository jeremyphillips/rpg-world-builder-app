import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it } from 'vitest'
import { FormProvider, useForm } from 'react-hook-form'

import { MonsterSpellComponentRequirementsField } from './monster-spell-component-requirements-field'

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

function Harness({ defaultValues }: { defaultValues?: { omittedComponents?: string[] } }) {
  const methods = useForm({
    defaultValues: defaultValues ?? {},
  })
  return (
    <FormProvider {...methods}>
      <MonsterSpellComponentRequirementsField name="omittedComponents" />
      <output data-testid="value">{JSON.stringify(methods.watch('omittedComponents'))}</output>
      <output data-testid="dirty">{String(methods.formState.isDirty)}</output>
    </FormProvider>
  )
}

describe('MonsterSpellComponentRequirementsField', () => {
  it('starts collapsed with no persisted omissions and stays clean on mount', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: /omit spell components/i })).toBeInTheDocument()
    expect(screen.getByTestId('value').textContent).toBe('')
    expect(screen.getByTestId('dirty').textContent).toBe('false')
  })

  it('opens populated, lays out inline checkboxes, and preserves uncommon combinations', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Harness defaultValues={{ omittedComponents: ['somatic', 'verbal'] }} />,
    )

    expect(screen.getByText('Omit components')).toBeInTheDocument()
    expect(screen.getByText(/select components that aren't required/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Verbal' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Somatic' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Material' })).not.toBeChecked()

    const row = container.querySelector('[role="group"]')
    expect(row).toHaveClass('flex-wrap')

    await user.click(screen.getByRole('checkbox', { name: 'Material' }))
    expect(screen.getByTestId('value').textContent).toBe('["verbal","somatic","material"]')
  })

  it('toggles selections independently and clears empty state', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: /omit spell components/i }))
    await user.click(screen.getByRole('checkbox', { name: 'Material' }))
    expect(screen.getByTestId('value').textContent).toBe('["material"]')

    await user.click(screen.getByRole('checkbox', { name: 'Material' }))
    expect(screen.getByTestId('value').textContent).toBe('')
  })

  it('clears omissions when removing the disclosure', async () => {
    const user = userEvent.setup()
    render(<Harness defaultValues={{ omittedComponents: ['material'] }} />)

    await user.click(screen.getByRole('button', { name: /remove omit components/i }))
    await waitFor(() => expect(screen.getByTestId('value').textContent).toBe(''))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /omit spell components/i })).toBeInTheDocument(),
    )
    expect(screen.queryByRole('checkbox', { name: 'Material' })).not.toBeInTheDocument()
  })
})
