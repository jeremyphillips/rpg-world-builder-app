import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ReviewAdvisoryWarnings } from './review-advisory-warnings.client'

describe('ReviewAdvisoryWarnings', () => {
  it('renders nothing when there are no warnings', () => {
    const { container } = render(<ReviewAdvisoryWarnings warnings={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists advisory warnings', () => {
    render(
      <ReviewAdvisoryWarnings
        warnings={['Your Constitution is low for Barbarian.', 'You have no martial weapons.']}
      />,
    )

    expect(screen.getByText('Advisory notes')).toBeInTheDocument()
    expect(screen.getByText('Your Constitution is low for Barbarian.')).toBeInTheDocument()
    expect(screen.getByText('You have no martial weapons.')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <ReviewAdvisoryWarnings warnings={['Your Constitution is low for Barbarian.']} />,
    )

    await expectNoAxeViolations(container)
  })
})
