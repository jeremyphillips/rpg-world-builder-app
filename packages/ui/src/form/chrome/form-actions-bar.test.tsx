import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

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

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <FormActionsBar formError="Could not save.">
        <button type="submit">Save</button>
      </FormActionsBar>,
    )
    await expectNoAxeViolations(container)
  })

  it('applies sheet variant horizontal inset', () => {
    render(
      <FormActionsBar variant="sheet">
        <button type="button">Save</button>
      </FormActionsBar>,
    )

    const toolbar = screen.getByRole('toolbar', { name: 'Form actions' })
    expect(toolbar).toHaveClass('px-6')
    expect(toolbar).toHaveClass('shrink-0')
    expect(toolbar).not.toHaveClass('sticky')
  })
})
