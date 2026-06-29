import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from './form.client'
import type { FormItem } from './field-config'
import { CardFooter } from '../components/ui/card'
import { SubmitButton } from '../components/ui/submit-button'

// ── Flat array story ─────────────────────────────────────────────────────────

const traitSchema = z.object({
  name: z.string().min(1, 'Trait name is required'),
  description: z.string(),
})

const flatSchema = z.object({
  speciesName: z.string().min(1, 'Required'),
  traits: z.array(traitSchema),
})

type FlatValues = z.infer<typeof flatSchema>

const flatFields: FormItem[] = [
  { type: 'text', name: 'speciesName', label: 'Species name', required: true },
  {
    kind: 'array',
    name: 'traits',
    legend: 'Traits',
    fields: [
      { type: 'text', name: 'name', label: 'Trait name', required: true },
      { type: 'textarea', name: 'description', label: 'Description', rows: 2 },
    ],
    addLabel: 'Add trait',
    itemTitle: (_values, index) => `Trait ${index + 1}`,
  },
]

const meta = {
  title: 'Forms/ArrayField',
  component: Form<FlatValues>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<FlatValues>>

export default meta
type Story = StoryObj<typeof meta>

/**
 * A form with a flat repeatable array of trait objects. Use the "Add trait"
 * button to append items; each item shows Reorder (↑/↓) and Remove controls.
 */
export const FlatArray: Story = {
  args: {
    schema: flatSchema,
    fields: flatFields,
    onSubmit: action('submit'),
    className: 'max-w-lg',
    footer: (
      <CardFooter className="justify-end px-0">
        <SubmitButton>Save species</SubmitButton>
      </CardFooter>
    ),
  },
}

// ── Conditional item field story ─────────────────────────────────────────────

const grantSchema = z.object({
  type: z.enum(['resistance', 'sense']),
  value: z.string().optional(),
  range: z.number().optional(),
})

const conditionalSchema = z.object({
  grants: z.array(grantSchema),
})

type ConditionalValues = z.infer<typeof conditionalSchema>

const conditionalFields: FormItem[] = [
  {
    kind: 'array',
    name: 'grants',
    legend: 'Grants',
    fields: [
      {
        type: 'select',
        name: 'type',
        label: 'Grant type',
        options: [
          { value: 'resistance', label: 'Resistance' },
          { value: 'sense', label: 'Sense' },
        ],
        required: true,
      },
      {
        type: 'text',
        name: 'value',
        label: 'Damage type',
        placeholder: 'e.g. fire',
        visibility: {
          dependsOn: ['type'],
          visibleWhen: (v) => v.type === 'resistance',
        },
      },
      {
        type: 'inputUnit',
        name: 'range',
        label: 'Range',
        unit: 'ft.',
        min: 0,
        visibility: {
          dependsOn: ['type'],
          visibleWhen: (v) => v.type === 'sense',
        },
      },
    ],
    addLabel: 'Add grant',
    itemTitle: (values, index) => {
      const type = values.type as string | undefined
      return type
        ? `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`
        : `Grant ${index + 1}`
    },
  },
]

/**
 * An array where each item has a type discriminator that controls which sibling
 * fields render. Choosing "Resistance" shows a damage-type text field; choosing
 * "Sense" shows a range input with a fixed ft. unit label. This exercises the
 * `ConditionalField` logic.
 */
export const ConditionalItemFields: StoryObj<Meta<object>> = {
  render: () => (
    <Form<ConditionalValues>
      schema={conditionalSchema}
      fields={conditionalFields}
      onSubmit={action('submit')}
      className="max-w-lg"
      footer={
        <CardFooter className="justify-end px-0">
          <SubmitButton>Save</SubmitButton>
        </CardFooter>
      }
    />
  ),
}

// ── Bounded array (min / max) story ──────────────────────────────────────────

const boundedSchema = z.object({
  tags: z
    .array(z.object({ label: z.string().min(1, 'Required') }))
    .min(1)
    .max(3),
})

type BoundedValues = z.infer<typeof boundedSchema>

const boundedFields: FormItem[] = [
  {
    kind: 'array',
    name: 'tags',
    legend: 'Tags',
    fields: [{ type: 'text', name: 'label', label: 'Tag', required: true }],
    addLabel: 'Add tag',
    min: 1,
    max: 3,
  },
]

/**
 * Demonstrates `min` and `max` constraints. The Remove button is disabled while
 * at the minimum (1); the Add button disappears once the maximum (3) is reached.
 */
export const BoundedArray: StoryObj<Meta<object>> = {
  render: () => (
    <Form<BoundedValues>
      schema={boundedSchema}
      fields={boundedFields}
      onSubmit={action('submit')}
      className="max-w-lg"
      footer={
        <CardFooter className="justify-end px-0">
          <SubmitButton>Save</SubmitButton>
        </CardFooter>
      }
    />
  ),
}
