import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { FieldReadOnlyValue, FieldReadOnlyValueField } from './field-read-only-value.client'

describe('FieldReadOnlyValue', () => {
  it('renders the display value with an accessible name', () => {
    render(<FieldReadOnlyValue id="amount" displayValue="Full effect" ariaLabel="Amount" />)
    expect(screen.getByLabelText('Amount')).toHaveTextContent('Full effect')
  })

  it('associates an external label via aria-labelledby', () => {
    render(
      <>
        <span id="row-title">Damage</span>
        <FieldReadOnlyValue id="amount" displayValue="Full effect" ariaLabelledBy="row-title" />
      </>,
    )
    expect(screen.getByText('Full effect')).toHaveAttribute('aria-labelledby', 'row-title')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <FieldReadOnlyValueField id="amount" label="Amount" displayValue="Full effect" />,
    )
    await expectNoAxeViolations(container)
  })
})

describe('FieldReadOnlyValueField', () => {
  it('renders label and value with field rhythm', () => {
    render(
      <FieldReadOnlyValueField
        id="amount"
        label="Amount"
        displayValue="Full effect"
        hint="Fixed."
      />,
    )
    expect(screen.getByText('Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toHaveTextContent('Full effect')
    expect(screen.getByText('Fixed.')).toBeInTheDocument()
  })

  it('omits the label row when label is blank', () => {
    render(<FieldReadOnlyValueField id="amount" label="" displayValue="Full effect" />)
    expect(screen.queryByText('Amount')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Full effect')).toHaveTextContent('Full effect')
  })
})
