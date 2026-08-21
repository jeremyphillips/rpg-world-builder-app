import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { GlobalSearchField } from './global-search-field'
import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'

describe('GlobalSearchField', () => {
  it('updates value and submits on Enter', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const onSubmit = vi.fn()

    renderWithProviders(
      <GlobalSearchField
        id="global-search-field-test"
        value=""
        onValueChange={onValueChange}
        onSubmit={onSubmit}
      />,
    )

    const field = screen.getByRole('searchbox', { name: GLOBAL_SEARCH_COPY.searchFieldLabel })
    await user.type(field, 'fire{Enter}')

    expect(onValueChange).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('requests close on Escape', async () => {
    const user = userEvent.setup()
    const onRequestClose = vi.fn()

    renderWithProviders(
      <GlobalSearchField
        id="global-search-field-escape"
        value="fire"
        onValueChange={() => undefined}
        onRequestClose={onRequestClose}
      />,
    )

    await user.type(
      screen.getByRole('searchbox', { name: GLOBAL_SEARCH_COPY.searchFieldLabel }),
      '{Escape}',
    )

    expect(onRequestClose).toHaveBeenCalledOnce()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(
      <GlobalSearchField id="global-search-field-a11y" value="" onValueChange={() => undefined} />,
    )

    await expectNoAxeViolations(container)
  })
})
