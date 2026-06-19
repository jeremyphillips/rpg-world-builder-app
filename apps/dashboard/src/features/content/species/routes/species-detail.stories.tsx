import type { Meta, StoryObj } from '@storybook/react-vite'

import { ELF, ORC } from '../fixtures'
import { SpeciesDetailContent } from './species-detail'

const meta = {
  title: 'Content/Species/SpeciesDetail',
  component: SpeciesDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SpeciesDetailContent>

export default meta
type Story = StoryObj

export const NoChoiceGroups: Story = {
  render: () => <SpeciesDetailContent species={ORC} />,
}

export const WithLineageChoiceGroup: Story = {
  render: () => <SpeciesDetailContent species={ELF} />,
}
