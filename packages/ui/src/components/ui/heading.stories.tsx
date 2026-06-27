import type { Meta, StoryObj } from '@storybook/react-vite'

import { Heading } from './heading'

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  args: {
    children: 'Heading',
  },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

/** Page titles — dashboard routes, overview shells. */
export const Page: Story = {
  args: {
    variant: 'page',
    as: 'h2',
    children: 'Account Settings',
  },
}

/** Content detail titles — species, class, weapon names. */
export const Display: Story = {
  args: {
    variant: 'display',
    as: 'h2',
    children: 'Elf',
  },
}

/** Section headings within a detail page. */
export const Section: Story = {
  args: {
    variant: 'section',
    as: 'h3',
    children: 'Traits',
  },
}

/** Inline labels — trait names, feature titles. */
export const Label: Story = {
  args: {
    variant: 'label',
    as: 'p',
    children: 'Darkvision',
  },
}

export const Hierarchy: Story = {
  render: () => (
    <div className="space-y-4">
      <Heading variant="page" as="h1">
        Elf
      </Heading>
      <Heading variant="section" as="h2">
        Traits
      </Heading>
      <Heading variant="label" as="p">
        Darkvision
      </Heading>
    </div>
  ),
}
