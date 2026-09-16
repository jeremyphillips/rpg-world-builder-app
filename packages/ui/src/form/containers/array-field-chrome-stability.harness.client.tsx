'use client'

import * as React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '../../lib/utils'
import type { FormItem } from '../field-config'
import { Form } from '../shells/form.client'
import {
  chromeVerticalDelta,
  isChromeAlignedToControlTrack,
  queryChromeCenterY,
  queryControlTopByFieldName,
} from '../renderers/array/array-item-anatomy-grid-prototype.lib'

const movementModeOptions = [
  { value: 'walk', label: 'Walk' },
  { value: 'fly', label: 'Fly' },
  { value: 'swim', label: 'Swim' },
]

const movementFeetOptions = [
  { value: '30', label: '30' },
  { value: '60', label: '60' },
]

export const movementChromeStabilitySchema = z.object({
  movement: z.array(
    z.object({
      mode: z.string(),
      feet: z.coerce.number(),
    }),
  ),
})

export type MovementChromeStabilityValues = z.infer<typeof movementChromeStabilitySchema>

export const movementChromeStabilityFields: FormItem[] = [
  {
    kind: 'array',
    name: 'movement',
    legend: 'Movement',
    addAction: { label: 'Add movement', layout: 'inline', size: 'sm' },
    min: 1,
    item: {
      variant: 'compact',
      headerVisibility: 'hidden',
      reorder: 'dragHandle',
      header: {
        fallback: (index) => `Movement ${index + 1}`,
        primaryField: 'mode',
      },
    },
    fields: [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'mode',
            label: 'Mode',
            required: true,
            options: movementModeOptions,
            defaultValue: 'walk',
            width: 'md',
          },
          {
            type: 'joinedPair',
            label: 'Speed',
            required: true,
            start: {
              kind: 'select',
              name: 'feet',
              options: movementFeetOptions,
              defaultValue: 30,
              digits: 3,
              ariaLabel: 'Speed value',
            },
            end: {
              kind: 'label',
              text: 'ft.',
              ariaLabel: 'Speed unit',
            },
          },
        ],
      },
    ],
  },
]

export const examplesUnlabeledInlineFields: FormItem[] = [
  {
    kind: 'array',
    name: 'examples',
    legend: 'Examples',
    item: {
      variant: 'compact',
      headerVisibility: 'hidden',
      reorder: 'dragHandle',
      header: {
        fallback: (index) => `Example ${index + 1}`,
        primaryField: 'value',
      },
    },
    fields: [
      {
        kind: 'row',
        fields: [{ type: 'text', name: 'value', label: '', placeholder: 'Example…' }],
      },
    ],
    addAction: { label: 'Add example' },
  },
]

type MovementStabilityStep = 'clean' | 'speedError' | 'multilineError' | 'clear'

const MOVEMENT_STABILITY_STEPS: { id: MovementStabilityStep; label: string }[] = [
  { id: 'clean', label: '1. Valid' },
  { id: 'speedError', label: '2. Speed error' },
  { id: 'multilineError', label: '3. Multiline error' },
  { id: 'clear', label: '4. Clear' },
]

function resolveMovementFeetError(step: MovementStabilityStep): string | undefined {
  if (step === 'speedError') return 'Speed is required.'
  if (step === 'multilineError') {
    return 'Speed must be a positive whole number and cannot exceed the species movement cap for this mode.'
  }
  return undefined
}

function MovementFeetErrorSync({
  form,
  step,
}: {
  form: UseFormReturn<MovementChromeStabilityValues>
  step: MovementStabilityStep
}) {
  React.useEffect(() => {
    form.clearErrors('movement.0.feet')
    const message = resolveMovementFeetError(step)
    if (message) {
      form.setError('movement.0.feet', { type: 'manual', message })
    }
  }, [form, step])

  return null
}

function MovementChromeProbeReadout({ revision }: { revision: string }) {
  const [readout, setReadout] = React.useState(() => ({
    controlTop: null as number | null,
    gripDelta: null as number | null,
    actionsDelta: null as number | null,
    controlTrackAligned: false,
  }))

  React.useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const mergedProbe = {
        controlTop: queryControlTopByFieldName('movement.0.mode'),
        gripCenterY: queryChromeCenterY('[data-array-item-anatomy-grip] button'),
        actionsCenterY: queryChromeCenterY('[data-array-item-anatomy-actions] button'),
      }
      const delta = chromeVerticalDelta(mergedProbe)
      setReadout({
        controlTop: mergedProbe.controlTop,
        gripDelta: delta.gripDelta,
        actionsDelta: delta.actionsDelta,
        controlTrackAligned: isChromeAlignedToControlTrack(mergedProbe),
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [revision])

  return (
    <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
      <span>
        mode control top: {readout.controlTop ?? '—'}px · grip Δ: {readout.gripDelta ?? '—'}px ·
        actions Δ: {readout.actionsDelta ?? '—'}px
      </span>
      <span className="text-foreground/80">
        Invariant: grip/actions stay control-track anchored; Δ from control top should not drift
        when the message track grows (steps 2–3).
      </span>
      <span className={readout.controlTrackAligned ? 'text-success' : 'text-muted-foreground'}>
        control-track aligned: {readout.controlTrackAligned ? 'yes' : '—'}
      </span>
    </div>
  )
}

/** Interactive movement checkpoint — mirrors species movement inline rows. */
export function MovementChromeStabilityHarness() {
  const [step, setStep] = React.useState<MovementStabilityStep>('clean')

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Species movement shape: hidden item header, mode + speed inline row, drag handle and remove
        on the shared anatomy grid. Step through validation growth — grip and delete should stay
        anchored to the control track.
      </p>
      <div className="flex flex-wrap gap-2">
        {MOVEMENT_STABILITY_STEPS.map((item) => (
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
      <MovementChromeProbeReadout revision={step} />
      <Form<MovementChromeStabilityValues>
        id="movement-chrome-stability"
        schema={movementChromeStabilitySchema}
        fields={movementChromeStabilityFields}
        defaultValues={{ movement: [{ mode: 'walk', feet: 30 }] }}
        onSubmit={() => undefined}
        header={(form) => <MovementFeetErrorSync form={form} step={step} />}
        className="max-w-2xl"
      />
    </div>
  )
}

/** Examples-like unlabeled single-input compact inline row — valid baseline. */
export function ExamplesUnlabeledInlineHarness() {
  const examplesSchema = z.object({
    examples: z.array(z.object({ value: z.string() })),
  })

  return (
    <Form<z.infer<typeof examplesSchema>>
      id="examples-unlabeled-inline"
      schema={examplesSchema}
      fields={examplesUnlabeledInlineFields}
      defaultValues={{ examples: [{ value: '' }] }}
      onSubmit={() => undefined}
      className="max-w-lg"
    />
  )
}
