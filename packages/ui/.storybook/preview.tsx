import type { Decorator, Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'

import '../src/styles/globals.css'
import { ThemeContext, type ThemeContextValue } from '../src/providers/theme-provider.client'

type Theme = 'light' | 'dark'

/**
 * Provides ThemeContext seeded from the Storybook `theme` global so that
 * components calling `useTheme()` receive a value that matches the toolbar
 * selection — without the localStorage/DOM side-effects of the real ThemeProvider.
 */
const withThemeContext: Decorator = (Story, context) => {
  const theme = (context.globals['theme'] as Theme | undefined) ?? 'light'
  const value: ThemeContextValue = { theme, toggleTheme: () => {} }
  return (
    <ThemeContext.Provider value={value}>
      <Story />
    </ThemeContext.Provider>
  )
}

const preview: Preview = {
  decorators: [
    // Applies/removes `.dark` on document.documentElement for visual token switching.
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
    // Provides ThemeContext so useTheme() works in stories.
    withThemeContext,
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Surface a11y findings as failures so CI/Storybook test runs catch them.
      test: 'error',
    },
  },
  tags: ['autodocs'],
}

export default preview
