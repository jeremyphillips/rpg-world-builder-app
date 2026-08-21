import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DetailEntityRow } from '../row/entity/detail-entity-row.client'
import { DetailCollectionRowList } from './detail-collection-row-list.client'

describe('DetailCollectionRowList', () => {
  it('renders structural dividers between children without list padding', () => {
    const { container } = render(
      <DetailCollectionRowList separator="structural">
        <DetailEntityRow heading="First" />
        <DetailEntityRow heading="Second" />
      </DetailCollectionRowList>,
    )

    const list = container.firstElementChild
    expect(list).toHaveClass('[&>*+*]:border-t')
    expect(list).toHaveClass('[&>*+*]:border-border-subtle')
    expect(list).not.toHaveClass('px-4')
  })

  it('renders record dividers for list-item children', () => {
    const { container } = render(
      <DetailCollectionRowList separator="record">
        <ul>
          <li>First</li>
          <li>Second</li>
        </ul>
      </DetailCollectionRowList>,
    )

    const list = container.firstElementChild
    expect(list).toHaveClass('[&>li+li]:border-t')
    expect(list).toHaveClass('[&>li+li]:border-border-subtle')
  })
})
