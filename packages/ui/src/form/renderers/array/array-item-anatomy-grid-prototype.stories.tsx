'use client'

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GripVertical, Trash2 } from 'lucide-react'

import { Field } from '../../../components/ui/field.client'
import { FieldLayout } from '../../../components/ui/field-layout'
import { FieldRowAnatomyProvider } from '../../../components/ui/field-row-anatomy.context'
import { Input } from '../../../components/ui/input.client'
import { resolveFieldRowAnatomyPresentation } from '../../../components/ui/field-row-anatomy.variants'
import { cn } from '../../../lib/utils'
import {
  arrayItemCompactGripClasses,
  arrayItemCompactRowClasses,
  buildArrayItemCompactRowGridTemplate,
} from './array-item-toolbar.variants'

import { arrayItemDragHandleClasses } from './array-item-toolbar.variants'
import { ArrayItemAnatomyGrid } from './array-item-anatomy-grid.client'
import {
  chromeContainerVerticalDelta,
  readAnatomyTrackProbe,
} from './array-item-anatomy-grid-prototype.lib'

/**
 * Phase 0 checkpoint — compact array items share **one** label/control/message track
 * system with field columns (subgrid) and container-centered chrome (grip/actions).
 *
 * Chosen composition model: **outer array grid owns tracks; fields participate via subgrid.**
 * Do not ship nested `[grid-template-rows:auto_auto_auto]` shells for the same row.
 */

type PrototypeFieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  placeholder?: string
  wrapLabel?: boolean
  style?: React.CSSProperties
  className?: string
}

function PrototypeParticipantField({
  id,
  label,
  hint,
  error,
  placeholder,
  wrapLabel,
  style,
  className,
}: PrototypeFieldProps) {
  const labelNode = wrapLabel ? (
    <Field.Label className="max-w-[9rem] whitespace-normal">{label}</Field.Label>
  ) : (
    <Field.Label>{label}</Field.Label>
  )

  return (
    <Field.Root
      id={id}
      hint={hint}
      hintPosition={hint ? 'below-control' : undefined}
      error={error}
      anatomy
      rowParticipation
      width="full"
      style={style}
      className={className}
    >
      <FieldLayout
        hintPosition={hint ? 'below-control' : 'below-label'}
        label={labelNode}
        control={<Input id={id} placeholder={placeholder} defaultValue="" aria-label={label} />}
      />
    </Field.Root>
  )
}

function PrototypeChromeGrip() {
  return (
    <button type="button" className={arrayItemDragHandleClasses()} aria-label="Drag to reorder">
      <GripVertical aria-hidden />
    </button>
  )
}

function PrototypeChromeRemove() {
  return (
    <button type="button" className={arrayItemDragHandleClasses()} aria-label="Remove item">
      <Trash2 className="size-4" aria-hidden />
    </button>
  )
}

