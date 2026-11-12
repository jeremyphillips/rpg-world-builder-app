import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'
import { useState } from 'react'

import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { TextareaField } from './textarea-field'
import { OptionalFieldDisclosure } from './optional-field-disclosure.client'

const meta = {
  title: 'Components/OptionalFieldDisclosure',
  component: OptionalFieldDisclosure,
  parameters: { layout: 'padded' },
  args: {
    controlId: 'story-note',
    fieldLabel: 'Additional behavior',
    addLabel: 'Add additional behavior',
    removeLabel: 'Remove',
    open: false,
    onOpenChange: action('onOpenChange'),
    onRemove: action('onRemove'),
    size: 'sm',
    children: null,
  },
} satisfies Meta<typeof OptionalFieldDisclosure>

export default meta
type Story = StoryObj<typeof meta>

function DisclosureDemo({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue)
  const [manualOpen, setManualOpen] = useState(false)
  const hasValue = Boolean(value.trim())
  const open = manualOpen || hasValue

  return (
    <OptionalFieldDisclosure
      controlId="story-note"
      fieldLabel="Additional behavior"
      addLabel="Add additional behavior"
      removeLabel="Remove"
      open={open}
      onOpenChange={setManualOpen}
      onRemove={() => {
        setValue('')
        setManualOpen(false)
        action('onRemove')()
      }}
      size="sm"
    >
      <TextareaField
        id="story-note"
        label=""
        aria-label="Additional behavior"
        placeholder="Describe behavior not modeled above..."
        rows={3}
        width="full"
        size="sm"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </OptionalFieldDisclosure>
  )
}

export const Collapsed: Story = {
  render: () => <DisclosureDemo />,
}

export const Populated: Story = {
  render: () => (
    <DisclosureDemo initialValue="Targets cannot regain Hit Points until the start of your next turn." />
  ),
}

export const OpenInAnatomyRowWithMessage: Story = {
  render: () => (
    <div className="max-w-xl">
      <FieldRowAnatomyProvider>
        <OptionalFieldDisclosure
          controlId="story-long-range"
          fieldLabel="Long range"
          addLabel="Add long range"
          removeLabel="Remove"
          open
          onOpenChange={action('onOpenChange')}
          onRemove={action('onRemove')}
          size="md"
          message={
            <p id="story-long-range-hint" className="text-style-caption min-w-0">
              Disadvantage beyond normal range.
            </p>
          }
        >
          <TextareaField
            id="story-long-range"
            label=""
            aria-label="Long range"
            rows={1}
            width="full"
            size="md"
            value="240"
            onChange={action('onChange')}
          />
        </OptionalFieldDisclosure>
      </FieldRowAnatomyProvider>
    </div>
  ),
}
