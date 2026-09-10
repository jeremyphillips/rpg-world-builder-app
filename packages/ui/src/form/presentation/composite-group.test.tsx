import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  fieldAnatomyStackVariants,
  fieldLabelHintStackClasses,
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
    const heading = screen.getByText('Suggested ability scores').closest('legend')

    expect(fieldset).toHaveClass(...fieldAnatomyStackVariants({ size: 'md' }).split(/\s+/))
    expect(heading).toHaveClass(...fieldLabelHintStackClasses.split(/\s+/))
    expect(heading).toContainElement(screen.getByText('Drag to reorder.'))
  })
})
