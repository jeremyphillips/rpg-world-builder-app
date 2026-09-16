'use client'

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '../../lib/utils'
import type { FormItem } from '../field-config'
import { Form } from '../shells/form.client'
import { queryControlTopByFieldName } from '../renderers/array/array-item-anatomy-track-probe.lib'

const spellcastingRowSchema = z.object({
  spellAbility: z.string(),
  alwaysPrepared: z.boolean(),
})

type SpellcastingRowValues = z.infer<typeof spellcastingRowSchema>

type ToggleMatrixStep = 'clean' | 'hint' | 'error' | 'multilineError' | 'clear'

const TOGGLE_MATRIX_STEPS: { id: ToggleMatrixStep; label: string }[] = [
  { id: 'clean', label: '1. Select + checkbox' },
  { id: 'hint', label: '2. Checkbox hint' },
  { id: 'error', label: '3. Checkbox error' },
  { id: 'multilineError', label: '4. Multiline select error' },
  { id: 'clear', label: '5. Clear' },
]

function resolveToggleMatrixMessages(step: ToggleMatrixStep): {
  checkboxHint?: string
  checkboxError?: string
  selectError?: string
} {
  switch (step) {
    case 'hint':
      return { checkboxHint: 'Prepared spells do not count against prepared limits.' }
    case 'error':
      return { checkboxError: 'Choose whether this spell is always prepared.' }
    case 'multilineError':
      return {
        selectError:
          'Spellcasting ability is required and must match a spell list the grant can cast from.',
      }
    default:
      return {}
  }
}

function ToggleMatrixFieldSync({
  form,
  step,
}: {
  form: UseFormReturn<SpellcastingRowValues>
  step: ToggleMatrixStep
}) {
  const messages = resolveToggleMatrixMessages(step)

  React.useEffect(() => {
    form.clearErrors(['spellAbility', 'alwaysPrepared'])
    if (messages.selectError) {
      form.setError('spellAbility', { type: 'manual', message: messages.selectError })
    }
    if (messages.checkboxError) {
      form.setError('alwaysPrepared', { type: 'manual', message: messages.checkboxError })
    }
  }, [form, messages.checkboxError, messages.selectError])

  return null
}

function ToggleControlTopProbe({ revision }: { revision: string }) {
  const [readout, setReadout] = React.useState<{
    selectTop: number | null
    checkboxTop: number | null
  }>(() => ({ selectTop: null, checkboxTop: null }))

  React.useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      setReadout({
        selectTop: queryControlTopByFieldName('spellAbility'),
        checkboxTop: queryControlTopByFieldName('alwaysPrepared'),
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [revision])

  const aligned =
    readout.selectTop != null &&
    readout.checkboxTop != null &&
    readout.selectTop === readout.checkboxTop

  return (
    <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
      <span>
        select control top: {readout.selectTop ?? '—'}px · checkbox control top:{' '}
        {readout.checkboxTop ?? '—'}px
      </span>
      <span className={aligned ? 'text-success' : 'text-foreground/80'}>
        Invariant: control tops stay equal — hints/errors grow the message track only.
      </span>
    </div>
  )
}

function ToggleMatrixHarness() {
  const [step, setStep] = React.useState<ToggleMatrixStep>('clean')
  const messages = resolveToggleMatrixMessages(step)

  const fieldsWithHint: FormItem[] = [
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'spellAbility',
          label: 'Spellcasting ability',
          options: [
            { value: 'int', label: 'Intelligence' },
            { value: 'wis', label: 'Wisdom' },
            { value: 'cha', label: 'Charisma' },
          ],
          defaultValue: 'int',
          width: '1/3',
        },
        {
          type: 'checkbox',
          name: 'alwaysPrepared',
          label: 'Always prepared',
          defaultValue: false,
          hint: messages.checkboxHint,
        },
      ],
    },
  ]

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Grant spellcasting row shape on the anatomy grid — stacked select beside inline checkbox.
        Step through hint and error growth; sibling control bands must not drift.
      </p>
      <div className="flex flex-wrap gap-2">
        {TOGGLE_MATRIX_STEPS.map((item) => (
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
      <ToggleControlTopProbe revision={`${step}:${messages.checkboxHint ?? ''}`} />
      <Form<SpellcastingRowValues>
        id="anatomy-row-toggle-matrix"
        schema={spellcastingRowSchema}
        fields={fieldsWithHint}
        defaultValues={{ spellAbility: 'int', alwaysPrepared: false }}
        onSubmit={() => undefined}
        header={(form) => <ToggleMatrixFieldSync form={form} step={step} />}
        className="max-w-3xl"
      />
    </div>
  )
}

const meta = {
  title: 'Internal/Forms/Layout/AnatomyRowToggleMatrix',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Regression matrix for anatomy-row inline toggles beside stacked selects — hint/error growth must stay in the message track.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

/** Interactive spellcasting row checkpoint — select + checkbox hint/error matrix. */
export const SpellcastingToggleMatrix: Story = {
  render: () => <ToggleMatrixHarness />,
}
