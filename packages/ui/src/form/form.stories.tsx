import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from './field-config'
import { CardFooter } from '../components/ui/card'
import { SubmitButton } from '../components/ui/submit-button'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  className: z.string().min(1, 'Choose a class'),
  level: z.number().min(1, 'Min level is 1').max(20, 'Max level is 20'),
  hasFamiliar: z.boolean(),
  familiarName: z.string().min(1, 'Name your familiar'),
  bio: z.string(),
})

type CharacterForm = z.infer<typeof schema>

const fields: FormItem[] = [
  {
    kind: 'group',
    legend: 'Character',
    description: 'The basics that head your character sheet.',
    fields: [
      { type: 'text', name: 'name', label: 'Name', placeholder: 'Tasha', required: true },
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'className',
            label: 'Class',
            width: 'full',
            placeholder: 'Choose a class',
            required: true,
            options: [
              { label: 'Wizard', value: 'wizard' },
              { label: 'Rogue', value: 'rogue' },
              { label: 'Cleric', value: 'cleric' },
            ],
          },
          { type: 'number', name: 'level', label: 'Level', min: 1, max: 20, defaultValue: 1 },
        ],
      },
    ],
  },
  { type: 'switch', name: 'hasFamiliar', label: 'Has a familiar' },
  {
    type: 'text',
    name: 'familiarName',
    label: 'Familiar name',
    placeholder: 'Mittens',
    required: true,
    visibility: {
      dependsOn: ['hasFamiliar'],
      visibleWhen: (values) => values.hasFamiliar === true,
    },
  },
  { type: 'richtext', name: 'bio', label: 'Biography', hint: 'Bold and italics are supported.' },
]

const meta = {
  title: 'Forms/Form',
  component: Form<CharacterForm>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<CharacterForm>>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A schema-driven form combining a group, a row, a conditional field (the
 * familiar name only appears when the switch is on), and a rich-text field.
 */
export const Default: Story = {
  args: {
    schema,
    fields,
    onSubmit: action('submit'),
    className: 'max-w-lg',
    footer: (
      <CardFooter className="justify-end px-0">
        <SubmitButton>Save character</SubmitButton>
      </CardFooter>
    ),
  },
}

/** Flat fieldsets — no accordion wrappers on top-level groups. */
export const FlatSections: Story = {
  args: {
    ...Default.args,
    collapsibleSections: false,
  },
}
