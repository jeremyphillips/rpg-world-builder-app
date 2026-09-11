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

  it('matches Field.Label min-height on the leaf heading label line', () => {
    render(
      <CompositeGroup heading={{ label: 'Suggested ability scores', hint: 'Drag to reorder.' }}>
        <div>scores</div>
      </CompositeGroup>,
    )

    const labelLine = screen.getByText('Suggested ability scores').closest('div')
    expect(labelLine).toHaveClass(...fieldLabelVariants({ size: 'md' }).split(/\s+/))
  })
})
