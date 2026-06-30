import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import { CardFooter } from '../../components/ui/card'
import { SubmitButton } from '../../components/ui/submit-button'

function NotesSlot() {
  const { register } = useFormContext<{ notes: string }>()
  return (
    <textarea
      aria-label="Notes"
      rows={3}
      className="w-full rounded-md border border-border p-2"
      {...register('notes')}
    />
  )
}

const schema = z.object({
  name: z.string().min(1),
  notes: z.string().optional(),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', required: true },
  {
    kind: 'slot',
    name: 'notes',
    label: 'Notes',
    hint: 'Optional author notes rendered by a custom slot.',
    render: () => <NotesSlot />,
  },
]

const meta = {
  title: 'Forms/SlotField',
  component: Form<Values>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<Values>>

export default meta
type Story = StoryObj<typeof meta>

/** Custom slot region rendered alongside schema-driven fields inside one form. */
export const WithNotesSlot: Story = {
  args: {
    schema,
    fields,
    defaultValues: { notes: '' },
    collapsibleSections: false,
    onSubmit: action('submit'),
    className: 'max-w-lg',
    footer: (
      <CardFooter className="justify-end px-0">
        <SubmitButton>Save</SubmitButton>
      </CardFooter>
    ),
  },
}
