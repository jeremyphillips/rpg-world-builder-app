import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { pickEquipment, pickMonster, pickSkillProficiency } from '@/test/fixtures/pick'

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
  const actual = await importOriginal<typeof import('../../equipment/hooks/use-equipment')>()
  return {
    ...actual,
    useEquipment: vi.fn(),
  }
})
vi.mock('../../skill-proficiencies/hooks/use-skill-proficiencies', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../skill-proficiencies/hooks/use-skill-proficiencies')>()
  return {
    ...actual,
    useSkillProficiencies: vi.fn(),
  }
})

import { useEquipment } from '../../equipment/hooks/use-equipment'
import { useSkillProficiencies } from '../../skill-proficiencies/hooks/use-skill-proficiencies'
import { MonsterDetailContent } from './monster-detail'

const useEquipmentMock = vi.mocked(useEquipment)
const useSkillProficienciesMock = vi.mocked(useSkillProficiencies)

describe('MonsterDetailContent read-only', () => {
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

  it('renders derived stats without edit affordances for managers', () => {
    const monster = pickMonster('kobold-warrior')

    render(
      <MemoryRouter>
        <MonsterDetailContent monster={monster} campaignId="camp_1" monsterId={monster.id} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Kobold Warrior' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^edit$/i })).not.toBeInTheDocument()
    expect(screen.getByText(/Pack Tactics/)).toBeInTheDocument()
  })
})
