import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { pickEquipment, pickMonster, pickSkillProficiency } from '@/test/fixtures/pick'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))

import { ContentDetailBody } from '../../../lib/detail/page/content-detail-body'
import { buildMonsterDetailViewModel, tryDeriveMonsterStatBlock } from '../../lib/monster-display'
import { MONSTER_DETAIL_SECTION_IDS } from '../../lib/monster-detail-sections'
import { MonsterDetailBody } from './monster-detail-body'

beforeAll(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

function buildKoboldViewModel() {
  const monster = pickMonster('kobold-warrior')
  const equipment = [pickEquipment('dagger')]
  const skills = [pickSkillProficiency('perception')]
  const derived = tryDeriveMonsterStatBlock(monster, equipment, skills)
  const viewModel = buildMonsterDetailViewModel({
    monster,
    creatureTypeLabel: 'Humanoid',
    equipmentById: new Map(equipment.map((item) => [item.id, item])),
    catalogState: 'ready',
    derived,
  })
  return { monster, viewModel }
}

function renderMonsterBody() {
  const { monster, viewModel } = buildKoboldViewModel()

  return {
    viewModel,
    ...render(
      <MemoryRouter>
        <ContentDetailBody>
          <MonsterDetailBody
            name={monster.name}
            imageName={monster.name}
            campaignId="camp_1"
            viewModel={viewModel}
            pageShell={false}
          />
        </ContentDetailBody>
      </MemoryRouter>,
    ),
  }
}

describe('MonsterDetailBody details section', () => {
  it('registers Details in nav but not former metadata leaves', async () => {
    renderMonsterBody()

    expect(screen.getByRole('link', { name: 'Details' })).toBeInTheDocument()
    screen.getByRole('link', { name: 'Details' }).click()
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Skills' })).not.toBeInTheDocument()
    })
    expect(screen.queryByRole('link', { name: 'Senses' })).not.toBeInTheDocument()
  })

  it('keeps Details as the only metadata anchor', () => {
    const { container, viewModel } = renderMonsterBody()

    expect(viewModel.detailsLeaves.length).toBeGreaterThan(0)
    expect(document.getElementById(MONSTER_DETAIL_SECTION_IDS.details)).toBeInTheDocument()
    for (const leaf of viewModel.detailsLeaves) {
      expect(document.getElementById(leaf.id)).toBeNull()
      expect(document.getElementById(`monster-details-${leaf.id}`)).toBeNull()
    }

    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('MonsterDetailBody reactions', () => {
  it('renders Trigger and Response for an authored reaction', () => {
    const monster = {
      ...pickMonster('kobold-warrior'),
      reactions: [
        {
          id: 'parry',
          kind: 'special' as const,
          name: 'Parry',
          description: '<p>Adds 2 to AC.</p>',
          trigger: { text: 'When hit by a melee attack' },
        },
      ],
    }
    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Humanoid',
      equipmentById: new Map(),
      catalogState: 'ready',
      derived: null,
    })

    render(
      <MemoryRouter>
        <MonsterDetailBody
          name={monster.name}
          imageName={monster.name}
          campaignId="camp_1"
          viewModel={viewModel}
          pageShell={false}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Trigger: When hit by a melee attack')).toBeInTheDocument()
    expect(screen.getByText('Response:')).toBeInTheDocument()
    expect(screen.getByText('Adds 2 to AC.')).toBeInTheDocument()
  })
})

describe('MonsterDetailBody catalog footer', () => {
  it('keeps the derivation sentence when both catalogs loaded', () => {
    const { monster, viewModel } = buildKoboldViewModel()

    render(
      <MemoryRouter>
        <MonsterDetailBody
          name={monster.name}
          imageName={monster.name}
          campaignId="camp_1"
          viewModel={{ ...viewModel, catalogState: 'error', abilities: [], statRows: [] }}
          pageShell={false}
        />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Some mechanical details could not be resolved from campaign catalogs.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('names only the catalogs passed for an initial load failure', () => {
    const { monster, viewModel } = buildKoboldViewModel()

    render(
      <MemoryRouter>
        <MonsterDetailBody
          name={monster.name}
          imageName={monster.name}
          campaignId="camp_1"
          viewModel={{ ...viewModel, catalogState: 'error', abilities: [], statRows: [] }}
          catalogLoadErrors={['equipment']}
          pageShell={false}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load equipment.')
    expect(
      screen.queryByText('Some mechanical details could not be resolved from campaign catalogs.'),
    ).not.toBeInTheDocument()
  })
})
