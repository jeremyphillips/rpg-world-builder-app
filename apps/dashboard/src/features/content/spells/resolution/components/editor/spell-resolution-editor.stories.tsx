import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildSeedDamageTypeVocabulary } from '@/features/homebrew'

import { makeContentFormCtx } from '../../../../lib/fixtures/content-form-ctx'
import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { SpellResolutionEditor } from './spell-resolution-editor.client'

const formCtx = makeContentFormCtx({
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
})

const meta = {
  title: 'Content/Spells/SpellResolutionEditor',
  component: SpellResolutionEditor,
  parameters: { layout: 'padded' },
  args: { formCtx },
} satisfies Meta<typeof SpellResolutionEditor>

export default meta
type Story = StoryObj<typeof meta>

/** No resolution envelope — empty state with Add resolution action. */
export const Empty: Story = {}

/** Ranged attack preset: 120 ft, 1d10 force, hit applies full damage. */
export const EldritchBlast: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.eldritchBlast },
}

/** Melee attack preset with optional additional behavior on the hit outcome. */
export const ChillTouchWithNote: Story = {
  name: 'Chill Touch (with note)',
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.chillTouch },
}

/** Saving throw preset: CON save, touch range, failed full / successful half damage. */
export const InflictWounds: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.inflictWounds },
}

/** Automatic preset with three force darts applied per projectile. */
export const MagicMissile: Story = {
  name: 'Magic Missile',
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.magicMissile },
}

/** Self automatic temporary hit points — recipient-aware preview. */
export const FalseLife: Story = {
  name: 'False Life (self)',
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.falseLife },
}

/** Point origin with sphere area and DEX save damage. */
export const Fireball: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.fireball },
}

/** Caster-origin cone with area-occupant damage. */
export const BurningHands: Story = {
  name: 'Burning Hands (self + area)',
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.burningHands },
}

/** Up-to six targets at distance with automatic healing. */
export const MassHealingWord: Story = {
  name: 'Mass Healing Word (up to 6)',
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.massHealingWord },
}
