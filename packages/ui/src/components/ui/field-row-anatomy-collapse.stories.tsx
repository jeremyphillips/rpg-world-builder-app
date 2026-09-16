'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'

import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { resolveFieldRowAnatomyPresentation } from './field-row-anatomy.variants'
import { Input } from './input.client'
import { SelectField } from './select-field'
import { cn } from '../../lib/utils'

/**
 * Verifies wide ↔ collapsed anatomy-row placement: stacked fields get independent
 * three-row subgrid bands when the container is narrower than the token-derived minimum.
 */

function AnatomyRow({
  widths,
  children,
  className,
}: {
  widths: Parameters<typeof resolveFieldRowAnatomyPresentation>[0]
  children: React.ReactNode
  className?: string
}) {
  const presentation = resolveFieldRowAnatomyPresentation(widths)
  return (
    <FieldRowAnatomyProvider>
      <div
        data-field-row=""
        data-field-row-anatomy=""
        className={cn(presentation.className, className)}
        style={presentation.style}
      >
        {children}
      </div>
    </FieldRowAnatomyProvider>
  )
}

function ParticipantField({
  id,
  label,
  width = 'full',
}: {
  id: string
  label: string
  width?: 'full' | 'auto' | '1/2' | '1/3'
}) {
  return (
    <Field.Root id={id} width={width} anatomy>
      <FieldLayout
        hintPosition="below-control"
        label={<Field.Label>{label}</Field.Label>}
        control={<Input aria-label={label} />}
      />
    </Field.Root>
  )
}

const meta = {
  title: 'Internal/Forms/Layout/FieldRowAnatomyCollapse',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Resize the container to verify collapse: wide mode shares label/control/message tracks; narrow mode stacks independent three-row bands.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj

/** Three equal selects — weapon category / mode / mastery row shape. */
export const WeaponsThreeSelects: Story = {
  render: () => (
    <div className="max-w-full resize-x overflow-auto border border-dashed border-border p-4">
      <AnatomyRow widths={['full', 'full', 'full']} className="min-w-[20rem]">
        <SelectField
          id="weapon-category"
          label="Category"
          width="full"
          placeholder="Choose"
          options={[
            { label: 'Simple', value: 'simple' },
            { label: 'Martial', value: 'martial' },
          ]}
        />
        <SelectField
          id="weapon-mode"
          label="Mode"
          width="full"
          placeholder="Choose"
          options={[
            { label: 'Melee', value: 'melee' },
            { label: 'Ranged', value: 'ranged' },
          ]}
        />
        <SelectField
          id="weapon-mastery"
          label="Mastery"
          width="full"
          placeholder="Choose"
          options={[
            { label: 'Cleave', value: 'cleave' },
            { label: 'Push', value: 'push' },
          ]}
        />
      </AnatomyRow>
    </div>
  ),
}

/** Four intrinsic-width fields — vehicle cargo / speed / crew / passengers row shape. */
export const ContentSpeedFourAuto: Story = {
  render: () => (
    <div className="max-w-full resize-x overflow-auto border border-dashed border-border p-4">
      <AnatomyRow widths={['auto', 'auto', 'auto', 'auto']} className="min-w-[24rem]">
        <ParticipantField id="cargo" label="Cargo capacity" width="auto" />
        <ParticipantField id="speed" label="Speed" width="auto" />
        <ParticipantField id="crew" label="Crew" width="auto" />
        <ParticipantField id="passengers" label="Passengers" width="auto" />
      </AnatomyRow>
    </div>
  ),
}
