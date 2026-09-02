import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { getBuilderChromeCopy } from '../../../../lib/builder/builder-chrome-copy'
import { CharacterBuilderFooter } from '../character-builder-footer'

const pcChrome = getBuilderChromeCopy('standalone_pc')

const meta = {
  title: 'Character Builder/CharacterBuilderFooter',
  component: CharacterBuilderFooter,
  args: {
    createLabel: pcChrome.createLabel,
    creatingLabel: pcChrome.creatingLabel,
    reviewFooterHint: pcChrome.reviewFooterHint,
    onBack: fn(),
    onContinue: fn(),
    onCreateCharacter: fn(),
  },
} satisfies Meta<typeof CharacterBuilderFooter>

export default meta
type Story = StoryObj<typeof CharacterBuilderFooter>

export const IdentityStep: Story = {
  args: {
    currentStepId: 'identity',
  },
}

export const ReviewStep: Story = {
  args: {
    currentStepId: 'review',
    canCreateCharacter: true,
    isCreating: false,
  },
}

export const ReviewStepBlocked: Story = {
  args: {
    currentStepId: 'review',
    canCreateCharacter: false,
    isCreating: false,
  },
}

export const Creating: Story = {
  args: {
    currentStepId: 'review',
    canCreateCharacter: true,
    isCreating: true,
  },
}
