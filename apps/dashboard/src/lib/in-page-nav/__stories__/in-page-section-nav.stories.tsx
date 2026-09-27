import type { Meta, StoryObj } from '@storybook/react-vite'

import { InPageSectionNav } from '../in-page-section-nav'

const sections = [
  {
    id: 'description-heading',
    label: 'Description',
  },
  {
    id: 'features-heading',
    label: 'Features',
    leaves: [
      { id: 'feature-level-1', label: 'Level 1' },
      { id: 'feature-level-2', label: 'Level 2' },
    ],
  },
] as const

const meta = {
  title: 'Layout/InPageSectionNav',
  component: InPageSectionNav,
  parameters: { layout: 'padded' },
  args: {
    sections,
    eyebrowLabel: 'On this page',
    navLabel: 'On this page sections',
    mobileSelectLabel: 'Section',
    activeSectionId: 'features-heading',
    activeLeafId: 'feature-level-1',
  },
} satisfies Meta<typeof InPageSectionNav>

export default meta
type Story = StoryObj<typeof meta>

export const DesktopRail: Story = {
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
}

export const MobileSelect: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    activeSectionId: undefined,
    activeLeafId: undefined,
  },
}
