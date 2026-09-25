import type { Meta, StoryObj } from '@storybook/react-vite'

import { BuilderOptionCardImage } from './builder-option-card-image'

const meta = {
  title: 'Dashboard/Character Builder/BuilderOptionCardImage',
  component: BuilderOptionCardImage,
} satisfies Meta<typeof BuilderOptionCardImage>

export default meta

type Story = StoryObj<typeof meta>

export const SystemArt: Story = {
  args: {
    display: {
      src: '/app/assets/system/srd-cc-5.2.1/species/primary/elf.jpeg',
      sourceKind: 'system',
    },
    alt: 'Elf',
  },
}
