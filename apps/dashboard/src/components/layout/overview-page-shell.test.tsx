import { Text } from '@rpg/ui'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { OverviewPageShell } from './overview-page-shell'

describe('OverviewPageShell', () => {
  it('renders the loading state', () => {
    render(
      <OverviewPageShell heading="NPCs" isPending={true} isError={false}>
        <Text>Ready content</Text>
      </OverviewPageShell>,
    )
    expect(screen.getByRole('heading', { name: 'NPCs' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByText('Ready content')).not.toBeInTheDocument()
  })

  it('renders the error state with role="alert"', () => {
    render(
      <OverviewPageShell heading="NPCs" isPending={false} isError={true}>
        <Text>Ready content</Text>
      </OverviewPageShell>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load npcs.')
    expect(screen.queryByText('Ready content')).not.toBeInTheDocument()
  })

  it('renders ready children and custom actions', () => {
    render(
      <OverviewPageShell
        heading="NPCs"
        isPending={false}
        isError={false}
        actions={<button type="button">Create NPC</button>}
      >
        <Text>Ready content</Text>
      </OverviewPageShell>,
    )
    expect(screen.getByText('Ready content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create NPC' })).toBeInTheDocument()
  })
})
