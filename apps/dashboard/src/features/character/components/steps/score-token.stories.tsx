import type { Meta, StoryObj } from '@storybook/react-vite'

import { abilitiesFormCopy } from '../../lib/steps/abilities-form-labels'
import { FIXED_SCORES_DND_KINDS } from '../../lib/steps/fixed-scores-dnd.lib'
import { ScoreToken } from './score-token.client'

const meta = {
  title: 'Character Builder/ScoreToken',
  component: ScoreToken,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ScoreToken>

export default meta
type Story = StoryObj<typeof meta>

export const PoolToken: Story = {
  args: {
    value: 15,
    size: 'pool',
    surface: 'token',
    interactive: true,
    dndId: 'pool:15',
    dndData: { kind: FIXED_SCORES_DND_KINDS.pool, score: 15 },
  },
}

export const AssignedPlain: Story = {
  args: {
    value: 14,
    size: 'assigned',
    surface: 'plain',
    interactive: true,
    ariaLabel: 'Dexterity score 14',
    dndId: 'assigned:dex',
    dndData: { kind: FIXED_SCORES_DND_KINDS.assigned, ability: 'dex', score: 14 },
  },
}

export const AssignedDragging: Story = {
  args: {
    value: 14,
    size: 'assigned',
    surface: 'plain',
    interactive: true,
    dragging: true,
    ariaLabel: 'Dexterity score 14',
    dndId: 'assigned:dex',
    dndData: { kind: FIXED_SCORES_DND_KINDS.assigned, ability: 'dex', score: 14 },
  },
}

export const AssignedDragOverlay: Story = {
  args: {
    value: 14,
    size: 'assigned',
    surface: 'token',
    dragOverlay: true,
    interactive: false,
  },
}

export const PoolDragOverlay: Story = {
  args: {
    value: 15,
    size: 'pool',
    surface: 'token',
    dragOverlay: true,
    interactive: false,
  },
}

export const Placeholder: Story = {
  args: {
    label: abilitiesFormCopy.dropScoreHere,
    size: 'assigned',
    surface: 'placeholder',
    interactive: false,
  },
}
