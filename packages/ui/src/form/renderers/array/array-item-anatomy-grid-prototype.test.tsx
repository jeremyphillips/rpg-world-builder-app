import type { CSSProperties } from 'react'
import { render, screen } from '@testing-library/react'
import { GripVertical, Trash2 } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { Field } from '../../../components/ui/field.client'
import { FieldLayout } from '../../../components/ui/field-layout'
import { Input } from '../../../components/ui/input.client'
import { fieldRowParticipationClasses } from '../../../components/ui/field-root.lib'

import { ArrayItemAnatomyGrid } from './array-item-anatomy-grid.client'
import { readAnatomyTrackProbe } from './array-item-anatomy-grid-prototype.lib'

function stubRect(
  element: Element,
  rect: { top: number; height: number; left?: number; width?: number },
) {
  element.getBoundingClientRect = () =>
    ({
      x: rect.left ?? 0,
      y: rect.top,
      width: rect.width ?? 24,
      height: rect.height,
      top: rect.top,
      left: rect.left ?? 0,
      bottom: rect.top + rect.height,
      right: (rect.left ?? 0) + (rect.width ?? 24),
      toJSON: () => ({}),
    }) as DOMRect
}

function PrototypeParticipantField({
  id,
  label,
  error,
  style,
  className,
}: {
  id: string
  label: string
  error?: string
  style?: CSSProperties
  className?: string
}) {
  return (
    <Field.Root
      id={id}
      error={error}
      anatomy
      rowParticipation
      width="full"
      style={style}
      className={className}
    >
      <FieldLayout
        label={<Field.Label>{label}</Field.Label>}
        control={<Input id={id} aria-label={label} defaultValue="" />}
      />
    </Field.Root>
  )
}

describe('ArrayItemAnatomyGrid prototype composition', () => {
  it('renders one parent anatomy grid with direct field participants and control-track chrome', () => {
    render(
      <ArrayItemAnatomyGrid
        fieldWidths={['md', 'auto']}
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
      </ArrayItemAnatomyGrid>,
    )

    const grid = document.querySelector('[data-array-item-anatomy-grid]')
    expect(grid).toBeTruthy()
    expect(grid).toHaveClass('grid-rows-[auto_auto_auto]')
    expect(grid).not.toHaveClass('field-row-anatomy-grid')

    const grip = document.querySelector('[data-array-item-anatomy-grip]') as HTMLElement | null
    const actions = document.querySelector(
      '[data-array-item-anatomy-actions]',
    ) as HTMLElement | null

    expect(grip?.style.gridColumn).toBe('1')
    expect(grip?.style.gridRow).toBe('1 / -1')
    expect(actions?.style.gridColumn).toBe('4')
    expect(actions?.style.gridRow).toBe('1 / -1')
    expect(grip).toHaveClass('items-center')
    expect(actions).toHaveClass('items-center')
    expect(grip?.querySelector('button')).toBeTruthy()
    expect(actions?.querySelector('button')).toBeTruthy()

    const participants = grid?.querySelectorAll('[data-field-row-participant]')
    expect(participants).toHaveLength(2)

    const fields = grid?.querySelectorAll('[data-field-anatomy][data-field-row-participant]')
    expect(fields).toHaveLength(2)
    expect(fields?.[0]).toHaveClass(...fieldRowParticipationClasses.split(' '))
    expect((fields?.[0] as HTMLElement).style.gridColumn).toBe('2')
    expect((fields?.[0] as HTMLElement).style.gridRow).toBe('1 / -1')
    expect((fields?.[1] as HTMLElement).style.gridColumn).toBe('3')

    expect((grid as HTMLElement).style.gridTemplateColumns).toContain('var(--leading-chrome-size)')
    expect(screen.getByText('Mode')).toBeVisible()
    expect(screen.getByText('Speed')).toBeVisible()
  })

  it('reads chrome and control probes from rendered markup', () => {
    render(
      <ArrayItemAnatomyGrid
        fieldWidths={['md', 'auto']}
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
      </ArrayItemAnatomyGrid>,
    )

    const gripButton = document.querySelector('[data-array-item-anatomy-grip] button')
    const actionsButton = document.querySelector('[data-array-item-anatomy-actions] button')

    expect(gripButton).toBeTruthy()
    expect(actionsButton).toBeTruthy()

    stubRect(gripButton!, { top: 82, height: 24 })
    stubRect(actionsButton!, { top: 82, height: 24 })

    const probe = readAnatomyTrackProbe({
      controlFieldId: 'mode',
    })

    expect(probe.gripCenterY).toBe(94)
    expect(probe.actionsCenterY).toBe(94)
  })

  it('does not nest a second anatomy row grid inside the fields region', () => {
    render(
      <ArrayItemAnatomyGrid
        fieldWidths={['md', 'auto']}
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
      </ArrayItemAnatomyGrid>,
    )

    const grid = document.querySelector('[data-array-item-anatomy-grid]')
    expect(grid?.querySelector('[data-field-row-anatomy]')).toBeNull()
    expect(grid?.querySelector('.field-row-anatomy-grid')).toBeNull()
  })
})
