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

export const Empty: Story = {}

export const EldritchBlast: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.eldritchBlast },
}

export const ChillTouch: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.chillTouch },
}

export const InflictWounds: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.inflictWounds },
}
