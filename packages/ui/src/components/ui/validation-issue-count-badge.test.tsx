import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ValidationIssueCountBadge } from './validation-issue-count-badge.client'

describe('ValidationIssueCountBadge', () => {
  it('renders nothing when count is zero', () => {
    const { container } = render(<ValidationIssueCountBadge count={0} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a warning icon before the count', () => {
    render(<ValidationIssueCountBadge count={3} />)

    expect(screen.getByText('3')).toBeInTheDocument()
    const icon = document.querySelector('[data-icon="triangle-alert"]')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('ui-icon--owner')
    expect(icon).not.toHaveClass('ui-icon--2xl', 'ui-icon--inline')
  })
})
