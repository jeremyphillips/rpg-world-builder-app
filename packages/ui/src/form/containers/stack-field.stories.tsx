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

const plainStackFields: FormItem[] = [
  {
    kind: 'stack',
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

const dependentStackFieldItems = [
  {
    type: 'switch' as const,
    name: 'advancedEnabled',
    label: 'Advanced options',
    hint: 'Enable to configure the threshold below.',
  },
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

const dependentStackFields: FormItem[] = [
  {
    kind: 'stack',
    layout: 'dependent',
    dependentsChrome: 'subtle',
    fields: dependentStackFieldItems,
  },
]

const dependentErrorToneFields: FormItem[] = [
  {
    kind: 'stack',
    layout: 'dependent',
    dependentsChrome: 'error',
    fields: [
      {
        type: 'switch',
        name: 'advancedEnabled',
        label: 'Risky override',
        hint: 'Reserved error tone — for future validation callouts.',
        defaultValue: true,
      },
      {
        type: 'number',
        name: 'advancedValue',
        label: 'Override value',
        labelPosition: 'settings',
        defaultValue: 99,
      },
    ],
  },
]

const selectDependentSchema = z.object({
  classPolicyMode: z.string(),
  classPolicyClassIds: z.array(z.string()).optional(),
})

const selectDependentStackFields: FormItem[] = [
  {
    kind: 'stack',
    layout: 'dependent',
    dependentsVisibility: {
      dependsOn: ['classPolicyMode'],
      visibleWhen: (values) => values.classPolicyMode !== 'all',
    },
    dependentsChrome: 'subtle',
    fields: [
      {
        type: 'select',
        name: 'classPolicyMode',
        label: 'Class restrictions',
        labelPosition: 'settings',
        separator: 'subtle',
        options: [
          { label: 'All classes', value: 'all' },
          { label: 'Only listed classes', value: 'only' },
          { label: 'All except listed', value: 'except' },
        ],
        defaultValue: 'all',
        hint: 'Choose which classes this species may multiclass into.',
      },
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
]

const meta = {
  title: 'Forms/Form/Stack',
  component: Form<StackForm>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form<StackForm>>

export default meta
type Story = StoryObj<typeof meta>

/** Default layout stack — tight inner rhythm, no dependent split. */
export const PlainStack: Story = {
  args: {
    schema: stackSchema,
    fields: plainStackFields,
    defaultValues: { advancedEnabled: false },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

/** Switch-gated dependent stack with subtle dependents-only chrome (production pattern). */
export const DependentStack: Story = {
  args: {
    schema: stackSchema,
    fields: dependentStackFields,
    defaultValues: { advancedEnabled: true, advancedLevel: '1', advancedValue: 13 },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

/** Dependent stack with comfortable rhythm for multi-field dependents. */
export const DependentStackComfortable: Story = {
  args: {
    schema: stackSchema,
    fields: [
      {
        kind: 'stack',
        layout: 'dependent',
        dependentsChrome: 'subtle',
        rhythm: 'comfortable',
        fields: dependentStackFieldItems,
      },
    ],
    defaultValues: { advancedEnabled: true, advancedLevel: '1', advancedValue: 13 },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
}

/** Error tone slot — future-facing semantic chrome variant. */
export const DependentStackErrorTone: Story = {
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

/** Dependent stack with array dependents — tone on item shells, not wrapper. */
export const DependentStackArrayItemsScope: Story = {
  args: {
    schema: stackSchema,
    fields: dependentStackFields,
    defaultValues: { advancedEnabled: true },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
  render: () => (
    <Form<z.infer<typeof arrayItemsScopeSchema>>
      schema={arrayItemsScopeSchema}
      fields={[
        {
          kind: 'stack',
          layout: 'dependent',
          dependentsChrome: 'subtle',
          dependentsChromeScope: 'arrayItems',
          fields: [
            {
              type: 'switch',
              name: 'classLimitsEnabled',
              label: 'Class-specific limits',
              hint: 'Limit progression per class.',
              defaultValue: true,
            },
            {
              kind: 'array',
              name: 'caps',
              legend: '',
              addLabel: 'Add class limit',
              fields: [
                { type: 'text', name: 'classId', label: 'Class' },
                { type: 'text', name: 'maxLevel', label: 'Max level' },
              ],
            },
          ],
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

/** Select controller + explicit dependentsVisibility — class-policy shape. */
export const SelectDependentStack: Story = {
  args: {
    schema: stackSchema,
    fields: dependentStackFields,
    defaultValues: { advancedEnabled: false },
    onSubmit: action('submit'),
    className: 'max-w-lg',
  },
  render: () => (
    <Form<z.infer<typeof selectDependentSchema>>
      schema={selectDependentSchema}
      fields={selectDependentStackFields}
      defaultValues={{ classPolicyMode: 'only', classPolicyClassIds: ['fighter'] }}
      onSubmit={action('submit')}
      className="max-w-lg"
    />
  ),
}
