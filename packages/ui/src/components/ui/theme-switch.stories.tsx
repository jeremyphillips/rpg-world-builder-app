import type { Meta, StoryObj } from '@storybook/react-vite'

import { ThemeSwitch } from './theme-switch.client'

const meta = {
  title: 'Primitives/ThemeSwitch',
  component: ThemeSwitch,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ThemeSwitch>

export default meta
type Story = StoryObj<typeof meta>

/** Default light mode state. */
export const Light: Story = {
  globals: { theme: 'light' },
}

/**
 * Dark mode state. The global applies `.dark` to `document.documentElement` via the
 * preview decorator, so the component and its token-based colours render correctly.
 */
export const Dark: Story = {
  globals: { theme: 'dark' },
}
