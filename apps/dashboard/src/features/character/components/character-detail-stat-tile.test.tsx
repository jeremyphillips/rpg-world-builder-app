import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CharacterDetailStatTile } from './character-detail-stat-tile.client'

describe('CharacterDetailStatTile', () => {
  it('renders the label, value, and optional caption', () => {
    render(<CharacterDetailStatTile label="Speed" value="30" caption="Walk" />)

    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('Walk')).toBeInTheDocument()
  })

  it('omits the caption row when not provided', () => {
    render(<CharacterDetailStatTile label="HP" value="11/11" />)

    expect(screen.getByText('HP')).toBeInTheDocument()
    expect(screen.getByText('11/11')).toBeInTheDocument()
    expect(screen.queryByText('Walk')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterDetailStatTile label="Strength" value="15" caption="+2" />,
    )

    await expectNoAxeViolations(container)
  })
})
