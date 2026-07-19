import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'

import { pickSpell } from '@/features/content/lib/fixtures/pick'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../lib/character-builder-fixtures'
import { SAMPLE_PC } from '../../lib/character-fixtures'
import { buildCharacterSheetSpellCards } from '../../lib/detail/character-sheet-catalog'
import { CharacterDetailSpellsTab } from './character-detail-spells-tab.client'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
})

function buildSpellCards() {
  const context = createPopulatedStandaloneBuilderContextFixture()
  const baseCatalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
  const cantrip = pickSpell('fire-bolt')
  const firstLevel = pickSpell('magic-missile')
  const catalogIndex = {
    ...baseCatalogIndex,
    spells: new Map([
      ...baseCatalogIndex.spells,
      [cantrip.id, cantrip],
      [firstLevel.id, firstLevel],
    ]),
  }

  return buildCharacterSheetSpellCards(
    {
      ...SAMPLE_PC,
      spells: [
        {
          spellId: cantrip.id,
          sources: [
            {
              kind: 'classSpellcasting' as const,
              sourceId: 'srd-cc-5.2.1:wizard',
              grantId: 'cantrips',
            },
          ],
          access: { classKnown: true },
          selection: { prepared: true },
        },
        {
          spellId: firstLevel.id,
          sources: [
            {
              kind: 'classSpellcasting' as const,
              sourceId: 'srd-cc-5.2.1:wizard',
              grantId: 'prepared',
            },
          ],
          access: { classKnown: true },
          selection: { prepared: true },
        },
      ],
    },
    catalogIndex,
  )
}

describe('CharacterDetailSpellsTab', () => {
  it('shows unified level chips for present levels and filters the list', async () => {
    const user = userEvent.setup()
    const cards = buildSpellCards()

    render(<CharacterDetailSpellsTab cards={cards} />)

    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '0' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '1' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Spell school' })).not.toBeInTheDocument()

    const list = screen.getByRole('list')
    expect(within(list).getByText('Fire Bolt')).toBeInTheDocument()
    expect(within(list).getByText('Magic Missile')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: '0' }))
    expect(within(list).getByText('Fire Bolt')).toBeInTheDocument()
    expect(within(list).queryByText('Magic Missile')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<CharacterDetailSpellsTab cards={buildSpellCards()} />)

    await expectNoAxeViolations(container)
  })
})
