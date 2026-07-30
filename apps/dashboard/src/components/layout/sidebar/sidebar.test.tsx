/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Sidebar } from './sidebar'
import { sidebarAsideVariants, sidebarOverlayVariants } from './sidebar.variants'

vi.mock('./sidebar-nav', () => ({
  SidebarNav: () => <div data-testid="sidebar-nav" />,
}))

describe('Sidebar', () => {
  it('uses semantic overlay and width tokens', () => {
    const { rerender } = render(<Sidebar isOpen={false} onClose={() => undefined} />)

    const overlay = document.querySelector('[aria-hidden="true"]')
    expect(overlay).toHaveClass(sidebarOverlayVariants({ open: false }))
    expect(overlay?.className).toContain('bg-overlay')
    expect(document.querySelector('aside')).toHaveClass(sidebarAsideVariants({ open: false }))
    expect(document.querySelector('aside')?.className).toContain('w-sidebar')

    rerender(<Sidebar isOpen onClose={() => undefined} />)
    expect(document.querySelector('aside')).toHaveClass(sidebarAsideVariants({ open: true }))
  })
})
