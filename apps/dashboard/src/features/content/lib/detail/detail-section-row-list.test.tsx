import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DetailEntityRow } from './detail-entity-row.client'
import { DetailSectionRowList } from './detail-section-row-list.client'

describe('DetailSectionRowList', () => {
  it('renders dividers between children without list padding', () => {
    const { container } = render(
      <DetailSectionRowList separator="structural">
        <DetailEntityRow heading="First" />
        <DetailEntityRow heading="Second" />
      </DetailSectionRowList>,
    )

    const list = container.firstElementChild
    expect(list).toHaveClass('[&>*+*]:border-t')
    expect(list).toHaveClass('[&>*+*]:border-border-subtle')
    expect(list).not.toHaveClass('px-4')
  })
})
