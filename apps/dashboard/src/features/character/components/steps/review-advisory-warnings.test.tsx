import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { ReviewAdvisoryWarnings } from './review-advisory-warnings.client'

describe('ReviewAdvisoryWarnings', () => {
  it('renders nothing when there are no warnings', () => {
    const { container } = render(<ReviewAdvisoryWarnings warnings={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists advisory warnings', () => {
    render(<ReviewAdvisoryWarnings warnings={['Name is not set.', 'Class is not selected.']} />)

    expect(screen.getByText('Advisory notes')).toBeInTheDocument()
    expect(screen.getByText('Name is not set.')).toBeInTheDocument()
    expect(screen.getByText('Class is not selected.')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ReviewAdvisoryWarnings warnings={['Name is not set.', 'Class is not selected.']} />,
    )

    await expectNoAxeViolations(container)
  })
})
