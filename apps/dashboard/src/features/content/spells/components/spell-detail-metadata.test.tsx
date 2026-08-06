import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { pickSpell } from '../../lib/fixtures/pick'
import { buildSpellDetailViewModel } from '../lib/spell-display'
import { SpellDetailMetadata } from './spell-detail-metadata.client'

const cureWounds = buildSpellDetailViewModel(pickSpell('cure-wounds'))

describe('SpellDetailMetadata', () => {
  it('renders stat rows and description html for picker surfaces', () => {
    render(<SpellDetailMetadata viewModel={cureWounds} />)

    expect(screen.getByText(/^Components$/)).toBeInTheDocument()
    expect(screen.getByText(/2d8 plus your spellcasting ability modifier/i)).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(<SpellDetailMetadata viewModel={cureWounds} />)

    await expectNoAxeViolations(container)
  })
})
