'use client'
import { Icon } from '../../components/ui/icon/icon'

import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../../components/ui/button.client'
import { fieldAnatomyStackVariants } from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import { FormField } from '../../components/ui/form-field'
import { Input } from '../../components/ui/input.client'
import { ArrayLegendIssueLink } from '../renderers/array/array-item-issue.client'
import { ArrayLikeSectionHeader } from './array-like-section-header.client'

const addAction = (
  <Button type="button" variant="outline" size="sm">
    <Icon name="plus" size="2xl" />
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
    (Story, context) => (
      <fieldset
        className={cn(
          'border-0 p-0',
          fieldAnatomyStackVariants({ size: context.args.size ?? 'md' }),
        )}
      >
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
        <Icon name="plus" size="2xl" />
        Add table
      </Button>
    ),
  },
  decorators: [
    (Story, context) => (
      <section
        className={cn('min-w-0', fieldAnatomyStackVariants({ size: context.args.size ?? 'md' }))}
        aria-labelledby="feature-tables-section-heading"
      >
        <Story />
      </section>
    ),
  ],
}

/** Visual parity check — array legend header vs an equivalent leaf field label + hint. */
export const LeafFieldTypographyParity: Story = {
  args: {
    label: 'Grants',
    hint: 'Add the mechanical effects this feature provides.',
    size: 'md',
  },
  render: () => (
    <div className="grid max-w-xl gap-8 md:grid-cols-2">
      <fieldset className={cn('border-0 p-0', fieldAnatomyStackVariants({ size: 'md' }))}>
        <ArrayLikeSectionHeader
          label="Grants"
          hint="Add the mechanical effects this feature provides."
          size="md"
        />
      </fieldset>
      <FormField
        id="grants-parity"
        label="Grants"
        hint="Add the mechanical effects this feature provides."
        size="md"
      >
        <Input id="grants-parity" readOnly value="" aria-hidden />
      </FormField>
    </div>
  ),
}
