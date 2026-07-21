import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { CharacterDetailStatTile } from './character-detail-stat-tile.client'

describe('CharacterDetailStatTile', () => {
  it('renders the label, value, and meta footer', () => {
    render(
      <CharacterDetailStatTile label="Speed" value="30" footer={{ kind: 'meta', text: 'Walk' }} />,
    )

    expect(screen.getByText('Speed')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('Walk')).toBeInTheDocument()
  })

  it('renders a label footer and reserves footer space when empty', () => {
    render(
      <CharacterDetailStatTile
        label="Proficiency"
        value="+2"
        footer={{ kind: 'label', text: 'Bonus' }}
      />,
    )

    expect(screen.getByText('Proficiency')).toBeInTheDocument()
    expect(screen.getByText('Bonus')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('renders the hit points variant in a single tile', () => {
    render(
      <CharacterDetailStatTile
        variant="hitPoints"
        label="Hit points"
        hitPoints={{ current: '11', max: '11', temporary: '—' }}
      />,
    )

    expect(screen.getByText('Hit points')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
    expect(screen.getByText('Temp')).toBeInTheDocument()
    expect(screen.getAllByText('11')).toHaveLength(2)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterDetailStatTile label="Strength" value="15" footer={{ kind: 'meta', text: '+2' }} />,
    )

    await expectNoAxeViolations(container)
  })
})
