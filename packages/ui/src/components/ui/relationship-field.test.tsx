import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RelationshipField } from './relationship-field.client'

describe('RelationshipField', () => {
  it('renders array-aligned empty state and a single outline add control', () => {
    const onSelect = vi.fn()

    render(
      <RelationshipField
        id="links"
        label="Links"
        itemCount={0}
        emptyLabel="No links yet."
        addAction={{ label: 'Add link', onSelect }}
        items={[]}
        getItemKey={(item: { id: string; label: string }) => item.id}
        renderRow={() => null}
        picker={null}
      />,
    )

    expect(screen.getByText('No links yet.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Add link' })).toHaveLength(1)
  })

  it('renders populated rows with the add control below the list', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(
      <RelationshipField
        id="links"
        label="Links"
        itemCount={1}
        emptyLabel="No links yet."
        addAction={{ label: 'Add link', onSelect }}
        items={[{ id: 'edge-1', label: 'Alpha' }]}
        getItemKey={(item: { id: string; label: string }) => item.id}
        renderRow={(item: { id: string; label: string }) => <span>{item.label}</span>}
        picker={null}
      />,
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('No links yet.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add link' }))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
