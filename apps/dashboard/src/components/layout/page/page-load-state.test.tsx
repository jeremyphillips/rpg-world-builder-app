import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Text } from '@rpg/ui'

import { PageLoadState } from './page-load-state'

describe('PageLoadState', () => {
  it('renders a loading spinner', () => {
    render(
      <PageLoadState isPending isError={false}>
        <Text>Ready content</Text>
      </PageLoadState>,
    )
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByText('Ready content')).not.toBeInTheDocument()
  })

  it('renders an error alert', () => {
    render(
      <PageLoadState isPending={false} isError errorLabel="Something went wrong.">
        <Text>Ready content</Text>
      </PageLoadState>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('retries from the error state', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(
      <PageLoadState isPending={false} isError errorLabel="Something went wrong." onRetry={onRetry}>
        <Text>Ready content</Text>
      </PageLoadState>,
    )

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
    expect(screen.queryByText('Ready content')).not.toBeInTheDocument()
  })

  it('renders children when ready', () => {
    render(
      <PageLoadState isPending={false} isError={false}>
        <Text>Ready content</Text>
      </PageLoadState>,
    )
    expect(screen.getByText('Ready content')).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <PageLoadState isPending={false} isError={false}>
        <Text>Ready content</Text>
      </PageLoadState>,
    )
    await expectNoAxeViolations(container)
  })
})
