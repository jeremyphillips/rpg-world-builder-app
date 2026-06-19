import type { Decorator } from '@storybook/react-vite'

import { ThemeContext, type ThemeContextValue } from '../providers/theme-provider.client'

type Theme = 'light' | 'dark'

/**
 * Provides ThemeContext seeded from the Storybook `theme` global so that
 * components calling `useTheme()` receive a value that matches the toolbar
 * selection — without the localStorage/DOM side-effects of the real ThemeProvider.
 */
export const withThemeContext: Decorator = (Story, context) => {
  const theme = (context.globals['theme'] as Theme | undefined) ?? 'light'
  const value: ThemeContextValue = { theme, toggleTheme: () => {} }
  return (
    <ThemeContext.Provider value={value}>
      <Story />
    </ThemeContext.Provider>
  )
}
