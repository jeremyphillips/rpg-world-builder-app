import { render, screen } from '@testing-library/react'
import { resolveContentDisplayFallback } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { projectSearchHitToInteractiveListPresentation } from './search-hit-interactive-list.lib'

const fallback = resolveContentDisplayFallback({
  domain: 'equipment',
  surface: 'compact',
})

describe('projectSearchHitToInteractiveListPresentation status', () => {
  it('renders a badge status at compact density without an ancestor provider', () => {
    const presentation = projectSearchHitToInteractiveListPresentation({
      heading: 'Dagger',
      fallback,
      status: [{ kind: 'badge', label: 'Unavailable', tone: 'warning' }],
    })

    render(<>{presentation.status}</>)

    expect(screen.getByText('Unavailable')).toHaveClass('ui-badge--sm')
  })

  it('renders inactive status without badge chrome', () => {
    const presentation = projectSearchHitToInteractiveListPresentation({
      heading: 'Dagger',
      fallback,
      status: [{ kind: 'inactive', label: 'Inactive' }],
    })

    render(<>{presentation.status}</>)

    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getByText('Inactive').closest('.ui-badge')).toBeNull()
  })
})
