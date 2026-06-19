import { Text } from '@rpg/ui'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { ContentDetailResolver } from './content-detail-resolver'

type TestItem = { id: string; name: string }

const ITEMS: TestItem[] = [
  { id: 'item-1', name: 'First' },
  { id: 'item-2', name: 'Second' },
]

describe('ContentDetailResolver', () => {
  it('renders the loading state', () => {
    render(
      <ContentDetailResolver
        isPending={true}
        isError={false}
        items={ITEMS}
        itemId="item-1"
        loadErrorLabel="Could not load items."
        notFoundLabel="Item not found."
      >
        {(item) => <Text>{item.name}</Text>}
      </ContentDetailResolver>,
    )
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByText('First')).not.toBeInTheDocument()
  })

  it('renders the error state with role="alert"', () => {
    render(
      <ContentDetailResolver
        isPending={false}
        isError={true}
        items={ITEMS}
        itemId="item-1"
        loadErrorLabel="Could not load items."
        notFoundLabel="Item not found."
      >
        {(item) => <Text>{item.name}</Text>}
      </ContentDetailResolver>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load items.')
    expect(screen.queryByText('First')).not.toBeInTheDocument()
  })

  it('renders the not-found state with role="alert"', () => {
    render(
      <ContentDetailResolver
        isPending={false}
        isError={false}
        items={ITEMS}
        itemId="missing"
        loadErrorLabel="Could not load items."
        notFoundLabel="Item not found."
      >
        {(item) => <Text>{item.name}</Text>}
      </ContentDetailResolver>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Item not found.')
    expect(screen.queryByText('First')).not.toBeInTheDocument()
  })

  it('renders the ready state via the render prop', () => {
    render(
      <ContentDetailResolver
        isPending={false}
        isError={false}
        items={ITEMS}
        itemId="item-1"
        loadErrorLabel="Could not load items."
        notFoundLabel="Item not found."
      >
        {(item) => <Text>{item.name}</Text>}
      </ContentDetailResolver>,
    )
    expect(screen.getByText('First')).toBeInTheDocument()
  })
})
