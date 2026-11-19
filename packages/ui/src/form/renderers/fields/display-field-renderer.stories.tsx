import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from '../../shells/form.client'
import type { FormItem } from '../../field-config'
import { CardFooter } from '../../../components/ui/card'
import { SubmitButton } from '../../../components/ui/submit-button'

const schema = z.object({
  level: z.number(),
  note: z.string().optional(),
})

type Values = z.infer<typeof schema>

const displayShowcaseFields: FormItem[] = [
  { type: 'number', name: 'level', label: 'Level', required: true },
  {
    kind: 'display',
    id: 'static-text',
    content: { variant: 'text', text: 'Static supporting copy.', role: 'supporting' },
  },
  {
    kind: 'display',
    id: 'resolved-text',
    resolve: {
      dependsOn: ['level'],
      contentWhen: (values) =>
        typeof values.level === 'number'
          ? { variant: 'text', text: `Max level ${values.level}`, role: 'muted', live: 'polite' }
          : undefined,
    },
  },
  {
    kind: 'display',
    id: 'notice',
    content: {
      variant: 'notice',
      notice: { tone: 'info', message: 'Display notices reuse AdvisoryAlert.' },
    },
  },
  {
    kind: 'display',
    id: 'feature-row',
    content: {
      variant: 'featureTableRow',
      title: 'Arcane Spellcasting',
      metadata: 'Level 2 · Edit on the Features tab',
      typeLabel: 'Spellcasting feature',
    },
  },
  { type: 'text', name: 'note', label: 'Note' },
]

const meta = {
  title: 'Forms/DisplayField',
  component: Form<Values>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<Values>>

export default meta
type Story = StoryObj<typeof meta>

export const BlockVariants: Story = {
  args: {
    schema,
    fields: displayShowcaseFields,
    defaultValues: { level: 5, note: '' },
    onSubmit: action('submit'),
    className: 'max-w-lg',
    footer: (
      <CardFooter className="justify-end px-0">
        <SubmitButton>Save</SubmitButton>
      </CardFooter>
    ),
  },
}
