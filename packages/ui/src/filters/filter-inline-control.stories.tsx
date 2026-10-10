import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ClassReferenceTable } from '../stories/semantic-classes/class-reference-table'
import { semanticClassSelectArgType } from '../stories/semantic-classes/semantic-class-arg-types.lib'
import { Checkbox } from '../components/ui/checkbox.client'
import {
  FILTER_INLINE_APPEARANCE_SPECS,
  UI_FILTER_INLINE_SHELL_CLASS,
} from '../components/ui/field-control.styles'
import { FilterInlineControl } from './filter-inline-control.client'
import { filterInlineControlVariants } from './filter-inline-control.variants'

function CheckboxFieldDemo({ variant = 'outline' }: { variant?: 'outline' | 'ghost' }) {
  const [checked, setChecked] = useState(false)
  return (
    <FilterInlineControl variant={variant}>
      <Checkbox
        id={`has-spellcasting-${variant}`}
        checked={checked}
        onCheckedChange={(value) => setChecked(value === true)}
      />
      <label htmlFor={`has-spellcasting-${variant}`} className="text-xs font-medium">
        Has Spellcasting
      </label>
    </FilterInlineControl>
  )
}

const meta = {
  title: 'Filters/FilterInlineControl',
  component: FilterInlineControl,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_FILTER_INLINE_SHELL_CLASS} pairs with filter outline/ghost appearance modifiers in field-control.css.`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'ghost'],
      ...semanticClassSelectArgType(
        FILTER_INLINE_APPEARANCE_SPECS.map((spec) => ({
          value: spec.appearance,
          className: spec.className,
        })),
        'variant',
      ),
    },
  },
} satisfies Meta<typeof FilterInlineControl>

export default meta

type Story = StoryObj<typeof meta>

export const CheckboxField: Story = {
  render: () => <CheckboxFieldDemo />,
  args: {
    children: null,
  },
}

export const GhostShell: Story = {
  render: () => <CheckboxFieldDemo variant="ghost" />,
  args: {
    children: null,
  },
}

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={FILTER_INLINE_APPEARANCE_SPECS.map((spec) => ({
        key: spec.appearance,
        sample: (
          <FilterInlineControl variant={spec.appearance} data-semantic-class-target>
            <Checkbox id={`ref-${spec.appearance}`} />
            <label htmlFor={`ref-${spec.appearance}`} className="text-xs font-medium">
              Filter
            </label>
          </FilterInlineControl>
        ),
        propsLabel: `variant="${spec.appearance}"`,
        className: filterInlineControlVariants({ variant: spec.appearance, size: 'sm' }),
        keyValues: '',
        useCase: spec.useCase,
      }))}
    />
  ),
}
