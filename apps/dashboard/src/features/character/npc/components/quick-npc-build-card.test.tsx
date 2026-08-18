import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { renderWithProviders } from '@/test/render'

import {
  QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL,
  QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL,
  QUICK_NPC_BUILD_DONE_LABEL,
  QUICK_NPC_BUILD_FIELD_LABEL,
  QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
  resolveQuickNpcBuildCardModel,
} from '../lib/quick-npc-build-card.lib'
import { QuickNpcBuildCard } from './quick-npc-build-card.client'

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'covert_operator' as const, level: 9 },
} as const

const rogueClass = {
  ...populatedBuilderCatalog.classes[0]!,
  id: 'srd-cc-5.2.1:rogue',
  slug: 'rogue',
  name: 'Rogue',
}

const fighterClass = {
  ...populatedBuilderCatalog.classes[0]!,
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  name: 'Fighter',
}

function renderBuildCard(
  overrides: {
    values?: {
      speciesId: string
      membershipTitle: string | undefined
      classId: string
      level: number
    }
    members?: { classAffinityIds?: readonly string[] }
  } = {},
) {
  const context = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [fighterClass, rogueClass],
    },
  })
  const values = overrides.values ?? {
    speciesId: 'srd-cc-5.2.1:dwarf',
    membershipTitle: 'Guildmaster',
    classId: rogueClass.id,
    level: 9,
  }
  const model = resolveQuickNpcBuildCardModel({
    context,
    values,
    titles: [guildmasterTitle],
    members: overrides.members ?? { classAffinityIds: [rogueClass.id] },
  })

  if (!model) {
    throw new Error('expected build card model')
  }

  const onClassChange = vi.fn()
  const onLevelChange = vi.fn()

  renderWithProviders(
    <QuickNpcBuildCard model={model} onClassChange={onClassChange} onLevelChange={onLevelChange} />,
  )

  return { onClassChange, onLevelChange, model }
}

describe('QuickNpcBuildCard', () => {
  it('renders recommended build identity, class, and level inside one card', () => {
    renderBuildCard()

    expect(screen.getByText(QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL)).toBeInTheDocument()
    expect(screen.getByText('Covert operator')).toBeInTheDocument()
    expect(screen.getByText('Rogue')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText(/Recommended for Guildmaster: Level 9\./)).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Level' })).not.toBeInTheDocument()
  })

  it('renders build mode without template identity or recommended level helper', () => {
    const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
    const model = resolveQuickNpcBuildCardModel({
      context,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        classId: '',
        level: 0,
      },
      titles: [],
    })

    renderWithProviders(
      <QuickNpcBuildCard model={model!} onClassChange={vi.fn()} onLevelChange={vi.fn()} />,
    )

    expect(screen.getByText(QUICK_NPC_BUILD_FIELD_LABEL)).toBeInTheDocument()
    expect(screen.queryByText('Covert operator')).not.toBeInTheDocument()
    expect(screen.queryByText(/Recommended for/)).not.toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('expands class inside the class row and collapses after selection', async () => {
    const user = userEvent.setup()
    const { onClassChange } = renderBuildCard({
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: rogueClass.id,
        level: 9,
      },
    })

    await user.click(screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_CLASS_LABEL }))
    expect(screen.getByRole('radio', { name: /fighter/i })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /fighter/i }))
    expect(onClassChange).toHaveBeenCalledWith(fighterClass.id)
    expect(screen.queryByRole('radio', { name: /fighter/i })).not.toBeInTheDocument()
  })

  it('expands level inside the level row and collapses with Done', async () => {
    const user = userEvent.setup()
    const { onLevelChange } = renderBuildCard()

    await user.click(screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }))
    const levelInput = screen.getByRole('spinbutton', { name: 'Level' })
    expect(levelInput).toBeInTheDocument()

    await user.clear(levelInput)
    await user.type(levelInput, '7')
    expect(onLevelChange).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: QUICK_NPC_BUILD_DONE_LABEL }))
    expect(screen.queryByRole('spinbutton', { name: 'Level' })).not.toBeInTheDocument()
  })

  it('opens only one editor at a time', async () => {
    const user = userEvent.setup()
    renderBuildCard({
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: rogueClass.id,
        level: 9,
      },
    })

    await user.click(screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_CLASS_LABEL }))
    expect(screen.getByRole('radio', { name: /fighter/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }))
    expect(screen.queryByRole('radio', { name: /fighter/i })).not.toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
  })

  it('shows class recommendation helper when current class diverges', () => {
    renderBuildCard({
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: fighterClass.id,
        level: 9,
      },
    })

    expect(screen.getByText('Recommended: Rogue')).toBeInTheDocument()
  })

  it('starts with class editor expanded when class is unresolved', () => {
    renderBuildCard({
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 9,
      },
      members: { classAffinityIds: [rogueClass.id, fighterClass.id] },
    })

    expect(screen.getByRole('radio', { name: /rogue/i })).toBeInTheDocument()
    expect(screen.queryByText(QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL)).not.toBeInTheDocument()
  })

  it('omits the class row at level 0', () => {
    const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
    const model = resolveQuickNpcBuildCardModel({
      context,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 0,
      },
      titles: [guildmasterTitle],
    })

    renderWithProviders(
      <QuickNpcBuildCard model={model!} onClassChange={vi.fn()} onLevelChange={vi.fn()} />,
    )

    expect(
      screen.queryByRole('button', { name: QUICK_NPC_BUILD_CHANGE_CLASS_LABEL }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }),
    ).toBeInTheDocument()
  })
})
