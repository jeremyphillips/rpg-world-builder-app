import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm, type Control, type FieldValues } from 'react-hook-form'

import { FieldGroup } from './field-group'
import { SwitchField } from './switch-field'

const meta = {
  title: 'Forms/Layout/FieldGroupDialogDisclosure',
  component: FieldGroup,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldGroup>

export default meta
type Story = StoryObj<typeof meta>

function DialogDisclosureStory() {
  const form = useForm({ defaultValues: { available: true } })

  return (
    <FormProvider {...form}>
      <FieldGroup
        id="access-dialog-story"
        legend="Campaign availability"
        formControl={form.control as unknown as Control<FieldValues>}
        disclosure={{
          variant: 'dialog',
          hint: 'Controls where this content can be discovered and used.',
          dialogHeadline: 'Campaign availability',
          resolveSummary: (values) => ({
            status: {
              label: values.available ? 'Available' : 'Unavailable',
              tone: values.available ? 'success' : 'warning',
              indicator: values.available ? 'dot' : 'inactive',
            },
            detail: 'All players',
          }),
        }}
      >
        <SwitchField id="available" label="Available in this campaign" />
      </FieldGroup>
    </FormProvider>
  )
}

export const Default: Story = {
  args: {
    legend: 'Campaign availability',
    children: null,
  },
  render: () => <DialogDisclosureStory />,
}
