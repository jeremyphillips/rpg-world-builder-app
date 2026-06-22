import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import { FormActionsBar } from './form-actions-bar'

describe('FormActionsBar', () => {
  it('renders children in a form actions toolbar', () => {
    render(
      <FormActionsBar>
        <button type="submit">Save</button>
      </FormActionsBar>,
    )
    expect(screen.getByRole('toolbar', { name: 'Form actions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders a form-level error above the actions row', () => {
    render(
      <FormActionsBar formError="Something went wrong.">
        <button type="submit">Save</button>
      </FormActionsBar>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('returns null when there is no error or children', () => {
    const { container } = render(<FormActionsBar />)
    expect(container).toBeEmptyDOMElement()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <FormActionsBar formError="Could not save.">
        <button type="submit">Save</button>
      </FormActionsBar>,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
