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
import { JoinedPair } from '../../../components/ui/joined-pair-field.client'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select.client'
import { SelectOptionItem } from '../../../components/ui/select-option-item.client'
import { ArrayItemAnatomyGrid } from './array-item-anatomy-grid.client'
import {
  ArrayItemAnatomyGridSpacingPrototype,
  ArrayItemSpacingPrototypeShell,
} from './array-item-anatomy-grid-spacing-prototype.client'
import {
  ARRAY_ITEM_SPACING_PROTOTYPE_LEGACY_SHELL_PADDING_CLASSES,
  CHROME_PRESENCE_LABELS,
  JOINED_PAIR_LEGACY_DIVIDER_CLASSES,
  JOINED_PAIR_LEGACY_INTRINSIC_SHELL_CLASSES,
  LEGACY_FLAT_SPACING_CANDIDATES,
  readSharedAnatomyTrackProbe,
  resolveChromePresenceFlags,
  resolvePrototypeMovementFixEnabled,
  SPACING_CANDIDATE_LABELS,
  TARGET_SHIP_SPACING_CANDIDATE,
  TARGET_SHIP_SPACING_CANDIDATES,
  type ChromePresence,
  type SpacingPrototypeCandidate,
} from './array-item-anatomy-grid-spacing-prototype.lib'
import {
  chromeContainerVerticalDelta,
  chromeVerticalDelta,
  isChromeAlignedToControlTrack,
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
        arrayItemCompactRowClasses(),
        'rounded-md border border-dashed border-destructive/40 p-3',
      )}
      style={{ gridTemplateColumns: buildArrayItemCompactRowGridTemplate(true) }}
    >
      <div className={arrayItemCompactGripClasses()}>
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
      <div className={arrayItemCompactGripClasses()}>
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

const MOVEMENT_MODE_OPTIONS = [
  { value: 'walk', label: 'Walk' },
  { value: 'fly', label: 'Fly' },
  { value: 'swim', label: 'Swim' },
] as const

const MOVEMENT_FEET_OPTIONS = [
  { value: 30, label: '30' },
  { value: 40, label: '40' },
  { value: 50, label: '50' },
] as const

type MovementPrototypeFieldProps = {
  modeId: string
  speedId: string
  modeLabel?: string
  wrapModeLabel?: boolean
  modeHint?: string
  speedError?: string
  speedUnset?: boolean
}

function PrototypeMovementModeField({
  id,
  label,
  hint,
  wrapLabel,
}: {
  id: string
  label: string
  hint?: string
  wrapLabel?: boolean
}) {
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
      anatomy
      rowParticipation
      width="md"
    >
      <FieldLayout
        hintPosition={hint ? 'below-control' : 'below-label'}
        label={labelNode}
        control={
          <Select defaultValue="walk">
            <SelectTrigger id={id} aria-label={label}>
              <SelectValue placeholder="Choose a mode…" />
            </SelectTrigger>
            <SelectContent>
              {MOVEMENT_MODE_OPTIONS.map((option) => (
                <SelectOptionItem
                  key={option.value}
                  option={{ label: option.label, value: option.value }}
                  itemValue={option.value}
                />
              ))}
            </SelectContent>
          </Select>
        }
      />
    </Field.Root>
  )
}

type JoinedPairDividerHardening = 'legacy' | 'production'

function PrototypeMovementSpeedJoinedPair({
  id,
  unset,
  dividerHardening = 'production',
}: {
  id: string
  unset?: boolean
  dividerHardening?: JoinedPairDividerHardening
}) {
  const speedValue = unset ? undefined : 30

  return (
    <JoinedPair.Root
      layout="intrinsic"
      aria-label="Speed"
      className={
        dividerHardening === 'legacy' ? JOINED_PAIR_LEGACY_INTRINSIC_SHELL_CLASSES : undefined
      }
    >
      <JoinedPair.SelectOccupant
        id={id}
        ariaLabel="Speed value"
        value={speedValue}
        options={[...MOVEMENT_FEET_OPTIONS]}
        size="md"
        position="start"
        digits={3}
        placeholder="—"
        onValueChange={() => undefined}
      />
      {dividerHardening === 'legacy' ? (
        <div aria-hidden className={JOINED_PAIR_LEGACY_DIVIDER_CLASSES} />
      ) : (
        <JoinedPair.Divider />
      )}
      <JoinedPair.LabelOccupant text="ft." ariaLabel="Speed unit" size="md" />
    </JoinedPair.Root>
  )
}

