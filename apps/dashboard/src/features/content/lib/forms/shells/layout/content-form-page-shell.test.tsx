import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ContentFormPageShell } from './content-form-page-shell'

vi.mock('@/components/layout/breadcrumb/use-resolved-breadcrumbs', () => ({
  useResolvedBreadcrumbs: () => [{ label: 'Classes', href: '/classes' }],
}))

function renderShell(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ContentFormPageShell', () => {
  it('uses NarrowPage when preview layout is disabled', () => {
    const { container } = renderShell(
      <ContentFormPageShell usePreviewLayout={false}>
        <p>Form body</p>
      </ContentFormPageShell>,
    )

    expect(container.firstChild).toHaveClass(
      'mx-auto',
      'max-w-4xl',
      'flex',
      'flex-1',
      'overflow-hidden',
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('uses WidePage when preview layout is enabled', () => {
    const { container } = renderShell(
      <ContentFormPageShell usePreviewLayout>
        <p>Form body</p>
      </ContentFormPageShell>,
    )

    expect(container.firstChild).toHaveClass('w-full', 'flex', 'flex-1', 'overflow-hidden')
    expect(container.firstChild).not.toHaveClass('max-w-4xl')
  })
})
