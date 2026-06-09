import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Wizard, WizardFooter, useWizard, type WizardStepDef } from './wizard.client'

const meta = {
  title: 'Primitives/Wizard',
  component: Wizard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Wizard>

export default meta

// ---------------------------------------------------------------------------
// Shared step components for the stories
// ---------------------------------------------------------------------------

function NameStep() {
  const { completeStep } = useWizard()
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        completeStep({ name: value })
      }}
    >
      <label htmlFor="wiz-name" className="block text-sm font-medium">
        Your name
      </label>
      <input
        id="wiz-name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        required
      />
      <WizardFooter isValid={value.trim().length > 0} />
    </form>
  )
}

function RoleStep() {
  const { completeStep } = useWizard()
  const [value, setValue] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        completeStep({ role: value })
      }}
    >
      <label htmlFor="wiz-role" className="block text-sm font-medium">
        Your role
      </label>
      <input
        id="wiz-role"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        required
      />
      <WizardFooter isValid={value.trim().length > 0} />
    </form>
  )
}

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

const THREE_STEPS: WizardStepDef[] = [
  { id: 'name', label: 'Name' },
  { id: 'role', label: 'Role' },
  { id: 'review', label: 'Review' },
]

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — starts on step 1. */
export const Default: StoryObj = {
  render: () => {
    const [completed, setCompleted] = useState<Record<string, unknown> | null>(null)

    if (completed) {
      return <p className="text-sm text-muted-foreground">Submitted: {JSON.stringify(completed)}</p>
    }

    return (
      <Wizard
        steps={THREE_STEPS}
        onComplete={setCompleted}
        hint="This is an optional hint shown beneath the step nav."
      >
        <NameStep />
        <RoleStep />
        <ReviewStep />
      </Wizard>
    )
  },
}

/** Mid-flow — illustrates the step nav when a step is already complete. */
export const Midway: StoryObj = {
  render: () => {
    const [completed, setCompleted] = useState<Record<string, unknown> | null>(null)
    // Render a pre-initialised Wizard at step 2 using a controlled key trick
    return completed ? (
      <p className="text-sm text-muted-foreground">Done</p>
    ) : (
      <Wizard steps={THREE_STEPS} onComplete={setCompleted}>
        <NameStep />
        <RoleStep />
        <ReviewStep />
      </Wizard>
    )
  },
}

/** Four-step variant — shows a longer step nav. */
export const FourSteps: StoryObj = {
  render: () => {
    const steps: WizardStepDef[] = [
      { id: 'a', label: 'Identity' },
      { id: 'b', label: 'Rules' },
      { id: 'c', label: 'Flavor' },
      { id: 'd', label: 'Review' },
    ]
    return (
      <Wizard steps={steps} onComplete={() => undefined}>
        <NameStep />
        <RoleStep />
        <NameStep />
        <ReviewStep />
      </Wizard>
    )
  },
}
