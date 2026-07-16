import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  adaptDndBeyondCharacter,
  dndBeyondCharacter133058471Payload,
} from '@rpg/contracts/character-import'

import { createCharacterImportAdaptOptions } from '../model/character-import-adapt-options'
import { CharacterImportPreview } from './character-import-preview.client'

const fixtureResult = adaptDndBeyondCharacter(
  dndBeyondCharacter133058471Payload,
  {
    provider: 'dnd-beyond',
    payloadVersion: 'character-v5',
    requestedPayloadVersion: 'character-v5',
    supportedPayloadVersion: 'character-v5',
    characterId: '133058471',
    acquisition: 'public-id-fetch',
  },
  createCharacterImportAdaptOptions(),
)

const meta = {
  title: 'Dashboard/Character Import/Preview',
  component: CharacterImportPreview,
} satisfies Meta<typeof CharacterImportPreview>

export default meta

type Story = StoryObj<typeof meta>

export const FixtureCharacter: Story = {
  args: {
    result: fixtureResult,
  },
}
