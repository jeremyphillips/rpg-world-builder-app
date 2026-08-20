import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  createStandaloneBuilderCatalogIndexFixture,
  createPopulatedStandaloneBuilderContextFixture,
} from '../lib/fixtures/character-builder-fixtures'
import { CharacterBuilderShell } from './character-builder-shell.client'

const meta = {
  title: 'Character Builder/CharacterBuilderShell',
  component: CharacterBuilderShell,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CharacterBuilderShell>

export default meta
type Story = StoryObj<typeof CharacterBuilderShell>

export const Default: Story = {
  render: () => {
    const context = createPopulatedStandaloneBuilderContextFixture()
    const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

    return (
      <div className="mx-auto max-w-screen-2xl px-6 py-8">
        <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />
      </div>
    )
  },
}
