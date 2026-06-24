import { createStorybookMainConfig } from '@rpg/config/storybook/main-base'

export default createStorybookMainConfig({
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  viteFinal: async (viteConfig) => {
    viteConfig.optimizeDeps ??= {}
    viteConfig.optimizeDeps.include = [
      ...(viteConfig.optimizeDeps.include ?? []),
      '@rpg/contracts/primitives',
    ]
    return viteConfig
  },
})
