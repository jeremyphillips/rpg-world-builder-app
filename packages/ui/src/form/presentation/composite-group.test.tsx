import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  fieldAnatomyStackVariants,
  fieldLabelHintStackClasses,
  fieldLabelVariants,
} from '../../components/ui/field.variants'
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
    const labelCluster = screen.getByText('Suggested ability scores').closest('div')?.parentElement

    expect(fieldset).toHaveClass(...fieldAnatomyStackVariants({ size: 'md' }).split(/\s+/))
    expect(legend).toHaveClass('contents')
    expect(labelCluster).toHaveClass(...fieldLabelHintStackClasses.split(/\s+/))
    expect(legend).toContainElement(screen.getByText('Drag to reorder.'))
  })

  it('keeps the column and drops header gap when the legend is sr-only', () => {
    const { container } = render(
      <CompositeGroup heading={{ label: 'Speed', labelVisibility: 'srOnly' }}>
        <div>body</div>
      </CompositeGroup>,
    )

    const fieldset = container.querySelector('fieldset')
    const legend = screen.getByText('Speed').closest('legend')
    expect(legend).toHaveClass('sr-only')
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

    const labelLine = screen.getByText('Suggested ability scores').closest('div')
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
