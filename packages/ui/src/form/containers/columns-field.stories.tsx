import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import { SubmitButton } from '../../components/ui/submit-button'
import { CardFooter } from '../../components/ui/card'

const schema = z.object({
  description: z.string().optional(),
  primary: z.array(z.string()),
  hitDie: z.string(),
  note: z.string().optional(),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  {
    kind: 'columns',
    columns: [
      {
        fields: [
          { type: 'textarea', name: 'description', label: 'Description' },
          {
            type: 'chips',
            name: 'primary',
            label: 'Primary abilities',
            options: [
              { label: 'Strength', value: 'str' },
              { label: 'Dexterity', value: 'dex' },
            ],
            max: 2,
          },
          {
            type: 'select',
            name: 'hitDie',
            label: 'Hit die',
            options: [
              { label: 'd8', value: '8' },
              { label: 'd10', value: '10' },
            ],
            width: 'auto',
          },
        ],
      },
      {
        fields: [
          {
            type: 'textarea',
            name: 'note',
            label: 'Suggested ability scores',
            hint: 'Placeholder for the sortable Standard Array order.',
          },
        ],
      },
    ],
  },
]

const meta = {
  title: 'Form/Columns',
  component: Form<Values>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<Values>>

export default meta
type Story = StoryObj<typeof meta>

export const TwoColumns: Story = {
  args: {
    schema,
    fields,
    defaultValues: { description: '', primary: [], hitDie: '8', note: '' },
    onSubmit: action('submit'),
    footer: (
      <CardFooter>
        <SubmitButton>Save</SubmitButton>
      </CardFooter>
    ),
  },
}

export const InterleaveCollapse: Story = {
  args: {
    ...TwoColumns.args,
    fields: [
      {
        kind: 'columns',
        collapseOrder: 'interleave',
        columns: (fields[0] as Extract<FormItem, { kind: 'columns' }>).columns,
      },
    ],
  },
}
