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

/** Route titles — dashboard routes, overview shells. */
export const Page: Story = {
  args: {
    variant: 'page',
    as: 'h1',
    children: 'Account Settings',
  },
}

/** Content detail titles — species, class, weapon names. */
export const Display: Story = {
  args: {
    variant: 'display',
    as: 'h1',
    children: 'Elf',
  },
}

/** Top-level section headings within a detail page. */
export const Section: Story = {
  args: {
    variant: 'section',
    as: 'h2',
    children: 'Traits',
  },
}

/** Nested subsection headings. */
export const Subsection: Story = {
  args: {
    variant: 'subsection',
    as: 'h3',
    children: 'Wood Elf Heritage',
  },
}

/** Group headings inside subsections. */
export const Group: Story = {
  args: {
    variant: 'group',
    as: 'h4',
    children: 'Level 1 Features',
  },
}

/** Card titles (non-overlay chrome). */
export const Card: Story = {
  args: {
    variant: 'card',
    as: 'h2',
    children: 'Edit species',
  },
}

/** Modal/Sheet titles — 19px mobile, 24px from md. */
export const DialogTitle: Story = {
  args: {
    variant: 'dialogTitle',
    as: 'h2',
    children: 'Create settlement',
  },
}

/** ConfirmDialog titles — 19px at all sizes. */
export const ConfirmDialogTitle: Story = {
  args: {
    variant: 'confirmDialogTitle',
    as: 'h2',
    children: 'Delete campaign?',
  },
}

/** Inline Alert titles. */
export const Alert: Story = {
  args: {
    variant: 'alert',
    as: 'h2',
    children: 'Something went wrong',
  },
}

/** Topbar navigation title. */
export const Nav: Story = {
  args: {
    variant: 'nav',
    as: 'span',
    children: 'Campaign settings',
  },
}

/** Sidebar product name. */
export const Brand: Story = {
  args: {
    variant: 'brand',
    as: 'span',
    children: 'World Builder',
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
      <Heading variant="display" as="h1">
        Elf
      </Heading>
      <Heading variant="page" as="h1">
        Species catalog
      </Heading>
      <Heading variant="section" as="h2">
        Traits
      </Heading>
      <Heading variant="subsection" as="h3">
        Wood Elf Heritage
      </Heading>
      <Heading variant="group" as="h4">
        Level 1 Features
      </Heading>
      <Heading variant="label" as="p">
        Darkvision
      </Heading>
    </div>
  ),
}
