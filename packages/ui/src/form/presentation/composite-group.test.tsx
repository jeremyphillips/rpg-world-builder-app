import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { fieldAnatomyStackVariants, fieldLabelVariants } from '../../components/ui/field.variants'
import { CompositeGroup } from './composite-group.client'

describe('CompositeGroup', () => {
  it('applies the anatomy token between a leaf heading and its children', () => {
    const { container } = render(
      <CompositeGroup heading={{ label: 'Suggested ability scores', hint: 'Drag to reorder.' }}>
        <div>scores</div>
      </CompositeGroup>,
    )

    const fieldset = container.querySelector('fieldset')
    const legend = screen.getByText('Suggested ability scores').closest('legend')
    const hint = screen.getByText('Drag to reorder.')

    expect(fieldset).toHaveClass(...fieldAnatomyStackVariants({ size: 'md' }).split(/\s+/))
    expect(legend).toHaveClass('contents')
    expect(legend).not.toContainElement(hint)
    expect(fieldset).toHaveAttribute('aria-describedby', hint.id)
    expect(screen.getByRole('group', { name: 'Suggested ability scores' })).toBeInTheDocument()
  })

  it('keeps the column and drops header gap when the legend is sr-only', () => {
    const { container } = render(
      <CompositeGroup heading={{ label: 'Speed', labelVisibility: 'srOnly' }}>
        <div>body</div>
      </CompositeGroup>,
    )

    const fieldset = container.querySelector('fieldset')
    expect(screen.getByText('Speed').closest('legend')).toBeTruthy()
    expect(screen.getByText('Speed').closest('.sr-only')).toBeTruthy()
    expect(fieldset).toHaveClass('flex', 'flex-col')
    expect(fieldset?.className).not.toContain('gap-y-')
    expect(screen.getByText('body')).toBeInTheDocument()
  })

  it('matches Field.Label min-height on the leaf heading label line', () => {
    render(
      <CompositeGroup heading={{ label: 'Suggested ability scores', hint: 'Drag to reorder.' }}>
        <div>scores</div>
      </CompositeGroup>,
    )

    const labelLine = screen
      .getByText('Suggested ability scores')
      .closest('.text-style-field-label-md')
    expect(labelLine).toHaveClass(...fieldLabelVariants({ size: 'md' }).split(/\s+/))
  })

  it('places a trailing action beside a leaf label and hint', () => {
    render(
      <CompositeGroup
        heading={{
          label: 'Armor',
          hint: 'One suit of body armor.',
          action: <button type="button">Add armor</button>,
        }}
        useFieldset={false}
      >
        <div>empty</div>
      </CompositeGroup>,
    )

    const action = screen.getByRole('button', { name: 'Add armor' })
    expect(action.parentElement).toHaveClass('justify-self-end')
    expect(screen.getByRole('group', { name: /Armor/ })).toBeInTheDocument()
    expect(screen.getByText('One suit of body armor.')).toBeInTheDocument()
  })
})
