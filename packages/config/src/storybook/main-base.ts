import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

type ViteConfigWithCss = {
  css?: {
    devSourcemap?: boolean
  }
}

/** Tailwind emits CSS source maps only when Vite's `css.devSourcemap` is true. */
function enableCssDevSourcemap<T extends ViteConfigWithCss>(viteConfig: T): T {
  viteConfig.css = { ...viteConfig.css, devSourcemap: true }
  return viteConfig
}

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
      enableCssDevSourcemap(viteConfig)

      if (!options.viteFinal) {
        return viteConfig
      }

      return enableCssDevSourcemap(await options.viteFinal(viteConfig, viteOptions))
    },
  }
}
