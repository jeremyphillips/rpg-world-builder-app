import type { Meta, StoryObj } from '@storybook/react-vite'

import { ClassReferenceTable } from '../../stories/semantic-classes/class-reference-table'
import { semanticClassSelectArgType } from '../../stories/semantic-classes/semantic-class-arg-types.lib'
import { Textarea } from './textarea.client'
import { textareaVariants } from './field-control.variants'
import {
  FIELD_CONTROL_MULTILINE_SIZE_SPECS,
  UI_FIELD_CONTROL_BLOCK_CLASS,
} from './field-control.styles'

const meta = {
  title: 'Forms/Controls/Textarea',
  component: Textarea,
  parameters: {
    semanticClasses: true,
    docs: {
      description: {
        component: `${UI_FIELD_CONTROL_BLOCK_CLASS} multiline modifiers set min-height and padding in CSS.`,
      },
    },
  },
  args: {
    'aria-label': 'Notes',
    placeholder: 'Write something…',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      ...semanticClassSelectArgType(
        FIELD_CONTROL_MULTILINE_SIZE_SPECS.map((spec) => ({
          value: spec.size,
          className: spec.className,
        })),
        'size',
      ),
    },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = { args: { size: 'sm' } }

export const Large: Story = { args: { size: 'lg' } }

export const Error: Story = {
  args: { 'aria-invalid': true, defaultValue: 'Oops' },
}

export const Disabled: Story = { args: { disabled: true, defaultValue: 'Read only' } }

export const ClassReference: Story = {
  tags: ['control-parity'],
  parameters: { semanticClasses: true },
  render: () => (
    <ClassReferenceTable
      rows={FIELD_CONTROL_MULTILINE_SIZE_SPECS.map((spec) => ({
        key: spec.size,
        sample: (
          <Textarea
            size={spec.size}
            aria-label={`${spec.size} textarea`}
            placeholder="Sample"
            data-semantic-class-target
          />
        ),
        propsLabel: `size="${spec.size}"`,
        className: textareaVariants({ size: spec.size }),
        keyValues: `min height: ${spec.minHeight}`,
        useCase: spec.useCase,
      }))}
    />
  ),
}
