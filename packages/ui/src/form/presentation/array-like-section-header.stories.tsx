'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'

import { Button } from '../../components/ui/button.client'
import { ArrayLegendIssueLink } from '../renderers/array/array-item-issue.client'
import { ArrayLikeSectionHeader } from './array-like-section-header.client'

const addAction = (
  <Button type="button" variant="outline" size="sm">
    <Plus aria-hidden />
    Add grant
  </Button>
)

const meta = {
  title: 'Form/ArrayLikeSectionHeader',
  component: ArrayLikeSectionHeader,
  parameters: { layout: 'padded' },
  args: {
    label: 'Grants',
    hint: 'Add the mechanical effects this feature provides.',
    size: 'md',
  },
  decorators: [
    (Story) => (
      <fieldset className="border-0 p-0">
        <Story />
      </fieldset>
    ),
  ],
} satisfies Meta<typeof ArrayLikeSectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const LegendWithInlineAction: Story = {
  args: {
    action: addAction,
  },
}

export const LegendWithIssueAccessory: Story = {
  args: {
    action: addAction,
    labelAccessory: (
      <ArrayLegendIssueLink
        issueCount={2}
        invalidRowCount={1}
        hasContainerIssue={false}
        sectionLabel="Grants"
        onPress={() => undefined}
      />
    ),
  },
}

export const StandaloneSection: Story = {
  args: {
    label: 'Tables',
    hint: 'Tables provide level-based values referenced by this feature.',
    wrapper: 'none',
    id: 'feature-tables-section-heading',
    action: (
      <Button type="button" variant="outline" size="sm">
        <Plus aria-hidden />
        Add table
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <section className="flex flex-col gap-2" aria-labelledby="feature-tables-section-heading">
        <Story />
      </section>
    ),
  ],
}
