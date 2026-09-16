'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'
import { Plus } from 'lucide-react'

import { Button } from '../../components/ui/button.client'
import { ArrayLegendIssueLink } from '../renderers/array/array-item-issue.client'
import { FormSectionHeader } from './form-section-header.client'

const addAction = (
  <Button type="button" variant="outline" size="sm">
    <Plus aria-hidden />
    Add item
  </Button>
)

const meta = {
  title: 'Form/FormSectionHeader',
  component: FormSectionHeader,
  parameters: { layout: 'padded' },
  args: {
    label: 'Tables',
    tier: 'subsection',
  },
} satisfies Meta<typeof FormSectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const NoHintWithAction: Story = {
  args: {
    action: addAction,
  },
}

export const OneLineHintWithAction: Story = {
  args: {
    hint: 'Tables provide level-based values referenced by this feature.',
    action: addAction,
  },
}

export const TwoLineHintWithAction: Story = {
  args: {
    hint: 'Tables provide level-based values referenced by this feature. Each table defines columns and level breakpoints used by grants and other mechanics in this feature.',
    action: addAction,
  },
}

export const IssueAccessoryWithHintAndAction: Story = {
  args: {
    hint: 'Add the mechanical effects this feature provides.',
    action: addAction,
    labelPresentation: 'field-label',
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
  decorators: [
    (Story) => (
      <fieldset className="border-0 p-0">
        <legend className="mb-1.5 text-md font-field-label leading-none text-foreground">
          <Story />
        </legend>
      </fieldset>
    ),
  ],
}
