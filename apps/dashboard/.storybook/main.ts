import { createStorybookMainConfig } from '@rpg/config/storybook/main-base'

export default createStorybookMainConfig({
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  viteFinal: async (viteConfig) => {
    viteConfig.resolve ??= {}
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      '@': new URL('../src', import.meta.url).pathname,
    }
    return viteConfig
  },
})
