import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'

import { makeContentFormCtx } from '@/features/content/lib/fixtures/content-form-ctx'
import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { resolutionFields } from '../../lib/form/resolution-form-fields'
import { optionalResolutionFormSchema } from '../../lib/form/resolution-form-schema'

const formCtx = makeContentFormCtx({
  damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
})

const schema = z.object({ resolution: optionalResolutionFormSchema })

type SelectionModeStoryArgs = {
  defaultResolution: (typeof RESOLUTION_FORM_FIXTURES)['cureWounds']
}

function SelectionModeStory({ defaultResolution }: SelectionModeStoryArgs) {
  return (
    <Form
      schema={schema}
      fields={resolutionFields(formCtx)}
      defaultValues={{ resolution: defaultResolution }}
      onSubmit={() => undefined}
      rhythm="compact"
    />
  )
}

const meta = {
  title: 'Content/Spells/SpellResolutionSelectionModeSelect',
  component: SelectionModeStory,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SelectionModeStory>

export default meta
type Story = StoryObj<typeof meta>

export const TargetsMode: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.cureWounds },
}

export const SelfMode: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.falseLife },
}

export const PointMode: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.fireball },
}
