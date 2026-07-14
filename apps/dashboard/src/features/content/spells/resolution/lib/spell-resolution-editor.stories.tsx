import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildSeedDamageTypeVocabulary } from '@/features/homebrew'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { SpellResolutionEditor } from '../components/spell-resolution-editor.client'
import { RESOLUTION_FORM_FIXTURES } from '../lib/resolution-fixtures'

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