function PrototypeMovementSpeedField({
  id,
  error,
  unset,
  width = 'full',
  dividerHardening = 'production',
}: {
  id: string
  error?: string
  unset?: boolean
  width?: 'full' | 'auto'
  dividerHardening?: JoinedPairDividerHardening
}) {
  const speedControl = (
    <PrototypeMovementSpeedJoinedPair id={id} unset={unset} dividerHardening={dividerHardening} />
  )

  return (
    <Field.Root id={id} error={error} anatomy rowParticipation width={width}>
      <FieldLayout label={<Field.Label>Speed</Field.Label>} control={speedControl} />
    </Field.Root>
  )
}

function PrototypeMovementRow({
  candidate,
  chromePresence = 'grip-fields-actions',
  intrinsicAuto,
  ...fieldProps
}: MovementPrototypeFieldProps & {
  candidate: SpacingPrototypeCandidate
  chromePresence?: ChromePresence
  intrinsicAuto?: boolean
}) {
  const modeLabel = fieldProps.modeLabel ?? 'Mode'
  const { showGrip, showActions } = resolveChromePresenceFlags(chromePresence)
  const movementFixEnabled = resolvePrototypeMovementFixEnabled(candidate, intrinsicAuto)

  return (
    <ArrayItemSpacingPrototypeShell showGrip={showGrip} showActions={showActions}>
      <ArrayItemAnatomyGridSpacingPrototype
        fieldWidths={['md', 'auto']}
        candidate={candidate}
        chromePresence={chromePresence}
        intrinsicAuto={movementFixEnabled}
        grip={<PrototypeChromeGrip />}
        actions={<PrototypeChromeRemove />}
      >
        <PrototypeMovementModeField
          id={fieldProps.modeId}
          label={modeLabel}
          hint={fieldProps.modeHint}
          wrapLabel={fieldProps.wrapModeLabel}
        />
        <PrototypeMovementSpeedField
          id={fieldProps.speedId}
          error={fieldProps.speedError}
          unset={fieldProps.speedUnset}
          width={movementFixEnabled ? 'auto' : 'full'}
        />
      </ArrayItemAnatomyGridSpacingPrototype>
    </ArrayItemSpacingPrototypeShell>
  )
}

