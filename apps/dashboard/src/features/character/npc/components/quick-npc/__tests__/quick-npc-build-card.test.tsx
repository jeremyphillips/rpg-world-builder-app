import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../../lib/fixtures/character-builder-fixtures'
import { renderWithProviders } from '@/test/render'

import {
  QUICK_NPC_BUILD_CHANGE_CLASS_LABEL,
  QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL,
  QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER,
  QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL,
  QUICK_NPC_BUILD_FIELD_LABEL,
  QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
  resolveQuickNpcBuildCardModel,
} from '../../../lib/quick-npc/quick-npc-build-card.lib'
import { applyQuickNpcSetupValueChange } from '../../../lib/quick-npc/quick-npc-setup-value-change.lib'
import {
  isQuickNpcOrganizationMemberSetup,
  type QuickNpcOrganizationMemberSetupValues,
  type QuickNpcSetupValues,
} from '../../../lib/quick-npc/quick-npc-form-fields'
import {
  quickNpcMemberSetupValues,
  quickNpcMemberSetupWithNoTitle,
  quickNpcOrganizationMemberCreateContext,
  quickNpcTestOrganization,
} from '../../../lib/quick-npc/quick-npc-test-fixtures'
import { QuickNpcBuildCard } from '../quick-npc-build-card'

const createContext = quickNpcOrganizationMemberCreateContext(quickNpcTestOrganization)

function applySetupChange(args: {
  values: QuickNpcSetupValues
  setId: string
  nextValue: string | number
  context: ReturnType<typeof createCampaignNpcBuilderContextFixture>
  titles: (typeof guildmasterTitle)[]
  organizationClassAffinityIds?: readonly string[]
}) {
  const { values, setId, nextValue, ...rest } = args
  const previousValue =
    setId === 'speciesId'
      ? values.speciesId
      : setId === 'membershipTitle'
        ? isQuickNpcOrganizationMemberSetup(values)
          ? (values.membershipTitle ?? '')
          : ''
        : setId === 'classId'
          ? values.classId
          : values.level

  return applyQuickNpcSetupValueChange({
    values,
    event: { setId, previousValue, nextValue, invalidatedSetIds: [] },
    ...rest,
  })
}

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'criminal' as const, level: 9 },
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
    values?: QuickNpcOrganizationMemberSetupValues
    members?: { classAffinityIds?: readonly string[] }
  } = {},
) {
  const context = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [fighterClass, rogueClass],
    },
  })
  const values =
    overrides.values ??
    quickNpcMemberSetupValues({
      speciesId: 'srd-cc-5.2.1:dwarf',
      membershipTitle: 'omt_guildmaster',
      npcTemplateId: 'criminal',
      classId: rogueClass.id,
      level: 9,
    })
  const model = resolveQuickNpcBuildCardModel({
    createContext,
    context,
    values,
    titles: [guildmasterTitle],
    members: overrides.members ?? { classAffinityIds: [rogueClass.id] },
    organizationName: quickNpcTestOrganization.name,
  })

  if (!model) {
    throw new Error('expected build card model')
  }

  const onClassChange = vi.fn()
  const onLevelChange = vi.fn()

  renderWithProviders(
    <QuickNpcBuildCard
      model={model}
      onClassChange={onClassChange}
      onLevelChange={onLevelChange}
      onRoleChange={vi.fn()}
    />,
  )

  return { onClassChange, onLevelChange, model }
}

