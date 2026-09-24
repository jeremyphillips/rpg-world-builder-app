import type { Meta, StoryObj } from '@storybook/react-vite'

import { FilenamePreview } from './filename-preview.client'

const meta = {
  title: 'Components/FilenamePreview',
  component: FilenamePreview,
  args: { filename: 'seraphina-final-character-portrait.webp' },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilenamePreview>
export default meta
type Story = StoryObj<typeof meta>

export const Comfortable: Story = {}
export const Compact: Story = { args: { density: 'compact' } }
export const Full: Story = { args: { full: true } }
