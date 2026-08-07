import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { EpicFilters } from './epic-filters'

describe('EpicFilters', () => {
  it('calls onChange when clearing filters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<EpicFilters filters={{ status: 'active', area: 'rules' }} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(onChange).toHaveBeenCalledWith({})
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<EpicFilters filters={{}} onChange={() => {}} />)
    await expectNoAxeViolations(container)
  })
})