describe('QuickNpcBuildCard', () => {
  it('renders recommended build identity, class, level stepper, and provenance helpers', () => {
    renderBuildCard()

    expect(screen.getByText(QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL)).toBeInTheDocument()
    expect(screen.getByText('Criminal')).toBeInTheDocument()
    expect(screen.getByText('Rogue')).toBeInTheDocument()
    expect(screen.getAllByText('Suggested by Guildmaster.').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toBeInTheDocument()
  })

  it('renders build mode without template identity or title level helper', () => {
    const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
    const model = resolveQuickNpcBuildCardModel({
      createContext,
      context,
      values: quickNpcMemberSetupWithNoTitle({
        speciesId: 'srd-cc-5.2.1:dwarf',
        classId: '',
        level: 0,
      }),
      titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
      organizationName: quickNpcTestOrganization.name,
    })

    renderWithProviders(
      <QuickNpcBuildCard model={model!} onClassChange={vi.fn()} onLevelChange={vi.fn()} />,
    )

    expect(screen.getByText(QUICK_NPC_BUILD_FIELD_LABEL)).toBeInTheDocument()
    expect(screen.queryByText('Criminal')).not.toBeInTheDocument()
    expect(screen.queryByText(/Suggested by/)).not.toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toHaveValue(0)
  })

  it('expands class inside the class row and collapses after selection', async () => {
    const user = userEvent.setup()
    const { onClassChange } = renderBuildCard({
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'omt_guildmaster',
        npcTemplateId: 'criminal',
        classId: rogueClass.id,
        level: 9,
      }),
    })

    await user.click(screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_CLASS_LABEL }))
    expect(screen.getByRole('radio', { name: /fighter/i })).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /fighter/i }))
    expect(onClassChange).toHaveBeenCalledWith(fighterClass.id)
    expect(screen.queryByRole('radio', { name: /fighter/i })).not.toBeInTheDocument()
  })

  it('changes level via the always-visible stepper', async () => {
    const user = userEvent.setup()
    const { onLevelChange } = renderBuildCard()

    const levelInput = screen.getByRole('spinbutton', { name: 'Level' })
    await user.clear(levelInput)
    await user.type(levelInput, '7')
    expect(onLevelChange).toHaveBeenCalled()
  })

  it('shows class override helper when current class diverges', () => {
    renderBuildCard({
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'omt_guildmaster',
        npcTemplateId: 'criminal',
        classId: fighterClass.id,
        level: 9,
      }),
    })

    expect(screen.getByText('Lantern Guild suggests Rogue.')).toBeInTheDocument()
  })

  it('starts with class editor expanded when class is unresolved', () => {
    renderBuildCard({
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'omt_guildmaster',
        npcTemplateId: 'criminal',
        classId: '',
        level: 9,
      }),
      members: { classAffinityIds: [rogueClass.id, fighterClass.id] },
    })

    expect(screen.getByRole('radio', { name: /rogue/i })).toBeInTheDocument()
    expect(screen.queryByText(QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL)).not.toBeInTheDocument()
  })

  it('clears classId when level becomes 0', () => {
    const context = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [fighterClass, rogueClass],
      },
    })

    expect(
      applySetupChange({
        values: quickNpcMemberSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'omt_guildmaster',
          classId: rogueClass.id,
          level: 9,
        }),
        setId: 'level',
        nextValue: 0,
        context,
        titles: [guildmasterTitle],
        organizationClassAffinityIds: [rogueClass.id],
      }),
    ).toMatchObject({
      level: 0,
      classId: '',
    })
  })

  it('keeps the class row visible and non-interactive at level 0', async () => {
    const { onClassChange } = renderBuildCard({
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'omt_guildmaster',
        classId: '',
        level: 0,
      }),
    })

    expect(screen.getByText('CLASS')).toBeInTheDocument()
    expect(screen.getByText(QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL)).toBeInTheDocument()
    const helper = screen.getByText(QUICK_NPC_BUILD_CLASS_LEVEL_ZERO_HELPER)
    expect(helper).toHaveClass('text-sm')
    expect(
      screen.queryByRole('button', { name: QUICK_NPC_BUILD_CHANGE_CLASS_LABEL }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /rogue/i })).not.toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Level' })).toHaveValue(0)
    expect(onClassChange).not.toHaveBeenCalled()
  })

  it('restores interactive class behavior when level returns above 0', () => {
    const context = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [fighterClass, rogueClass],
      },
    })
    const members = { classAffinityIds: [rogueClass.id] }
    const baseValues = quickNpcMemberSetupValues({
      speciesId: 'srd-cc-5.2.1:dwarf',
      membershipTitle: 'omt_guildmaster',
      npcTemplateId: 'criminal',
      classId: '',
      level: 0,
    })

    function BuildCardAtLevel({ level }: { level: number }) {
      const values = applySetupChange({
        values: { ...baseValues, level: 0 },
        setId: 'level',
        nextValue: level,
        context,
        titles: [guildmasterTitle],
        organizationClassAffinityIds: members.classAffinityIds,
      })
      const model = resolveQuickNpcBuildCardModel({
        createContext,
        context,
        values,
        titles: [guildmasterTitle],
        members,
        organizationName: quickNpcTestOrganization.name,
      })

      if (!model) {
        throw new Error('expected build card model')
      }

      return (
        <QuickNpcBuildCard
          model={model}
          onClassChange={vi.fn()}
          onLevelChange={vi.fn()}
          onRoleChange={vi.fn()}
        />
      )
    }

    const { rerender } = renderWithProviders(<BuildCardAtLevel level={0} />)

    expect(screen.getByText(QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL)).toBeInTheDocument()

    rerender(<BuildCardAtLevel level={9} />)

    expect(screen.queryByText(QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL)).not.toBeInTheDocument()
    expect(screen.getByText('Rogue')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_CLASS_LABEL }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('radio', { name: /rogue/i })).not.toBeInTheDocument()
  })

  it('opens class editor when level returns above 0 with unresolved class', () => {
    const context = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [fighterClass, rogueClass],
      },
    })
    const members = { classAffinityIds: [rogueClass.id, fighterClass.id] }
    const baseValues = quickNpcMemberSetupValues({
      speciesId: 'srd-cc-5.2.1:dwarf',
      membershipTitle: 'omt_guildmaster',
      npcTemplateId: 'criminal',
      classId: '',
      level: 0,
    })

    function BuildCardAtLevel({ level }: { level: number }) {
      const values = applySetupChange({
        values: { ...baseValues, level: 0 },
        setId: 'level',
        nextValue: level,
        context,
        titles: [guildmasterTitle],
        organizationClassAffinityIds: members.classAffinityIds,
      })
      const model = resolveQuickNpcBuildCardModel({
        createContext,
        context,
        values,
        titles: [guildmasterTitle],
        members,
        organizationName: quickNpcTestOrganization.name,
      })

      if (!model) {
        throw new Error('expected build card model')
      }

      return (
        <QuickNpcBuildCard
          model={model}
          onClassChange={vi.fn()}
          onLevelChange={vi.fn()}
          onRoleChange={vi.fn()}
        />
      )
    }

    const { rerender } = renderWithProviders(<BuildCardAtLevel level={0} />)

    rerender(<BuildCardAtLevel level={9} />)

    expect(screen.queryByText(QUICK_NPC_BUILD_CHOOSE_CLASS_LABEL)).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /rogue/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /fighter/i })).toBeInTheDocument()
  })
})
