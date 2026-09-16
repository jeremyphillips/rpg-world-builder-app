'use client'

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { Input } from './input.client'
import { resolveFieldRowAnatomyPrototypePresentation } from './field-row-anatomy-prototype.variants'
import { cn } from '../../lib/utils'

/**
 * Minimal architectural checkpoint for three-region subgrid row alignment.
 * Not production FieldRow — validates that sibling controls stay aligned while
 * hints/errors grow the message track and wrapping labels grow the shared label track.
 */

type PrototypeFieldProps = {
  id: string
  label?: React.ReactNode
  hint?: string
  error?: string
  placeholder?: string
  defaultValue?: string
  wrapLabel?: boolean
}

function PrototypeField({
  id,
  label,
  hint,
  error,
  placeholder,
  defaultValue,
  wrapLabel,
}: PrototypeFieldProps) {
  const labelNode = label ? (
    wrapLabel ? (
      <Field.Label className="max-w-[9rem] whitespace-normal">{label}</Field.Label>
    ) : (
      <Field.Label>{label}</Field.Label>
    )
  ) : null

  return (
    <Field.Root
      id={id}
      hint={hint}
      hintPosition={hint ? 'below-control' : undefined}
      error={error}
      anatomy
      rowParticipation
    >
      <FieldLayout
        hintPosition={hint ? 'below-control' : 'below-label'}
        label={labelNode}
        control={<Input placeholder={placeholder} defaultValue={defaultValue} />}
      />
    </Field.Root>
  )
}

function AnatomyPrototypeRow({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  // Equal flexible columns — alignment prototype is not a width-parity fixture.
  const presentation = resolveFieldRowAnatomyPrototypePresentation(['full', 'full'])
  return (
    <div
      data-field-row-anatomy-prototype=""
      className={cn(presentation.className, className)}
      style={presentation.style}
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'Internal/Forms/Layout/FieldRowAnatomyPrototype',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Architectural checkpoint: CSS subgrid aligns label / control / message regions across sibling fields. Not wired to schema FieldRow yet.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

/** Labeled field beside an unlabeled control — controls share the control track. */
export const LabelPlusUnlabeled: Story = {
  render: () => (
    <AnatomyPrototypeRow>
      <PrototypeField id="a" label="Character name" placeholder="Tasha" />
      <PrototypeField id="b" placeholder="No label" />
    </AnatomyPrototypeRow>
  ),
}

/** Below-control hint on A only — B's control must not move. */
export const HintOnLeft: Story = {
  render: () => (
    <AnatomyPrototypeRow>
      <PrototypeField
        id="a"
        label="Character name"
        hint="Shown to other players on the campaign roster."
        placeholder="Tasha"
      />
      <PrototypeField id="b" label="Title" placeholder="Archmage" />
    </AnatomyPrototypeRow>
  ),
}

/** Validation on B only — A's control must not move. */
export const ErrorOnRight: Story = {
  render: () => (
    <AnatomyPrototypeRow>
      <PrototypeField id="a" label="Character name" placeholder="Tasha" />
      <PrototypeField id="b" label="Title" error="Title is required." placeholder="Archmage" />
    </AnatomyPrototypeRow>
  ),
}

/** Multi-line wrapped label on A — both controls drop together with the shared label track. */
export const WrappedLabel: Story = {
  render: () => (
    <AnatomyPrototypeRow>
      <PrototypeField
        id="a"
        label="Very long character display name that wraps"
        wrapLabel
        placeholder="Tasha"
      />
      <PrototypeField id="b" label="Title" placeholder="Archmage" />
    </AnatomyPrototypeRow>
  ),
}

type StabilityStep = 'clean' | 'hintA' | 'errorB' | 'multilineErrorB' | 'wrappedLabelA' | 'clear'

const STABILITY_STEPS: { id: StabilityStep; label: string }[] = [
  { id: 'clean', label: '1. Clean' },
  { id: 'hintA', label: '2. Hint on A' },
  { id: 'errorB', label: '3. Error on B' },
  { id: 'multilineErrorB', label: '4. Multiline error on B' },
  { id: 'wrappedLabelA', label: '5. Wrapped label on A' },
  { id: 'clear', label: '6. Clear' },
]

function ControlTopProbe({ fieldId, revision }: { fieldId: string; revision: string }) {
  const [top, setTop] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    const input = document.getElementById(fieldId)
    const control = input
      ?.closest('[data-field-anatomy]')
      ?.querySelector('[data-field-control-region]')
    const frame = requestAnimationFrame(() => {
      if (!control) {
        setTop((prev) => (prev === null ? prev : null))
        return
      }
      const next = Math.round(control.getBoundingClientRect().top)
      setTop((prev) => (prev === next ? prev : next))
    })
    return () => cancelAnimationFrame(frame)
  }, [fieldId, revision])

  return (
    <span className="font-mono text-xs text-muted-foreground">
      {fieldId} control top: {top ?? '—'}px
    </span>
  )
}

function StabilitySequenceHarness() {
  const [step, setStep] = React.useState<StabilityStep>('clean')

  const hintA =
    step === 'hintA' || step === 'errorB' || step === 'multilineErrorB'
      ? 'Shown to other players.'
      : undefined
  const errorB =
    step === 'errorB'
      ? 'Title is required.'
      : step === 'multilineErrorB'
        ? 'Title is required and must be unique within this campaign roster listing.'
        : undefined
  const wrapA = step === 'wrappedLabelA'
  const labelA = wrapA ? 'Very long character display name that wraps' : 'Character name'

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Invariant: control top edges move only when the shared label track grows (step 5). Hints and
        errors must not move sibling controls.
      </p>
      <div className="flex flex-wrap gap-2">
        {STABILITY_STEPS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'rounded-md border px-2.5 py-1 text-sm',
              step === item.id
                ? 'border-foreground bg-muted text-foreground'
                : 'border-border text-muted-foreground',
            )}
            onClick={() => setStep(item.id === 'clear' ? 'clean' : item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-6">
        <ControlTopProbe fieldId="probe-a" revision={step} />
        <ControlTopProbe fieldId="probe-b" revision={step} />
      </div>
      <AnatomyPrototypeRow>
        <PrototypeField
          id="probe-a"
          label={labelA}
          wrapLabel={wrapA}
          hint={hintA}
          placeholder="Tasha"
        />
        <PrototypeField id="probe-b" label="Title" error={errorB} placeholder="Archmage" />
      </AnatomyPrototypeRow>
    </div>
  )
}

/**
 * Interactive checkpoint: step through hint → error → multiline error → wrapped label → clear.
 * Read the control-top probes — they should stay equal except when the label track grows.
 */
export const StabilitySequence: Story = {
  render: () => <StabilitySequenceHarness />,
}
