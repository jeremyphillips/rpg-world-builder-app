import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PageChromeActionsProvider } from '@/components/layout/page-chrome/page-chrome-actions-provider'
import { PageChromeActionsContext } from '@/components/layout/page-chrome/page-chrome-actions-context'
import { useContext } from 'react'

import { pickEquipment, pickMonster, pickSkillProficiency } from '@/test/fixtures/pick'

import type * as UseEquipmentModule from '../../equipment/hooks/use-equipment'
import type * as UseSkillProficienciesModule from '../../skill-proficiencies/hooks/use-skill-proficiencies'

vi.mock('@/components/layout/breadcrumb/use-breadcrumb-label', () => ({
  useSetBreadcrumbLabel: vi.fn(),
}))
vi.mock('../../lib/usage/content-usage-references-section', () => ({
  ContentUsageReferencesSection: () => null,
}))
vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(() => true),
}))
vi.mock('../../equipment/hooks/use-equipment', async (importOriginal) => {
  const actual = await importOriginal<typeof UseEquipmentModule>()
  return {
    ...actual,
    useEquipment: vi.fn(),
  }
})
vi.mock('../hooks/use-monsters', () => ({
  useMonsters: vi.fn(),
}))
vi.mock('../../skill-proficiencies/hooks/use-skill-proficiencies', async (importOriginal) => {
  const actual = await importOriginal<typeof UseSkillProficienciesModule>()
  return {
    ...actual,
    useSkillProficiencies: vi.fn(),
  }
})

import { formatContentNotFoundMessage } from '../../lib/content-type-labels'
import { useEquipment } from '../../equipment/hooks/use-equipment'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { useMonsters } from '../hooks/use-monsters'
import { MonsterDetail, MonsterDetailContent } from './monster-detail'

const useEquipmentMock = vi.mocked(useEquipment)
const useSkillProficienciesMock = vi.mocked(useSkillProficiencies)
const useMonstersMock = vi.mocked(useMonsters)

describe('MonsterDetailContent authoring', () => {
  beforeEach(() => {
    useEquipmentMock.mockReturnValue({
      data: [pickEquipment('dagger')],
      isPending: false,
      isError: false,
    } as ReturnType<typeof useEquipment>)
    useSkillProficienciesMock.mockReturnValue({
      data: [pickSkillProficiency('perception')],
      isPending: false,
      isError: false,
    } as ReturnType<typeof useSkillProficiencies>)
  })

  it('renders derived stats and an edit affordance for managers', () => {
    const monster = pickMonster('kobold-warrior')

    function Probe() {
      const actions = useContext(PageChromeActionsContext)?.actions
      return <div data-testid="page-chrome-actions">{actions}</div>
    }

    render(
      <MemoryRouter>
        <PageChromeActionsProvider>
          <Probe />
          <MonsterDetailContent monster={monster} campaignId="camp_1" monsterId={monster.id} />
        </PageChromeActionsProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Kobold Warrior' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^edit$/i })).toHaveAttribute(
      'href',
      `/campaigns/camp_1/monsters/${monster.id}/edit`,
    )
    expect(screen.getByText(/Pack Tactics/)).toBeInTheDocument()
  })
})

describe('MonsterDetail list resolution', () => {
  it('shows not found when the monster id is absent from the campaign list', () => {
    useMonstersMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useMonsters>)

    render(
      <MemoryRouter initialEntries={['/campaigns/camp_1/monsters/srd-cc-5.2.1:kobold-warrior']}>
        <Routes>
          <Route path="/campaigns/:campaignId/monsters/:monsterId" element={<MonsterDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(formatContentNotFoundMessage('monsters'))
  })
})
