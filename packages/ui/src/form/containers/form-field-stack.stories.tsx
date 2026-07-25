import { useId } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '../../components/ui/button.client'
import { Modal } from '../../components/ui/modal.client'
import type { FormItem } from '../field-config'
import { FormFieldStack } from './form-field-stack.client'

const fields: FormItem[] = [
  { type: 'text', name: 'title', label: 'Title', width: 'full' },
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    width: 'full',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
  },
]

const meta: Meta = {
  title: 'Form/FormFieldStack',
  parameters: { layout: 'centered' },
}

export default meta

type Story = StoryObj

function DetachedFormModalDemo() {
  const formId = useId()
  const form = useForm({ defaultValues: { title: '', status: 'draft' } })

  return (
    <Modal.Root defaultOpen>
      <Modal.Content size="md">
        <Modal.Header headline="Detached form" description="Actions live in Modal.Footer." />
        <Modal.Body>
          <FormProvider {...form}>
            <FormFieldStack fields={fields} idPrefix={formId} rhythm="comfortable" size="md">
              <p className="mt-6 text-sm text-muted-foreground">
                Preview or helper copy can sit in the children slot.
              </p>
            </FormFieldStack>
          </FormProvider>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="button">Apply</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

export const ModalDetachedForm: Story = {
  render: () => <DetachedFormModalDemo />,
}
