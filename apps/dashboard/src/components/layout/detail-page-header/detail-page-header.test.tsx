import { render, screen } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PageChromeActionsContext } from '@/components/layout/page-chrome/page-chrome-actions-context'
import { pageChromeOutlineActionClasses } from '@/components/layout/page-chrome/page-chrome-action.variants'

import { DetailPageHeader } from './detail-page-header'

vi.mock('@/components/layout/breadcrumb/use-resolved-breadcrumbs', () => ({
  useResolvedBreadcrumbs: () => [],
}))

function renderHeaderWithActions() {
  const editAction = (
    <Link to="/edit" className={pageChromeOutlineActionClasses}>
      Edit
    </Link>
  )

  return render(
    <MemoryRouter>
      <PageChromeActionsContext.Provider value={{ actions: editAction, setActions: vi.fn() }}>
        <DetailPageHeader />
      </PageChromeActionsContext.Provider>
    </MemoryRouter>,
  )
}

describe('DetailPageHeader', () => {
  it('uses a fixed 32px row height', () => {
    renderHeaderWithActions()

    expect(document.querySelector('[data-detail-page-header]')).toHaveClass('h-8')
  })

  it('renders registered toolbar actions with compact page chrome styling', () => {
    renderHeaderWithActions()

    const edit = screen.getByRole('link', { name: 'Edit' })
    expect(edit).toHaveClass('h-control-action-compact')
    expect(screen.getByRole('toolbar', { name: 'Page actions' })).toContainElement(edit)
  })
})
