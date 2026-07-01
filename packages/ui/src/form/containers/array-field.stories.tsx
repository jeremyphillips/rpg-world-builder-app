import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'
import { CardFooter } from '../../components/ui/card'
import { SubmitButton } from '../../components/ui/submit-button'

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
    itemHeader: {
      fallback: (index) => `Trait ${index + 1}`,
      primaryField: 'name',
    },
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
 * button to append items; each item shows a drag handle (when reorderable) and remove control.
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
    itemHeader: {
      fallback: (index) => `Grant ${index + 1}`,
      primary: (values) => {
        const type = values.type as string | undefined
        return type ? `${type.charAt(0).toUpperCase()}${type.slice(1)}` : undefined
      },
      showDivider: true,
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

// ── Item chrome stories ──────────────────────────────────────────────────────

const compactRowSchema = z.object({
  grants: z.array(z.object({ grantType: z.string(), detail: z.string().optional() })),
})

type CompactRowValues = z.infer<typeof compactRowSchema>

const compactRowFields: FormItem[] = [
  {
    kind: 'array',
    name: 'grants',
    legend: 'Grants',
    itemVariant: 'compact',
    fields: [
      {
        kind: 'row',
        fields: [
          { type: 'text', name: 'grantType', label: 'Type', required: true },
          { type: 'text', name: 'detail', label: 'Detail' },
        ],
      },
    ],
    addLabel: 'Add grant',
    itemHeader: { fallback: (i) => `Grant ${i + 1}`, srOnly: true },
  },
]

/** Compact inline row — grip, fields, and trash on one line; no collapse caret. */
export const CompactRow: StoryObj<Meta<object>> = {
  render: () => (
    <Form<CompactRowValues>
      schema={compactRowSchema}
      fields={compactRowFields}
      defaultValues={{ grants: [{ grantType: 'senses', detail: 'Darkvision 60 ft.' }] }}
      onSubmit={action('submit')}
      className="max-w-xl"
      footer={
        <CardFooter className="justify-end px-0">
          <SubmitButton>Save</SubmitButton>
        </CardFooter>
      }
    />
  ),
}

const detailedCollapsibleSchema = z.object({
  traits: z.array(traitSchema),
})

type DetailedCollapsibleValues = z.infer<typeof detailedCollapsibleSchema>

const detailedCollapsibleFields: FormItem[] = [
  {
    kind: 'array',
    name: 'traits',
    legend: 'Traits',
    itemVariant: 'detailed',
    itemCollapsible: true,
    fields: [
      { type: 'text', name: 'name', label: 'Trait name', required: true },
      { type: 'textarea', name: 'description', label: 'Description', rows: 2 },
    ],
    addLabel: 'Add trait',
    itemHeader: {
      fallback: (i) => `Trait ${i + 1}`,
      primaryField: 'name',
      showDivider: true,
      summary: (values) => (values.description as string) || 'No description',
    },
  },
]

/** Detailed items with collapse caret — body hides while values stay registered. */
export const DetailedCollapsible: StoryObj<Meta<object>> = {
  render: () => (
    <Form<DetailedCollapsibleValues>
      schema={detailedCollapsibleSchema}
      fields={detailedCollapsibleFields}
      defaultValues={{
        traits: [
          { name: 'Darkvision', description: 'See in dim light within 60 feet.' },
          { name: 'Keen Senses', description: 'Advantage on Perception checks.' },
        ],
      }}
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

const nestedCompactSchema = z.object({
  packages: z.array(
    z.object({
      label: z.string(),
      items: z.array(z.object({ name: z.string() })).optional(),
    }),
  ),
})

type NestedCompactValues = z.infer<typeof nestedCompactSchema>

const nestedCompactFields: FormItem[] = [
  {
    kind: 'array',
    name: 'packages',
    legend: 'Equipment packages',
    itemVariant: 'detailed',
    itemCollapsible: true,
    fields: [
      { type: 'text', name: 'label', label: 'Package label', required: true },
      {
        kind: 'array',
        name: 'items',
        legend: 'Items',
        fields: [{ type: 'text', name: 'name', label: 'Item name', required: true }],
        addLabel: 'Add item',
        itemHeader: { fallback: (i) => `Item ${i + 1}`, primaryField: 'name' },
      },
    ],
    addLabel: 'Add package',
    itemHeader: {
      fallback: (i) => `Package ${i + 1}`,
      primaryField: 'label',
      showDivider: true,
    },
  },
]

/** Nested arrays inside detailed items render as compact rows without per-item collapse. */
export const NestedCompact: StoryObj<Meta<object>> = {
  render: () => (
    <Form<NestedCompactValues>
      schema={nestedCompactSchema}
      fields={nestedCompactFields}
      defaultValues={{
        packages: [
          {
            label: 'Explorer pack',
            items: [{ name: 'Bedroll' }, { name: 'Rations (5 days)' }],
          },
        ],
      }}
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

const dragReorderSchema = z.object({
  steps: z.array(z.object({ instruction: z.string().min(1) })),
})

type DragReorderValues = z.infer<typeof dragReorderSchema>

const dragReorderFields: FormItem[] = [
  {
    kind: 'array',
    name: 'steps',
    legend: 'Steps',
    itemVariant: 'detailed',
    fields: [{ type: 'text', name: 'instruction', label: 'Instruction', required: true }],
    addLabel: 'Add step',
    itemHeader: {
      fallback: (i) => `Step ${i + 1}`,
      primaryField: 'instruction',
    },
  },
]

/** Multiple items show drag handles — grip-only reorder via @dnd-kit. */
export const DragReorder: StoryObj<Meta<object>> = {
  render: () => (
    <Form<DragReorderValues>
      schema={dragReorderSchema}
      fields={dragReorderFields}
      defaultValues={{
        steps: [
          { instruction: 'Roll initiative' },
          { instruction: 'Take turns in order' },
          { instruction: 'End combat when foes flee' },
        ],
      }}
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
