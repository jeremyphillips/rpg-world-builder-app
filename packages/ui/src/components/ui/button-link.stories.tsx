import type { Meta, StoryObj } from '@storybook/react-vite'

import { ButtonLink } from './button-link'

const meta = {
  title: 'Primitives/ButtonLink',
  component: ButtonLink,
  parameters: {
    docs: {
      description: {
        component:
          'Button-shaped navigation. Pass a single app-owned link element (`<a>`, React Router `Link`, or Next.js `Link`) via `link`; label content goes in `children`. Visual props match `Button`.',
      },
    },
  },
  args: {
    children: 'Continue',
    variant: 'default',
    size: 'default',
  },
} satisfies Meta<typeof ButtonLink>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    link: <a href="#continue" />,
  },
}

export const OutlineSmall: Story = {
  args: {
    link: <a href="#continue" />,
    variant: 'outline',
    size: 'sm',
  },
}

export const Ghost: Story = {
  args: {
    link: <a href="#back" />,
    variant: 'ghost',
    children: 'Back',
  },
}
