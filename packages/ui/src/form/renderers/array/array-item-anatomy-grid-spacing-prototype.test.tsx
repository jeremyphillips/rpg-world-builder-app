import { render, screen } from '@testing-library/react'
import { GripVertical, Trash2 } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { Field } from '../../../components/ui/field.client'
import { FieldLayout } from '../../../components/ui/field-layout'
import { Input } from '../../../components/ui/input.client'

import { ArrayItemAnatomyGridSpacingPrototype } from './array-item-anatomy-grid-spacing-prototype.client'

function PrototypeParticipantField({ id, label }: { id: string; label: string }) {
  return (
    <Field.Root id={id} anatomy rowParticipation width="md">
      <FieldLayout
        label={<Field.Label>{label}</Field.Label>}
        control={<Input id={id} aria-label={label} defaultValue="" />}
      />
    </Field.Root>
  )
}

describe('ArrayItemAnatomyGridSpacingPrototype', () => {
  it('renders fieldsCluster for two-tier candidates', () => {
    render(
      <ArrayItemAnatomyGridSpacingPrototype
        fieldWidths={['md', 'auto']}
        candidate="two-tier-dense"
        chromePresence="grip-fields-actions"
        grip={
          <button type="button" aria-label="Drag to reorder">
            <GripVertical aria-hidden />
          </button>
        }
        actions={
          <button type="button" aria-label="Remove item">
            <Trash2 aria-hidden />
          </button>
        }
      >
        <PrototypeParticipantField id="mode" label="Mode" />
        <PrototypeParticipantField id="speed" label="Speed" />
      </ArrayItemAnatomyGridSpacingPrototype>,
    )

    const cluster = document.querySelector('[data-array-item-fields-cluster]')
    expect(cluster).toBeTruthy()
    expect(cluster).toHaveClass('grid-rows-subgrid', 'gap-x-3')
    expect(document.querySelector('[data-field-row-anatomy]')).toBeNull()
    expect(screen.getByText('Mode')).toBeVisible()
    expect(screen.getByText('Speed')).toBeVisible()
  })

  it('omits chrome columns and outer chrome gap slots when chrome presence is fields-only', () => {
    render(
      <ArrayItemAnatomyGridSpacingPrototype
        fieldWidths={['md', 'auto']}
        candidate="two-tier-dense"
        chromePresence="fields-only"
        grip={
          <button type="button" aria-label="Drag to reorder">
            <GripVertical aria-hidden />
          </button>
        }
        actions={
          <button type="button" aria-label="Remove item">
            <Trash2 aria-hidden />
          </button>
        }
      >
        <PrototypeParticipantField id="mode-only" label="Mode" />
        <PrototypeParticipantField id="speed-only" label="Speed" />
      </ArrayItemAnatomyGridSpacingPrototype>,
    )

    expect(document.querySelector('[data-array-item-anatomy-grip]')).toBeNull()
    expect(document.querySelector('[data-array-item-anatomy-actions]')).toBeNull()
    expect(
      (document.querySelector('[data-array-item-anatomy-grid]') as HTMLElement).style
        .gridTemplateColumns,
    ).toBe('minmax(0, 1fr)')
  })

  it('does not apply grip inset by default', () => {
    render(
      <ArrayItemAnatomyGridSpacingPrototype
        fieldWidths={['md', 'auto']}
        candidate="two-tier-dense"
        chromePresence="grip-fields-actions"
        grip={
          <button type="button" aria-label="Drag to reorder">
            <GripVertical aria-hidden />
          </button>
        }
        actions={
          <button type="button" aria-label="Remove item">
            <Trash2 aria-hidden />
          </button>
        }
      >
        <PrototypeParticipantField id="mode-inset-default" label="Mode" />
        <PrototypeParticipantField id="speed-inset-default" label="Speed" />
      </ArrayItemAnatomyGridSpacingPrototype>,
    )

    expect(document.querySelector('[data-array-item-anatomy-grip]')).not.toHaveClass('-ml-1')
  })

  it('applies grip inset when applyGripInset is true', () => {
    render(
      <ArrayItemAnatomyGridSpacingPrototype
        fieldWidths={['md', 'auto']}
        candidate="two-tier-dense"
        chromePresence="grip-fields-actions"
        applyGripInset
        grip={
          <button type="button" aria-label="Drag to reorder">
            <GripVertical aria-hidden />
          </button>
        }
        actions={
          <button type="button" aria-label="Remove item">
            <Trash2 aria-hidden />
          </button>
        }
      >
        <PrototypeParticipantField id="mode-inset" label="Mode" />
        <PrototypeParticipantField id="speed-inset" label="Speed" />
      </ArrayItemAnatomyGridSpacingPrototype>,
    )

    expect(document.querySelector('[data-array-item-anatomy-grip]')).toHaveClass('-ml-1')
  })
})
