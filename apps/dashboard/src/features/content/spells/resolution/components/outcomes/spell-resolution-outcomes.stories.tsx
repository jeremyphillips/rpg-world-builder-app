import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { optionalResolutionFormSchema } from '../../lib/form/resolution-form-schema'
import { SpellResolutionOutcomes } from './spell-resolution-outcomes.client'

const outcomesSchema = z.object({
  resolution: optionalResolutionFormSchema,
})

function OutcomesStory({ defaultResolution }: { defaultResolution?: ResolutionFormValues }) {
  return (
    <Form
      schema={outcomesSchema}
      fields={[
        {
          kind: 'slot',
          name: '_resolutionOutcomes',
          render: () => <SpellResolutionOutcomes />,
        },
      ]}
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
