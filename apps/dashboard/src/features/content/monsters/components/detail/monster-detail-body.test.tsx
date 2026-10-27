import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { pickEquipment, pickMonster, pickSkillProficiency } from '@/test/fixtures/pick'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => false),
}))

import { ContentDetailBody } from '../../../lib/detail/page/content-detail-body'
import { buildMonsterDetailViewModel, tryDeriveMonsterStatBlock } from '../../lib/monster-display'
import { MONSTER_DETAIL_DETAILS_LEAF_IDS } from '../../lib/monster-detail-sections'
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

  it('preserves legacy hash ids on detail metadata rows', () => {
    const { viewModel } = renderMonsterBody()

    for (const leaf of viewModel.detailsLeaves) {
      const domId =
        MONSTER_DETAIL_DETAILS_LEAF_IDS[leaf.id as keyof typeof MONSTER_DETAIL_DETAILS_LEAF_IDS] ??
        `monster-details-${leaf.id}`
      expect(document.getElementById(domId)).toBeInTheDocument()
    }
    expect(viewModel.detailsLeaves.length).toBeGreaterThan(0)
  })
})
