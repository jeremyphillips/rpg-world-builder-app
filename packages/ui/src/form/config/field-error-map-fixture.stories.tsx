import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useFormContext } from 'react-hook-form'

import { Form } from '../shells/form.client'
import {
  GOLDEN_PATH_FIELDS,
  goldenPathSchema,
  type GoldenPathValues,
} from './field-error-map-fixture.lib'
import type { FormItem } from '../field-config'
import { CardFooter } from '../../components/ui/card'
import { SubmitButton } from '../../components/ui/submit-button'

function NotesSlot() {
  const { register } = useFormContext<GoldenPathValues>()
  return (
    <textarea
      aria-label="Notes"
      rows={3}
      className="w-full rounded-md border border-border p-2"
      {...register('notes')}
    />
  )
}

const fields: FormItem[] = GOLDEN_PATH_FIELDS.map((item) =>
  'kind' in item && item.kind === 'slot' && item.name === 'notes'
    ? { ...item, render: () => <NotesSlot /> }
    : item,
)

const meta = {
  title: 'Forms/FieldErrorMapFixture',
  component: Form<GoldenPathValues>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<GoldenPathValues>>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Synthetic form exercising tier-1 error-map edge cases (email, slug, union,
 * slot, editableGrid, diceFormula, array itemHeader, exact-length arrays).
 * Submit with empty defaults to inspect validation copy.
 */
export const GoldenPath: Story = {
  args: {
    schema: goldenPathSchema,
    fields,
    defaultValues: {
      email: '',
      slug: '',
      mode: undefined,
      grant: { kind: 'skill' },
      notes: '',
      grid: { cantrips: [null, null] },
      roll: { count: 0, faces: 6 },
      grants: [],
      tiers: [],
    },
    onSubmit: action('submit'),
    className: 'max-w-lg',
    footer: (
      <CardFooter className="justify-end px-0">
        <SubmitButton>Validate</SubmitButton>
      </CardFooter>
    ),
  },
}
