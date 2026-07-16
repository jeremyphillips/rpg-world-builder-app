import type { Meta, StoryObj } from '@storybook/react-vite'

import { characterBuilderStepReadinessMessages, formatFieldMessage } from '@rpg/contracts'

import { BuilderStepReadinessPanel } from './builder-step-readiness-panel.client'

const meta = {
  title: 'Character Builder/BuilderStepReadinessPanel',
  component: BuilderStepReadinessPanel,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof BuilderStepReadinessPanel>

export default meta
type Story = StoryObj<typeof BuilderStepReadinessPanel>

export const PartialBlock: Story = {
  args: {
    state: {
      readiness: 'blocked',
      classDependentBlocked: true,
      message: formatFieldMessage(
        characterBuilderStepReadinessMessages.proficienciesBlockedNoClass(),
      ),
      helperText: formatFieldMessage(
        characterBuilderStepReadinessMessages.proficienciesBlockedNoClassHelper(),
      ),
    },
  },
}

export const NotApplicable: Story = {
  args: {
    state: {
      readiness: 'notApplicable',
      message: formatFieldMessage(
        characterBuilderStepReadinessMessages.spellsNotApplicableNoSpellcasting({
          className: 'Fighter',
        }),
      ),
    },
  },
}
