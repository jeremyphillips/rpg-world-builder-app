import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { TabbedForm } from './tabbed-form.client'
import type { TabbedFormTab } from './tabbed-form.client'
import { FormSaveFooter } from '../chrome/form-save-footer'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(500).optional(),
  startingLevel: z.number().int().min(1).max(25),
  playStyle: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
})

type CampaignForm = z.infer<typeof schema>

const tabs: TabbedFormTab[] = [
  {
    id: 'identity',
    label: 'Identity',
    fields: [
      {
        type: 'text',
        name: 'name',
        label: 'Campaign name',
        placeholder: 'The Sunless Citadel',
        required: true,
      },
      { type: 'textarea', name: 'description', label: 'Description', rows: 3 },
    ],
  },
  {
    id: 'rules',
    label: 'Rules',
    fields: [
      {
        type: 'number',
        name: 'startingLevel',
        label: 'Starting level',
        min: 1,
        max: 25,
        defaultValue: 1,
        hint: 'The level at which new player characters begin.',
      },
    ],
  },
  {
    id: 'flavor',
    label: 'Flavor',
    fields: [
      {
        type: 'chips',
        name: 'playStyle',
        label: 'Play Style',
        multiple: true,
        options: [
          { value: 'dungeon_crawl', label: 'Dungeon Crawl' },
          { value: 'exploration', label: 'Exploration' },
          { value: 'mystery', label: 'Mystery' },
          { value: 'sandbox', label: 'Sandbox' },
        ],
      },
      {
        type: 'chips',
        name: 'difficulty',
        label: 'Difficulty',
        multiple: false,
        options: [
          { value: 'casual', label: 'Casual' },
          { value: 'dangerous', label: 'Dangerous' },
          { value: 'brutal', label: 'Brutal' },
        ],
      },
    ],
  },
]

const meta = {
  title: 'Forms/TabbedForm',
  component: TabbedForm<CampaignForm>,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TabbedForm<CampaignForm>>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    schema,
    tabs,
    onSubmit: action('submit'),
    className: 'max-w-3xl',
    footer: <FormSaveFooter submitLabel="Save changes" />,
  },
}

const longSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(500).optional(),
  startingLevel: z.number().int().min(1).max(25),
  playStyle: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => [`extra-${index}`, z.string().optional()]),
  ),
})

type LongCampaignForm = z.infer<typeof longSchema>

const longTabs: TabbedFormTab[] = [
  {
    id: 'identity',
    label: 'Identity',
    fields: Array.from({ length: 12 }, (_, index) => ({
      type: 'text' as const,
      name: `extra-${index}`,
      label: `Field ${index + 1}`,
    })),
  },
  ...tabs.slice(1),
]

export const LongContent: StoryObj = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <TabbedForm<LongCampaignForm>
        schema={longSchema}
        tabs={longTabs}
        onSubmit={action('submit')}
        className="max-w-3xl"
        footer={<FormSaveFooter submitLabel="Save changes" />}
      />
    </div>
  ),
}

export const WithFormError: Story = {
  args: {
    ...Default.args,
    formError: 'Something went wrong. Please try again.',
  },
}

const validationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  startingLevel: z.number().int().min(1).max(25),
})

type ValidationCampaignForm = z.infer<typeof validationSchema>

const validationTabs: TabbedFormTab[] = [
  tabs[0]!,
  {
    id: 'rules',
    label: 'Rules',
    fields: [
      {
        type: 'text',
        name: 'tagline',
        label: 'Tagline',
        required: true,
        hint: 'A short hook shown on the campaign card.',
      },
      ...tabs[1]!.fields,
    ],
  },
  tabs[2]!,
]

/** Identity valid, Rules required field empty — Save shows badge, auto-switch, and summary. */
export const ValidationErrors: StoryObj = {
  render: () => (
    <TabbedForm<ValidationCampaignForm>
      schema={validationSchema}
      tabs={validationTabs}
      onSubmit={action('submit')}
      className="max-w-3xl"
      defaultValues={{ name: 'The Sunless Citadel', tagline: '', startingLevel: 1 }}
      footer={<FormSaveFooter submitLabel="Save changes" />}
    />
  ),
}

const arrayValidationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  features: z.array(
    z.object({
      label: z.string().min(1, 'Label is required'),
    }),
  ),
})

type ArrayValidationForm = z.infer<typeof arrayValidationSchema>

const arrayValidationTabs: TabbedFormTab[] = [
  {
    id: 'identity',
    label: 'Identity',
    fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
  },
  {
    id: 'features',
    label: 'Features',
    fields: [
      {
        kind: 'array',
        name: 'features',
        legend: 'Features',
        addActionLabel: 'Add feature',
        min: 1,
        itemVariant: 'detailed',
        itemCollapsible: true,
        fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
      },
    ],
  },
]

/** Collapsed array item with a nested invalid field — expand keys, badge, and focus ladder. */
export const CollapsedArrayValidation: StoryObj = {
  render: () => (
    <TabbedForm<ArrayValidationForm>
      schema={arrayValidationSchema}
      tabs={arrayValidationTabs}
      onSubmit={action('submit')}
      className="max-w-3xl"
      defaultValues={{ name: 'Valid name', features: [{ label: '' }] }}
      footer={<FormSaveFooter submitLabel="Save changes" />}
    />
  ),
}
