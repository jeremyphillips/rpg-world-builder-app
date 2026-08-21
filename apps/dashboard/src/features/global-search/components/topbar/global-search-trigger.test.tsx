import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { GlobalSearchTrigger } from './global-search-trigger'
import { GLOBAL_SEARCH_COPY } from '../../lib/global-search-copy'

describe('GlobalSearchTrigger', () => {
  it('opens search when clicked', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()

    renderWithProviders(<GlobalSearchTrigger onOpen={onOpen} />)

    await user.click(screen.getByRole('button', { name: GLOBAL_SEARCH_COPY.triggerLabel }))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<GlobalSearchTrigger onOpen={() => undefined} />)

    await expectNoAxeViolations(container)
  })
})