function TrackProbeReadout({
  controlFieldId,
  revision,
}: {
  controlFieldId: string
  revision: string
}) {
  const [readout, setReadout] = React.useState<{
    gridCenterY: number | null
    delta: ReturnType<typeof chromeContainerVerticalDelta>
  }>(() => ({
    gridCenterY: null,
    delta: { gripDelta: null, actionsDelta: null },
  }))

  React.useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const probe = readAnatomyTrackProbe({ controlFieldId })
      const grid = document.querySelector('[data-array-item-anatomy-grid]')
      const gridRect = grid?.getBoundingClientRect()
      const gridCenterY = gridRect ? Math.round(gridRect.top + gridRect.height / 2) : null
      setReadout({
        gridCenterY,
        delta: chromeContainerVerticalDelta(gridCenterY, probe),
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [controlFieldId, revision])

  const { gridCenterY, delta } = readout

  return (
    <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
      <span>
        grid center: {gridCenterY ?? '—'}px · grip Δ: {delta.gripDelta ?? '—'}px · actions Δ:{' '}
        {delta.actionsDelta ?? '—'}px
      </span>
      <span className="text-foreground/80">
        Invariant: grip/actions Δ from grid center stay near zero (container-vertical center).
      </span>
    </div>
  )
}

const meta = {
  title: 'Internal/Forms/Layout/ArrayItemAnatomyGridPrototype',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Phase 0 shared-track prototype for compact array inline rows. Parent grid owns anatomy tracks; field columns subgrid; grip/actions vertically center in the row cell.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

/** Movement-shaped row — md mode + auto speed + grip/actions on shared tracks. */
export const MovementLikeRow: Story = {
  render: () => (
    <div
      data-prototype-container=""
      className="max-w-2xl rounded-md border border-border bg-card p-4"
    >
      <ArrayItemAnatomyGrid
        fieldWidths={['md', 'auto']}
        grip={<PrototypeChromeGrip />}
        actions={<PrototypeChromeRemove />}
      >
        <PrototypeParticipantField id="movement-mode" label="Mode" placeholder="Walk" />
        <PrototypeParticipantField id="movement-speed" label="Speed" placeholder="30" />
      </ArrayItemAnatomyGrid>
    </div>
  ),
}

type StabilityStep =
  | 'clean'
  | 'speedError'
  | 'multilineError'
  | 'wrappedModeLabel'
  | 'modeHint'
  | 'clear'

const STABILITY_STEPS: { id: StabilityStep; label: string }[] = [
  { id: 'clean', label: '1. Valid' },
  { id: 'speedError', label: '2. Speed error' },
  { id: 'multilineError', label: '3. Multiline error' },
  { id: 'wrappedModeLabel', label: '4. Wrapped mode label' },
  { id: 'modeHint', label: '5. Hint on mode' },
  { id: 'clear', label: '6. Clear' },
]

function SharedTrackStabilityHarness() {
  const [step, setStep] = React.useState<StabilityStep>('clean')

  const speedError =
    step === 'speedError'
      ? 'Speed is required.'
      : step === 'multilineError'
        ? 'Speed must be a positive whole number and cannot exceed the species movement cap for this mode.'
        : undefined
  const modeHint = step === 'modeHint' ? 'Each mode may only appear once.' : undefined
  const wrapModeLabel = step === 'wrappedModeLabel'
  const modeLabel = wrapModeLabel ? 'Movement mode (very long label that wraps)' : 'Mode'

  return (
    <div className="flex max-w-2xl flex-col gap-4 rounded-md border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        Shared-track model: grip/actions stay vertically centered in the anatomy grid cell.
        Message-track growth (steps 2–3, 5) recenters chrome within the taller cell. Label-track
        growth (step 4) recenters chrome within the taller cell.
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
      <TrackProbeReadout controlFieldId="stability-mode" revision={step} />
      <ArrayItemAnatomyGrid
        fieldWidths={['md', 'auto']}
        grip={<PrototypeChromeGrip />}
        actions={<PrototypeChromeRemove />}
      >
        <PrototypeParticipantField
          id="stability-mode"
          label={modeLabel}
          wrapLabel={wrapModeLabel}
          hint={modeHint}
          placeholder="Walk"
        />
        <PrototypeParticipantField
          id="stability-speed"
          label="Speed"
          error={speedError}
          placeholder="30"
        />
      </ArrayItemAnatomyGrid>
    </div>
  )
}

/** Interactive movement checkpoint — step through error, multiline error, wrapped label, hint. */
export const SharedTrackStabilitySequence: Story = {
  render: () => <SharedTrackStabilityHarness />,
}

/**
 * Contrasts the broken parallel-grid approach (today's production compact row + nested anatomy row)
 * with the shared-track prototype on the same content.
 */
function BrokenParallelGridRow({
  modeError,
  speedError,
}: {
  modeError?: string
  speedError?: string
}) {
  const presentation = resolveFieldRowAnatomyPresentation(['md', 'auto'], 'compact')

  return (
    <div
      data-array-item-broken-parallel-grid=""
      className={cn(
        arrayItemCompactRowClasses('start'),
        'rounded-md border border-dashed border-destructive/40 p-3',
      )}
      style={{ gridTemplateColumns: buildArrayItemCompactRowGridTemplate(true) }}
    >
      <div className={arrayItemCompactGripClasses('start')}>
        <PrototypeChromeGrip />
      </div>
      <div className="min-w-0">
        <FieldRowAnatomyProvider>
          <div
            data-field-row=""
            data-field-row-anatomy=""
            className={presentation.className}
            style={presentation.style}
          >
            <PrototypeParticipantField id="broken-mode" label="Mode" error={modeError} />
            <PrototypeParticipantField id="broken-speed" label="Speed" error={speedError} />
          </div>
        </FieldRowAnatomyProvider>
      </div>
      <div className={arrayItemCompactGripClasses('start')}>
        <PrototypeChromeRemove />
      </div>
    </div>
  )
}

function BrokenVsSharedComparisonHarness() {
  const [speedError, setSpeedError] = React.useState<string | undefined>()

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Toggle a speed error. The broken model top-aligns chrome to the outer cell while the inner
        anatomy grid grows independently. The shared-track model keeps chrome vertically centered in
        the anatomy grid cell.
      </p>
      <button
        type="button"
        className="w-fit rounded-md border px-2.5 py-1 text-sm"
        onClick={() =>
          setSpeedError((prev) => (prev ? undefined : 'Speed must be a positive whole number.'))
        }
      >
        {speedError ? 'Clear speed error' : 'Show speed error'}
      </button>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-destructive">
          Broken — parallel grids
        </span>
        <BrokenParallelGridRow speedError={speedError} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-foreground">
          Shared tracks — Phase 0 target
        </span>
        <div data-prototype-container="" className="rounded-md border border-border bg-card p-3">
          <ArrayItemAnatomyGrid
            fieldWidths={['md', 'auto']}
            grip={<PrototypeChromeGrip />}
            actions={<PrototypeChromeRemove />}
          >
            <PrototypeParticipantField id="shared-mode" label="Mode" placeholder="Walk" />
            <PrototypeParticipantField
              id="shared-speed"
              label="Speed"
              error={speedError}
              placeholder="30"
            />
          </ArrayItemAnatomyGrid>
        </div>
      </div>
    </div>
  )
}

export const BrokenParallelGridVsSharedTracks: Story = {
  render: () => <BrokenVsSharedComparisonHarness />,
}
