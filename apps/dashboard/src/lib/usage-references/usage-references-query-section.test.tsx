import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { UsageReferencesQuerySection } from './usage-references-query-section.client'

vi.mock('./usage-references-section.client', () => ({
  UsageReferencesSection: () => <div>Ready usage section</div>,
}))

describe('UsageReferencesQuerySection', () => {
  it('shows a pending state while loading', () => {
    render(
      <UsageReferencesQuerySection campaignId="camp_1" isPending isError={false} references={[]} />,
    )

    expect(screen.getByText('Loading usage references…')).toBeInTheDocument()
  })

  it('shows an error state with retry', async () => {
    const onRetry = vi.fn()
    render(
      <UsageReferencesQuerySection
        campaignId="camp_1"
        isPending={false}
        isError
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load usage references.')
    await screen.getByRole('button', { name: 'Retry' }).click()
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('shows an empty state when loaded with no references', () => {
    render(
      <UsageReferencesQuerySection
        campaignId="camp_1"
        isPending={false}
        isError={false}
        references={[]}
      />,
    )

    expect(screen.getByText('Nothing references this yet.')).toBeInTheDocument()
  })

  it('renders the ready section when references exist', () => {
    render(
      <UsageReferencesQuerySection
        campaignId="camp_1"
        isPending={false}
        isError={false}
        references={[
          {
            kind: 'character',
            id: 'char_1',
            label: 'Aria',
            characterType: 'pc',
          },
        ]}
      />,
    )

    expect(screen.getByText('Ready usage section')).toBeInTheDocument()
  })
})
