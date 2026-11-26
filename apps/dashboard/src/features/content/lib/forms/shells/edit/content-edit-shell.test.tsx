import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ContentEditShell } from './content-edit-shell'

vi.mock('../layout/content-form-shell-layout', () => ({
  ContentFormOptionsGate: ({
    children,
  }: {
    children: (ctx: { options?: Record<string, never> }) => React.ReactNode
  }) => children({ options: {} }),
  ContentFormLayout: () => null,
}))

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))

vi.mock('../../../list/use-content-mutations', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../list/use-content-mutations')>()
  return {
    ...actual,
    useContentWriteMutation: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  }
})

describe('ContentEditShell overlay failure gate', () => {
  it('shows destructive alert and blocks the form when list overlayFailures match entityId', () => {
    const failure = {
      targetId: 'feat-broken',
      slug: 'broken-feat',
      name: 'Broken Feat',
      code: 'unsupported_overlay_version' as const,
      message: 'System overlay patch is missing a supported version.',
    }

    const def = {
      routeKey: 'feats' as const,
      useListQueryResult: () => ({
        isPending: false,
        isError: false,
        data: { items: [], overlayFailures: [failure] },
      }),
      queryKey: () => ['feats'],
    }

    render(
      <ContentEditShell
        def={def as never}
        campaignId="campaign-1"
        entityId="feat-broken"
        isPending={false}
        isError={false}
        backHref="/feats"
        overviewHref="/feats"
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(failure.message)
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Item not found.')).not.toBeInTheDocument()
  })
})
