import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { optionalResolutionFormSchema } from '../../lib/form/resolution-form-schema'
import { resolutionOutcomeBranchesFields } from '../../lib/form/resolution-form-slots'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'

const outcomesSchema = z.object({
  resolution: optionalResolutionFormSchema,
})

function OutcomesStory({ defaultResolution }: { defaultResolution?: ResolutionFormValues }) {
  return (
    <Form
      schema={outcomesSchema}
      fields={resolutionOutcomeBranchesFields()}
      defaultValues={{ resolution: defaultResolution }}
      onSubmit={() => undefined}
      rhythm="compact"
    />
  )
}

const meta = {
  title: 'Content/Spells/SpellResolutionOutcomes',
  component: OutcomesStory,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof OutcomesStory>

export default meta
type Story = StoryObj<typeof meta>

export const MagicMissile: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.magicMissile },
}

export const EldritchBlast: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.eldritchBlast },
}

export const InflictWounds: Story = {
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.inflictWounds },
}

export const ChillTouch: Story = {
  name: 'Chill Touch',
  args: { defaultResolution: RESOLUTION_FORM_FIXTURES.chillTouch },
}

export const AllIncompleteEffects: Story = {
  name: 'All incomplete effects',
  args: {
    defaultResolution: {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      effects: [
        {
          id: 'incomplete',
          kind: 'damage',
          roll: {},
          damageType: 'force',
        },
      ],
      outcomes: [{ result: 'hit', applications: [] }],
    },
  },
}

export const IncompleteApplicationRow: Story = {
  name: 'Incomplete application row',
  args: {
    defaultResolution: {
      ...RESOLUTION_FORM_FIXTURES.eldritchBlast,
      effects: [
        {
          id: 'incomplete',
          kind: 'damage',
          roll: {},
          damageType: 'force',
        },
      ],
      outcomes: [
        {
          result: 'hit',
          applications: [{ effectId: 'incomplete', amount: 'full' }],
        },
      ],
    },
  },
}
