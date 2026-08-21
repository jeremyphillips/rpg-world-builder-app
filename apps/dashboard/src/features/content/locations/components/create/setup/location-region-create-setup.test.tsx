import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { LocationRegionCreateSetup } from './location-region-create-setup'

describe('LocationRegionCreateSetup', () => {
  it('uses Create region heading and clears type when classification changes', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()

    render(
      <LocationRegionCreateSetup
        open
        intent={{ authoringType: 'region' }}
        onOpenChange={vi.fn()}
        onComplete={onComplete}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Create region' })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Change classification' }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Geographic') }))

    expect(screen.getByRole('radiogroup', { name: 'Region type' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
    expect(
      screen.queryByRole('radio', { name: (name) => name.startsWith('Kingdom'), checked: true }),
    ).not.toBeInTheDocument()
  })

  it('uses Create subregion heading under a region parent', () => {
    render(
      <LocationRegionCreateSetup
        open
        intent={{
          authoringType: 'region',
          parentLocationId: 'location-greyshore',
          parentKind: 'region',
        }}
        onOpenChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Create subregion' })).toBeInTheDocument()
    expect(
      screen.getByRole('radiogroup', { name: 'What kind of subregion are you creating?' }),
    ).toBeInTheDocument()
  })

  it('dismisses reopen without clearing downstream when the same classification is re-selected', async () => {
    const user = userEvent.setup()

    render(
      <LocationRegionCreateSetup
        open
        intent={{ authoringType: 'region' }}
        onOpenChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))
    await user.click(screen.getByRole('button', { name: 'Change classification' }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    expect(screen.queryByRole('radiogroup', { name: 'Region type' })).not.toBeInTheDocument()
    expect(screen.getByText('Kingdom')).toBeInTheDocument()
  })

  it('completes with classification after both steps', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    const onOpenChange = vi.fn()

    render(
      <LocationRegionCreateSetup
        open
        intent={{ authoringType: 'region' }}
        onOpenChange={onOpenChange}
        onComplete={onComplete}
      />,
    )

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Political') }))
    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Kingdom') }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({
        kind: 'region',
        classification: { kind: 'political', type: 'kingdom' },
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
