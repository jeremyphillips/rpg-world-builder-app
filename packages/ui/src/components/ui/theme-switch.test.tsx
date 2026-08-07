import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ThemeContext, type ThemeContextValue } from '../../providers/theme-provider.client'
import { ThemeSwitch } from './theme-switch.client'

function renderWithTheme(value: ThemeContextValue) {
  return render(
    <ThemeContext.Provider value={value}>
      <ThemeSwitch />
    </ThemeContext.Provider>,
  )
}

const lightCtx: ThemeContextValue = { theme: 'light', toggleTheme: vi.fn() }
const darkCtx: ThemeContextValue = { theme: 'dark', toggleTheme: vi.fn() }

afterEach(() => {
  document.documentElement.classList.remove('dark')
  vi.restoreAllMocks()
})

describe('ThemeSwitch', () => {
  it('shows "Enable dark mode" label in light mode', () => {
    renderWithTheme(lightCtx)
    expect(screen.getByRole('switch', { name: 'Enable dark mode' })).toBeInTheDocument()
  })

  it('shows "Disable dark mode" label in dark mode', () => {
    renderWithTheme(darkCtx)
    expect(screen.getByRole('switch', { name: 'Disable dark mode' })).toBeInTheDocument()
  })

  it('calls toggleTheme when the switch is clicked', async () => {
    const toggleTheme = vi.fn()
    renderWithTheme({ theme: 'light', toggleTheme })
    await userEvent.click(screen.getByRole('switch'))
    expect(toggleTheme).toHaveBeenCalledOnce()
  })

  itAxe('has no axe violations in light mode', async () => {
    const { container } = renderWithTheme(lightCtx)
    await expectNoAxeViolations(container)
  })

  itAxe('has no axe violations in dark mode', async () => {
    document.documentElement.classList.add('dark')
    const { container } = renderWithTheme(darkCtx)
    await expectNoAxeViolations(container)
  })
})
