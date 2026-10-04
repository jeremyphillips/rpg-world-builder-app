import { createStorybookMainConfig } from '@rpg/config/storybook/main-base'

export default createStorybookMainConfig({
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  viteFinal: async (viteConfig) => {
    viteConfig.optimizeDeps ??= {}
    // Workspace TS sources — prebundling drops some named const re-exports (e.g. INLINE_METADATA_SEPARATOR).
    viteConfig.optimizeDeps.exclude = [
      ...(viteConfig.optimizeDeps.exclude ?? []),
      '@rpg/contracts',
      '@rpg/contracts/primitives',
    ]
    return viteConfig
  },
})
