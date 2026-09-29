import type { Meta, StoryObj } from '@storybook/react-vite'

import { EntityRowList } from '@/features/content'

import { CHARACTER_CONTROLLER_DISPLAY } from '../lib/display/character-display-labels'
import { CharacterListRow } from './character-list-row'

const meta = {
  title: 'Character/CharacterListRow',
  component: CharacterListRow,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CharacterListRow>

export default meta
type Story = StoryObj<typeof CharacterListRow>

export const InEntityRowList: Story = {
  render: () => (
    <EntityRowList.Root itemCount={1}>
      <EntityRowList.Group itemCount={1}>
        <CharacterListRow
          card={{
            id: 'char_1',
            name: 'Verna',
            summary: 'Dwarf · Level 1 Fighter',
          }}
          detailHref="/campaigns/camp_1/characters/char_1"
          controllerLine={CHARACTER_CONTROLLER_DISPLAY.playedBy('Player One')}
          rosterStatus="active"
        />
      </EntityRowList.Group>
    </EntityRowList.Root>
  ),
}
