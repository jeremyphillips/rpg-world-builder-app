import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { TabbedForm } from './tabbed-form.client'
import type { TabbedFormTab } from './tabbed-form.client'
import { CardFooter } from '../components/ui/card'
import { SubmitButton } from '../components/ui/submit-button'

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
    className: 'max-w-2xl',
    footer: (
      <CardFooter className="justify-end px-0">
        <SubmitButton>Save changes</SubmitButton>
      </CardFooter>
    ),
  },
}

export const WithFormError: Story = {
  args: {
    ...Default.args,
    formError: 'Something went wrong. Please try again.',
  },
}
