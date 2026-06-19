import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

export type CreateStorybookMainConfigOptions = {
  stories: NonNullable<StorybookConfig['stories']>
  viteFinal?: StorybookConfig['viteFinal']
}

/**
 * Shared Storybook main config: React/Vite framework, a11y + themes addons,
 * Tailwind via Vite. Callers pass a stories glob and an optional `viteFinal`
 * hook that runs after Tailwind is registered (merge `resolve.alias`, etc.).
 */
export function createStorybookMainConfig(
  options: CreateStorybookMainConfigOptions,
): StorybookConfig {
  return {
    stories: options.stories,
    addons: ['@storybook/addon-a11y', '@storybook/addon-themes'],
    framework: {
      name: '@storybook/react-vite',
      options: {},
    },
    viteFinal: async (viteConfig, viteOptions) => {
      viteConfig.plugins ??= []
      viteConfig.plugins.push(tailwindcss())

      if (options.viteFinal) {
        return options.viteFinal(viteConfig, viteOptions)
      }

      return viteConfig
    },
  }
}
