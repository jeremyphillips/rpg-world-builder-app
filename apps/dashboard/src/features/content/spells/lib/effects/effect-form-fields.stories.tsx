import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildSeedDamageTypeVocabulary } from '@/features/homebrew'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { SpellEffectsEditor } from '../../components/spell-effects-editor.client'
import { SPELL_EFFECT_FIXTURES } from './effect-fixtures'

const formCtx = makeContentFormCtx({
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
})

const meta = {
  title: 'Content/Spells/SpellEffectsEditor',
  component: SpellEffectsEditor,
  parameters: { layout: 'padded' },
  args: { formCtx },
} satisfies Meta<typeof SpellEffectsEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}

export const FireBolt: Story = {
  args: { defaultEffects: [...SPELL_EFFECT_FIXTURES.fireBolt] },
}

export const MagicMissile: Story = {
  args: { defaultEffects: [...SPELL_EFFECT_FIXTURES.magicMissile] },
}

export const RepresentativeSet: Story = {
  args: {
    defaultEffects: [
      ...SPELL_EFFECT_FIXTURES.fireball,
      ...SPELL_EFFECT_FIXTURES.cureWounds,
      ...SPELL_EFFECT_FIXTURES.falseLife,
    ],
  },
}
