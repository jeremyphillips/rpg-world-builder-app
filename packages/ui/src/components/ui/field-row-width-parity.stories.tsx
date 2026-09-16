'use client'

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import type { FieldWidth } from './field-control.variants'
import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldRow } from './field-row'
import { Input } from './input.client'
import { TextField } from './text-field'
import { resolveFieldRowColumnTracks } from './field-row-column-tracks.lib'
import { resolveFieldRowAnatomyPrototypePresentation } from './field-row-anatomy-prototype.variants'
import { cn } from '../../lib/utils'

/**
 * Width-parity checkpoint: flex `FieldRow` (current) vs anatomy-grid columns from
 * {@link resolveFieldRowColumnTracks}. Visual + measured widths must match.
 */

type ProbeFieldProps = {
  id: string
  label: string
  width: FieldWidth
  placeholder?: string
  rowParticipation?: boolean
}

function AnatomyProbeField({
  id,
  label,
  width,
  placeholder,
  rowParticipation = true,
}: ProbeFieldProps) {
  return (
    <Field.Root id={id} width={width} anatomy rowParticipation={rowParticipation}>
      <FieldLayout
        label={<Field.Label>{label}</Field.Label>}
        control={<Input placeholder={placeholder ?? label} />}
      />
    </Field.Root>
  )
}

function FlexProbeField({
  id,
  label,
  width,
  placeholder,
}: Omit<ProbeFieldProps, 'rowParticipation'>) {
  return <TextField id={id} label={label} width={width} placeholder={placeholder ?? label} />
}

function WidthReadout({
  containerRef,
  fieldIds,
  revision,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  fieldIds: string[]
  /** Re-measure when the container width (or other layout input) changes. */
  revision: number | string
}) {
  const [widths, setWidths] = React.useState<number[]>([])
  const fieldIdsKey = fieldIds.join('|')

  React.useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return
    const ids = fieldIdsKey.split('|').filter(Boolean)
    const next = ids.map((id) => {
      const el = root
        .querySelector(`#${CSS.escape(id)}`)
        ?.closest('[data-field-anatomy], [data-field]')
      return el ? Math.round(el.getBoundingClientRect().width) : 0
    })
    setWidths((prev) =>
      prev.length === next.length && prev.every((width, index) => width === next[index])
        ? prev
        : next,
    )
  }, [containerRef, fieldIdsKey, revision])

  return (
    <p className="font-mono text-xs text-muted-foreground">
      widths: {widths.length ? widths.map((width) => `${width}px`).join(' · ') : '—'}
    </p>
  )
}

function ParityPair({
  title,
  widths,
  labels,
  revision,
}: {
  title: string
  widths: FieldWidth[]
  labels: string[]
  revision: number
}) {
  const flexRef = React.useRef<HTMLDivElement>(null)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const resolved = resolveFieldRowColumnTracks(widths)
  const presentation = resolveFieldRowAnatomyPrototypePresentation(widths)
  const fieldIds = React.useMemo(
    () => widths.map((_, index) => `parity-${title}-${index}`),
    [widths, title],
  )
  const flexFieldIds = React.useMemo(() => fieldIds.map((id) => `flex-${id}`), [fieldIds])
  const gridFieldIds = React.useMemo(() => fieldIds.map((id) => `grid-${id}`), [fieldIds])

  return (
    <section className="flex flex-col gap-3 rounded-md border border-border p-4">
      <header className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="font-mono text-xs text-muted-foreground">
          tokens: [{widths.join(', ')}] · strategy: {resolved.strategy} · tracks:{' '}
          {resolved.gridTemplateColumns}
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Flex FieldRow (current)</p>
        <div ref={flexRef}>
          <FieldRow>
            {widths.map((width, index) => (
              <FlexProbeField
                key={flexFieldIds[index]}
                id={flexFieldIds[index]!}
                label={labels[index]!}
                width={width}
              />
            ))}
          </FieldRow>
        </div>
        <WidthReadout containerRef={flexRef} fieldIds={flexFieldIds} revision={revision} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Anatomy grid (resolver)</p>
        <div
          ref={gridRef}
          data-field-row-anatomy-prototype=""
          className={cn(presentation.className)}
          style={presentation.style}
        >
          {widths.map((width, index) => (
            <AnatomyProbeField
              key={gridFieldIds[index]}
              id={gridFieldIds[index]!}
              label={labels[index]!}
              width={width}
            />
          ))}
        </div>
        <WidthReadout containerRef={gridRef} fieldIds={gridFieldIds} revision={revision} />
      </div>
    </section>
  )
}

const CONTAINER_WIDTHS = [480, 720, 960, 1200] as const

function ParityMatrix() {
  const [containerWidth, setContainerWidth] = React.useState<(typeof CONTAINER_WIDTHS)[number]>(960)

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Compare measured field widths. Flex and anatomy-grid rows should match within a pixel or two
        at each container width. Phantom filler tracks are not used.
      </p>
      <div className="flex flex-wrap gap-2">
        {CONTAINER_WIDTHS.map((width) => (
          <button
            key={width}
            type="button"
            className={cn(
              'rounded-md border px-2.5 py-1 text-sm',
              containerWidth === width
                ? 'border-foreground bg-muted text-foreground'
                : 'border-border text-muted-foreground',
            )}
            onClick={() => setContainerWidth(width)}
          >
            {width}px
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-6" style={{ width: containerWidth }}>
        <ParityPair
          title="tools"
          widths={['1/2', '1/2']}
          labels={['Category', 'Tool']}
          revision={containerWidth}
        />
        <ParityPair
          title="content-identity"
          widths={['full', '1/3']}
          labels={['Name', 'Availability']}
          revision={containerWidth}
        />
        <ParityPair
          title="content-speed"
          widths={['auto', 'auto', 'auto', 'auto']}
          labels={['Mass', 'Speed', 'Crew', 'Passengers']}
          revision={containerWidth}
        />
        <ParityPair
          title="weapons"
          widths={['lg', 'lg', 'lg']}
          labels={['Category', 'Mode', 'Mastery']}
          revision={containerWidth}
        />
        <ParityPair
          title="resolution"
          widths={['auto', 'xl']}
          labels={['Count', 'Projectile']}
          revision={containerWidth}
        />
        <ParityPair
          title="lone-half"
          widths={['1/2']}
          labels={['Half only']}
          revision={containerWidth}
        />
      </div>
    </div>
  )
}

const meta = {
  title: 'Forms/Layout/FieldRowWidthParity',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Step 3 width-parity checkpoint. Anatomy-grid column tracks from resolveFieldRowColumnTracks must match flex FieldRow field widths. Verdict: parity holds for representative rows without a phantom filler track.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

export const RepresentativeRows: Story = {
  render: () => <ParityMatrix />,
}
