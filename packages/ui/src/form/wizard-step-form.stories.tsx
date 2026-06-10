import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { z } from 'zod'

import { Wizard, WizardFooter, useWizard, type WizardStepDef } from '../components/ui/wizard.client'
import { WizardStepForm } from './wizard-step-form.client'
import type { FormItem } from './field-config'

const meta = {
  title: 'Forms/WizardStepForm',
  component: WizardStepForm,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WizardStepForm>

export default meta

const identitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

const identityFields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', placeholder: 'Adventurer name', required: true },
  { type: 'textarea', name: 'description', label: 'Description', rows: 2 },
]

const detailsSchema = z.object({
  role: z.string().min(1, 'Role is required'),
})

const detailsFields: FormItem[] = [
  {
    type: 'select',
    name: 'role',
    label: 'Role',
    required: true,
    options: [
      { value: 'dm', label: 'Dungeon Master' },
      { value: 'pc', label: 'Player Character' },
    ],
  },
]

function ReviewStep() {
  const { accumulatedValues, complete, isCompleting } = useWizard()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void complete()
      }}
    >
      <dl className="space-y-2 text-sm">
        {Object.entries(accumulatedValues).map(([key, val]) => (
          <div key={key} className="flex gap-2">
            <dt className="font-medium capitalize text-muted-foreground">{key}:</dt>
            <dd>{String(val)}</dd>
          </div>
        ))}
      </dl>
      <WizardFooter submitLabel="Finish" isSubmitting={isCompleting} />
    </form>
  )
}

const STEPS: WizardStepDef[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'details', label: 'Details' },
  { id: 'review', label: 'Review' },
]

/**
 * Two schema-driven steps plus a review step. Go forward then Back — the
 * step's values are restored from the wizard's accumulated state.
 */
export const Default: StoryObj = {
  render: () => {
    const [completed, setCompleted] = useState<Record<string, unknown> | null>(null)

    if (completed) {
      return <p className="text-sm text-muted-foreground">Submitted: {JSON.stringify(completed)}</p>
    }

    return (
      <Wizard steps={STEPS} onComplete={setCompleted}>
        <WizardStepForm schema={identitySchema} fields={identityFields} />
        <WizardStepForm schema={detailsSchema} fields={detailsFields} />
        <ReviewStep />
      </Wizard>
    )
  },
}
