import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CharacterEquipmentQuantityLabel } from './character-equipment-quantity-label.client'

describe('CharacterEquipmentQuantityLabel', () => {
  it('omits the label for single-quantity items', () => {
    const { container } = render(<CharacterEquipmentQuantityLabel quantity={1} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('exposes an accessible quantity name', () => {
    render(<CharacterEquipmentQuantityLabel quantity={3} />)
    expect(screen.getByLabelText('Quantity 3')).toHaveTextContent('×3')
  })
})
