import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { beforeAll, describe, expect, it } from 'vitest'

import { pickEquipment } from '@/features/content'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../../lib/fixtures/character-builder-fixtures'
import { SAMPLE_PC } from '../../../lib/fixtures/character-fixtures'
import { buildCharacterSheetEquipmentCards } from '../../../lib/detail/character-sheet-catalog'
import { EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL } from '../../equipment/picker/drawer/equipment-picker-drawer.types'
import { CharacterDetailEquipmentTab } from './character-detail-equipment-tab'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
})

function buildEquipmentCards() {
  const context = createPopulatedStandaloneBuilderContextFixture()
  const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
  const dagger = pickEquipment('dagger')
  const chainMail = pickEquipment('chain-mail')

  return buildCharacterSheetEquipmentCards(
    {
      ...SAMPLE_PC,
      equipment: {
        ...SAMPLE_PC.equipment,
        weapons: [
          {
            entryId: 'weapon-1',
            equipmentId: dagger.id,
            quantity: 1,
            equipped: true,
            sources: [{ kind: 'manual' }],
          },
        ],
        armor: [
          {
            entryId: 'armor-1',
            equipmentId: chainMail.id,
            quantity: 1,
            sources: [{ kind: 'manual' }],
          },
        ],
      },
    },
    {
      ...catalogIndex,
      equipment: new Map([
        ...catalogIndex.equipment,
        [dagger.id, dagger],
        [chainMail.id, chainMail],
      ]),
    },
  )
}

describe('CharacterDetailEquipmentTab', () => {
  it('filters equipment rows with category chips and omits affordable checkbox', async () => {
    const user = userEvent.setup()
    const cards = buildEquipmentCards()

    render(
      <CharacterDetailEquipmentTab cards={cards} wealth={{ label: 'Wealth', value: '15 gp' }} />,
    )

    const list = screen.getByRole('list')
    expect(within(list).getByText('Dagger')).toBeInTheDocument()
    expect(within(list).getByText('Chain Mail')).toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Weapon' }))
    expect(within(list).getByText('Dagger')).toBeInTheDocument()
    expect(within(list).queryByText('Chain Mail')).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <CharacterDetailEquipmentTab
        cards={buildEquipmentCards()}
        wealth={{ label: 'Wealth', value: '15 gp' }}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
