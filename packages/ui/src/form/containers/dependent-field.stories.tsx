import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const stackSchema = z.object({
  advancedEnabled: z.boolean(),
  advancedLevel: z.string().optional(),
  advancedValue: z.number().optional(),
})

type StackForm = z.infer<typeof stackSchema>

const plainGroupFields: FormItem[] = [
  {
    kind: 'group',
    fields: [
      { type: 'switch', name: 'advancedEnabled', label: 'Advanced options' },
      {
        type: 'number',
        name: 'advancedValue',
        label: 'Threshold',
        defaultValue: 10,
        visibility: {
          dependsOn: ['advancedEnabled'],
          visibleWhen: (values) => values.advancedEnabled === true,
        },
      },
    ],
  },
]

const dependentFieldItems = [
  {
    type: 'select' as const,
    name: 'advancedLevel',
    label: 'Start level',
    labelPosition: 'settings' as const,
    separator: 'subtle' as const,
    options: [
      { label: '1', value: '1' },
      { label: '3', value: '3' },
    ],
    defaultValue: '1',
    visibility: {
      dependsOn: ['advancedEnabled'],
      visibleWhen: (values: Record<string, unknown>) => values.advancedEnabled === true,
    },
  },
  {
    type: 'number' as const,
    name: 'advancedValue',
    label: 'Threshold',
    labelPosition: 'settings' as const,
    defaultValue: 10,
    visibility: {
      dependsOn: ['advancedEnabled'],
      visibleWhen: (values: Record<string, unknown>) => values.advancedEnabled === true,
    },
  },
]

const dependentFields: FormItem[] = [
  {
    kind: 'dependent',
    controller: {
      type: 'switch',
      name: 'advancedEnabled',
      label: 'Advanced options',
      hint: 'Enable to configure the threshold below.',
    },
    dependents: {
      surface: { emphasis: 'subtle' },
      fields: dependentFieldItems,
    },
  },
]

const dependentErrorToneFields: FormItem[] = [
  {
    kind: 'dependent',
    controller: {
      type: 'switch',
      name: 'advancedEnabled',
      label: 'Risky override',
      hint: 'Reserved error tone — for future validation callouts.',
      defaultValue: true,
    },
    dependents: {
      tone: 'destructive',
      fields: [
        {
          type: 'number',
          name: 'advancedValue',
          label: 'Override value',
          labelPosition: 'settings',
          defaultValue: 99,
        },
      ],
    },
  },
]

const selectDependentSchema = z.object({
  classPolicyMode: z.string(),
  classPolicyClassIds: z.array(z.string()).optional(),
})

const selectDependentFields: FormItem[] = [
  {
    kind: 'dependent',
    separator: 'subtle',
    controller: {
      type: 'select',
      name: 'classPolicyMode',
      label: 'Class restrictions',
      labelPosition: 'settings',
      options: [
        { label: 'All classes', value: 'all' },
        { label: 'Only listed classes', value: 'only' },
        { label: 'All except listed', value: 'except' },
      ],
      defaultValue: 'all',
      hint: 'Choose which classes this species may multiclass into.',
    },
    dependents: {
      visibility: {
        dependsOn: ['classPolicyMode'],
        visibleWhen: (values) => values.classPolicyMode !== 'all',
      },
      surface: { emphasis: 'subtle' },
      fields: [
        {
          type: 'combobox',
          name: 'classPolicyClassIds',
          label: 'Classes',
          multiple: true,
          options: [
            { label: 'Fighter', value: 'fighter' },
            { label: 'Wizard', value: 'wizard' },
            { label: 'Rogue', value: 'rogue' },
          ],
          placeholder: 'Choose classes…',
        },
      ],
    },
  },
]

const meta = {
  title: 'Forms/Form/Dependent',
  component: Form<StackForm>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<StackForm>>

export default meta
type Story = StoryObj<typeof meta>

/** Default layout group — tight inner rhythm, no dependent split. */
export const PlainGroup: Story = {
  args: {
    schema: stackSchema,
    fields: plainGroupFields,
    defaultValues: { advancedEnabled: false },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

/** Switch-gated dependent field with subtle dependents-only chrome (production pattern). */
export const DependentField: Story = {
  args: {
    schema: stackSchema,
    fields: dependentFields,
    defaultValues: { advancedEnabled: true, advancedLevel: '1', advancedValue: 13 },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

/** Dependent field with comfortable rhythm for multi-field dependents. */
export const DependentFieldComfortable: Story = {
  args: {
    schema: stackSchema,
    fields: [
      {
        kind: 'dependent',
        controller: {
          type: 'switch',
          name: 'advancedEnabled',
          label: 'Advanced options',
          defaultValue: true,
        },
        dependents: {
          surface: { emphasis: 'subtle' },
          fields: dependentFieldItems,
        },
      },
    ],
    defaultValues: { advancedEnabled: true, advancedLevel: '1', advancedValue: 13 },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

/** Error tone slot — future-facing semantic chrome variant. */
export const DependentFieldErrorTone: Story = {
  args: {
    schema: stackSchema,
    fields: dependentErrorToneFields,
    defaultValues: { advancedEnabled: true, advancedValue: 99 },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

const arrayItemsScopeSchema = z.object({
  classLimitsEnabled: z.boolean(),
  caps: z.array(z.object({ classId: z.string(), maxLevel: z.string() })),
})

/** Dependent field with array dependents — item shells use elevated card chrome by default. */
export const DependentFieldArrayItemsScope: Story = {
  args: {} as Story['args'],
  render: () => (
    <Form<z.infer<typeof arrayItemsScopeSchema>>
      schema={arrayItemsScopeSchema}
      fields={[
        {
          kind: 'dependent',
          controller: {
            type: 'switch',
            name: 'classLimitsEnabled',
            label: 'Class-specific limits',
            hint: 'Limit progression per class.',
            defaultValue: true,
          },
          dependents: {
            surface: { emphasis: 'subtle' },
            scope: 'arrayItems',
            fields: [
              {
                kind: 'array',
                name: 'caps',
                legend: '',
                addAction: { label: 'Add class limit' },
                fields: [
                  { type: 'text', name: 'classId', label: 'Class' },
                  { type: 'text', name: 'maxLevel', label: 'Max level' },
                ],
              },
            ],
          },
        },
      ]}
      defaultValues={{
        classLimitsEnabled: true,
        caps: [{ classId: 'Fighter', maxLevel: '10' }],
      }}
      onSubmit={action('submit')}
      className="max-w-lg"
    />
  ),
}

/** Select controller + explicit dependents.visibility — class-policy shape. */
export const SelectDependentField: Story = {
  args: {} as Story['args'],
  render: () => (
    <Form<z.infer<typeof selectDependentSchema>>
      schema={selectDependentSchema}
      fields={selectDependentFields}
      defaultValues={{ classPolicyMode: 'only', classPolicyClassIds: ['fighter'] }}
      onSubmit={action('submit')}
      className="max-w-lg"
    />
  ),
}