function ShellPaddingComparisonRow({ chromePresence }: { chromePresence: ChromePresence }) {
  const modeId = `shell-${chromePresence}-mode`
  const speedId = `shell-${chromePresence}-speed`

  const { showGrip, showActions } = resolveChromePresenceFlags(chromePresence)
  const movementFixEnabled = resolvePrototypeMovementFixEnabled(TARGET_SHIP_SPACING_CANDIDATE)

  function renderMovementRow(idPrefix: string) {
    return (
      <ArrayItemAnatomyGridSpacingPrototype
        fieldWidths={['md', 'auto']}
        candidate={TARGET_SHIP_SPACING_CANDIDATE}
        chromePresence={chromePresence}
        intrinsicAuto={movementFixEnabled}
        grip={<PrototypeChromeGrip />}
        actions={<PrototypeChromeRemove />}
      >
        <PrototypeMovementModeField id={`${idPrefix}-${modeId}`} label="Mode" />
        <PrototypeMovementSpeedField id={`${idPrefix}-${speedId}`} width="auto" />
      </ArrayItemAnatomyGridSpacingPrototype>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Production flat grid + pl-2 · {CHROME_PRESENCE_LABELS[chromePresence]}
        </span>
        <div
          className={cn(
            'rounded-md border border-border bg-card',
            ARRAY_ITEM_SPACING_PROTOTYPE_LEGACY_SHELL_PADDING_CLASSES,
          )}
        >
          <ArrayItemAnatomyGridSpacingPrototype
            fieldWidths={['md', 'auto']}
            candidate="legacy-flat-form"
            chromePresence={chromePresence}
            grip={<PrototypeChromeGrip />}
            actions={<PrototypeChromeRemove />}
          >
            <PrototypeMovementModeField id={`legacy-flat-${modeId}`} label="Mode" />
            <PrototypeMovementSpeedField id={`legacy-flat-${speedId}`} />
          </ArrayItemAnatomyGridSpacingPrototype>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          Target two-tier + {showGrip ? 'pl-2' : 'pl-3'}/{showActions ? 'pr-2' : 'pr-3'} shell ·{' '}
          {CHROME_PRESENCE_LABELS[chromePresence]}
        </span>
        <ArrayItemSpacingPrototypeShell showGrip={showGrip} showActions={showActions}>
          {renderMovementRow('target')}
        </ArrayItemSpacingPrototypeShell>
      </div>
    </div>
  )
}

function SharedTrackProbeReadout({
  fieldIds,
  controlFieldId,
  revision,
}: {
  fieldIds: string[]
  controlFieldId: string
  revision: string
}) {
  const [readout, setReadout] = React.useState(() => ({
    shared: readSharedAnatomyTrackProbe(fieldIds),
    controlAligned: false,
    gripDelta: null as number | null,
    actionsDelta: null as number | null,
  }))

  React.useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const shared = readSharedAnatomyTrackProbe(fieldIds)
      const probe = readAnatomyTrackProbe({ controlFieldId })
      const delta = chromeVerticalDelta(probe)
      setReadout({
        shared,
        controlAligned: isChromeAlignedToControlTrack(probe),
        gripDelta: delta.gripDelta,
        actionsDelta: delta.actionsDelta,
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [fieldIds, controlFieldId, revision])

  return (
    <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
      <span>
        label tops: {readout.shared.labelTops.join(', ') || '—'} · aligned:{' '}
        {readout.shared.labelsAligned ? 'yes' : 'no'}
      </span>
      <span>
        control tops: {readout.shared.controlTops.join(', ') || '—'} · aligned:{' '}
        {readout.shared.controlsAligned ? 'yes' : 'no'}
      </span>
      <span>
        chrome control-track aligned: {readout.controlAligned ? 'yes' : 'no'} · grip Δ control:{' '}
        {readout.gripDelta ?? '—'}px
      </span>
      <span className="text-foreground/80">
        Invariant: one shared label/control/message track system — no independent nested anatomy
        grid.
      </span>
    </div>
  )
}

function TargetSpacingSection({
  candidates,
  chromePresences,
  title,
}: {
  candidates: readonly SpacingPrototypeCandidate[]
  chromePresences: readonly ChromePresence[]
  title: string
}) {
  return (
    <>
      {candidates.map((candidate) => (
        <section key={candidate} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">
            {title}: {SPACING_CANDIDATE_LABELS[candidate]}
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {chromePresences.map((presence) => (
              <div key={presence} className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {CHROME_PRESENCE_LABELS[presence]}
                </span>
                <PrototypeMovementRow
                  candidate={candidate}
                  chromePresence={presence}
                  modeId={`${candidate}-${presence}-mode`}
                  speedId={`${candidate}-${presence}-speed`}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function ChromeSpacingMatrixHarness() {
  const chromePresences: ChromePresence[] = [
    'fields-only',
    'grip-fields',
    'fields-actions',
    'grip-fields-actions',
  ]

  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Target ship uses two-tier fieldsCluster: 8px chrome gap (grip/trash ↔ fields only when slot
        present), 12px dense / 16px default field columns inside the cluster. Shell pl-2 (8px) when
        grip present, pl-3 when fields-only; pr-2 (8px) when trash present, pr-3 when fields-only.
        Speed uses width auto + digit min-inline-size on all two-tier rows. Inspect outer grid for 3
        columns (grip | cluster | trash) — Mode↔Speed gap is on{' '}
        <code className="text-xs">[data-array-item-fields-cluster]</code>, not the outer grid.
      </p>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Shell + gap — production flat vs target two-tier</h3>
        <ShellPaddingComparisonRow chromePresence="fields-only" />
        <ShellPaddingComparisonRow chromePresence="grip-fields-actions" />
      </section>
      <TargetSpacingSection
        title="Target ship"
        candidates={TARGET_SHIP_SPACING_CANDIDATES}
        chromePresences={chromePresences}
      />
      <details className="rounded-md border border-border bg-muted p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Legacy flat gap candidates (24 / 16 / 12px on every column — not ship targets)
        </summary>
        <div className="mt-4 flex flex-col gap-8">
          <TargetSpacingSection
            title="Legacy comparison"
            candidates={LEGACY_FLAT_SPACING_CANDIDATES}
            chromePresences={chromePresences}
          />
        </div>
      </details>
    </div>
  )
}

/** Primary target — Movement-shaped two-tier dense row (grip + fields + action). */
export const TargetMovementShipCandidate: Story = {
  render: () => (
    <div className="max-w-md">
      <PrototypeMovementRow
        candidate={TARGET_SHIP_SPACING_CANDIDATE}
        chromePresence="grip-fields-actions"
        modeId="target-mode"
        speedId="target-speed"
      />
    </div>
  ),
}

/** Gap candidates × chrome presence — target two-tier first; legacy flat in collapsed section. */
export const ChromeSpacingMatrix: Story = {
  render: () => <ChromeSpacingMatrixHarness />,
}

type SubgridProofStep = 'clean' | 'speedError' | 'multilineError' | 'wrappedModeLabel' | 'modeHint'

const SUBGRID_PROOF_STEPS: { id: SubgridProofStep; label: string }[] = [
  { id: 'clean', label: '1. Valid' },
  { id: 'speedError', label: '2. Speed error' },
  { id: 'multilineError', label: '3. Multiline error' },
  { id: 'wrappedModeLabel', label: '4. Wrapped label' },
  { id: 'modeHint', label: '5. Hint on mode' },
]

function NestedSubgridTrackProofHarness() {
  const [step, setStep] = React.useState<SubgridProofStep>('clean')

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
    <div className="flex max-w-2xl flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        fieldsCluster subgrid proof — parent anatomy grid owns tracks; cluster spans rows 1–3; field
        columns subgrid inside. Grip/trash stay on the control track through message-track growth.
      </p>
      <div className="flex flex-wrap gap-2">
        {SUBGRID_PROOF_STEPS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'rounded-md border px-2.5 py-1 text-sm',
              step === item.id
                ? 'border-foreground bg-muted text-foreground'
                : 'border-border text-muted-foreground',
            )}
            onClick={() => setStep(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <SharedTrackProbeReadout
        fieldIds={['subgrid-mode', 'subgrid-speed']}
        controlFieldId="subgrid-mode"
        revision={step}
      />
      <ArrayItemSpacingPrototypeShell>
        <ArrayItemAnatomyGridSpacingPrototype
          fieldWidths={['md', 'auto']}
          candidate="two-tier-dense"
          chromePresence="grip-fields-actions"
          intrinsicAuto
          grip={<PrototypeChromeGrip />}
          actions={<PrototypeChromeRemove />}
        >
          <PrototypeMovementModeField
            id="subgrid-mode"
            label={modeLabel}
            hint={modeHint}
            wrapLabel={wrapModeLabel}
          />
          <PrototypeMovementSpeedField id="subgrid-speed" error={speedError} width="auto" />
        </ArrayItemAnatomyGridSpacingPrototype>
      </ArrayItemSpacingPrototypeShell>
    </div>
  )
}

/** fieldsCluster must share parent label/control/message tracks — no independent nested grid. */
export const NestedSubgridTrackProof: Story = {
  render: () => <NestedSubgridTrackProofHarness />,
}

function JoinedPairCrushPanel({
  title,
  shellWidth,
  speedWidth,
}: {
  title: string
  shellWidth: number
  speedWidth: 'full' | 'auto'
}) {
  const intrinsicAuto = speedWidth === 'auto'

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title} · {shellWidth}px shell
      </span>
      <ArrayItemSpacingPrototypeShell style={{ width: shellWidth }}>
        <ArrayItemAnatomyGridSpacingPrototype
          fieldWidths={['md', speedWidth]}
          candidate="two-tier-dense"
          chromePresence="grip-fields-actions"
          intrinsicAuto={intrinsicAuto}
          grip={<PrototypeChromeGrip />}
          actions={<PrototypeChromeRemove />}
        >
          <PrototypeMovementModeField id={`${title}-mode`} label="Mode" />
          <PrototypeMovementSpeedField id={`${title}-speed`} width={speedWidth} />
        </ArrayItemAnatomyGridSpacingPrototype>
      </ArrayItemSpacingPrototypeShell>
    </div>
  )
}

function JoinedPairDividerCrushPanel({
  title,
  shellWidth,
  dividerHardening,
}: {
  title: string
  shellWidth: number
  dividerHardening: JoinedPairDividerHardening
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title} · {shellWidth}px control slot
      </span>
      <div
        className="overflow-hidden rounded-md border border-border bg-card p-3"
        style={{ width: shellWidth }}
      >
        <PrototypeMovementSpeedJoinedPair
          id={`${title}-speed`}
          dividerHardening={dividerHardening}
        />
      </div>
    </div>
  )
}

function JoinedPairNarrowCrushHarness() {
  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <p className="text-sm text-muted-foreground">
        Digit-3 + ft. joined pair at constrained widths. All panels use production digit
        min-inline-size on the select trigger. The primary crush fix is Speed on an intrinsic{' '}
        <code className="text-xs">auto</code> track — not a shrinkable{' '}
        <code className="text-xs">full</code> track. Below the composite minimum, the row overflows
        or reflows instead of mangling the control.
      </p>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">Grid track — shrinkable full vs intrinsic auto</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <JoinedPairCrushPanel
            title="Legacy — Speed on full (1fr)"
            shellWidth={320}
            speedWidth="full"
          />
          <JoinedPairCrushPanel
            title="Production — Speed on auto"
            shellWidth={320}
            speedWidth="auto"
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <JoinedPairCrushPanel
            title="Legacy below composite min"
            shellWidth={240}
            speedWidth="full"
          />
          <JoinedPairCrushPanel
            title="Production below composite min"
            shellWidth={240}
            speedWidth="auto"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          At 240px the production row may exceed the shell — intended failure mode is horizontal
          overflow or row collapse, not a crushed digit select.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">
          Divider track — legacy 1px vs hardened minmax(1px, 1px)
        </h3>
        <p className="text-sm text-muted-foreground">
          Isolated joined pair with production digit sizing. Only the internal divider track
          differs: <code className="text-xs">grid-cols-[auto_1px_auto]</code> + plain{' '}
          <code className="text-xs">w-px</code> vs{' '}
          <code className="text-xs">grid-cols-[auto_minmax(1px,1px)_auto]</code> +{' '}
          <code className="text-xs">min-w-px</code>.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <JoinedPairDividerCrushPanel
            title="Legacy divider track"
            shellWidth={148}
            dividerHardening="legacy"
          />
          <JoinedPairDividerCrushPanel
            title="Production hardened divider"
            shellWidth={148}
            dividerHardening="production"
          />
        </div>
      </section>
    </div>
  )
}

/** JoinedPair crush — grid track, digit floor, and divider hardening at narrow widths. */
export const JoinedPairNarrowCrush: Story = {
  render: () => <JoinedPairNarrowCrushHarness />,
}
