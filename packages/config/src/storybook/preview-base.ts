import type { Decorator, Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'

export type CreateStorybookPreviewOptions = {
  decorators?: Decorator[]
  parameters?: Preview['parameters']
}

/**
 * Shared Storybook preview: light/dark class on `document.documentElement`,
 * a11y addon set to `error`, autodocs tag. Pass extra decorators/parameters
 * from app packages (e.g. `@rpg/ui/storybook/with-theme-context`).
 */
export function createStorybookPreview(options: CreateStorybookPreviewOptions = {}): Preview {
  const { decorators = [], parameters: extraParameters } = options

  return {
    decorators: [
      withThemeByClassName({
        themes: { light: '', dark: 'dark' },
        defaultTheme: 'light',
      }),
      ...decorators,
    ],
    parameters: {
      controls: {
        matchers: {
          color: /(background|color)$/i,
          date: /Date$/i,
        },
      },
      a11y: {
        test: 'error',
      },
      ...extraParameters,
    },
    tags: ['autodocs'],
  }
}
