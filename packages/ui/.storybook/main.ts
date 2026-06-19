import { createStorybookMainConfig } from '@rpg/config/storybook/main-base'

export default createStorybookMainConfig({
  stories: ['../src/**/*.stories.@(ts|tsx)'],
})
