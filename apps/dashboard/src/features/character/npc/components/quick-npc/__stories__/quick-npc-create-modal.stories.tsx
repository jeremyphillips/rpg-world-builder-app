import type { OrganizationMembershipTitleDefinition } from '@rpg/contracts'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withDashboardProviders } from '../../../../../../../.storybook/decorators'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../../lib/fixtures/character-builder-fixtures'
import { QUICK_NPC_CLASS_ALL_GROUP_EYEBROW } from '../../../lib/quick-npc/quick-npc-class-option-groups.lib'
import { QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL } from '../../../lib/quick-npc/quick-npc-build-card.lib'
import { QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL } from '../../../lib/quick-npc/quick-npc-build-card.lib'
import {
  QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION,
  QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE,
  QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
  QUICK_NPC_STANDALONE_SETUP_DESCRIPTION,
  QUICK_NPC_STANDALONE_SETUP_HEADLINE,
  QUICK_NPC_TITLE_FIELD_PROMPT,
} from '../../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import {
  quickNpcOrganizationMemberCreateContext,
  quickNpcStandaloneCreateContext,
} from '../../../lib/quick-npc/quick-npc-test-fixtures'
import { QuickNpcCreateModal } from '../quick-npc-create-modal'

const organization = {
  id: 'organization-thieves-guild',
  name: "Thieves' Guild",
  organizationDomain: 'criminal' as const,
}

const guildmasterTitle: OrganizationMembershipTitleDefinition = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50,
  npcRecommendation: { templateId: 'covert_operator', level: 9 },
}

const quickFighter = {
  ...populatedBuilderCatalog.classes[0]!,
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
}

const rogueClass = {
  ...populatedBuilderCatalog.classes[0]!,
  id: 'srd-cc-5.2.1:rogue',
  slug: 'rogue',
  name: 'Rogue',
}

function buildOrganizationCatalog(args: {
  classAffinityIds?: string[]
  titles?: OrganizationMembershipTitleDefinition[]
}) {
  return createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [quickFighter, rogueClass],
      organizations: [
        {
          id: organization.id,
          slug: 'thieves-guild',
          rulesetId: 'srd-cc-5.2.1',
          source: 'homebrew',
          status: 'published',
          campaignId: 'campaign-test-1',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          name: organization.name,
          organizationDomain: organization.organizationDomain,
          functions: [],
          practices: [],
          members: {
            classAffinityIds: args.classAffinityIds ?? [rogueClass.id],
            speciesAffinityIds: [],
            titles: args.titles ?? [guildmasterTitle],
          },
          connections: { locations: [] },
        },
      ],
    },
  })
}

const meta = {
  title: 'Dashboard/Character/QuickNpcCreateModal',
  component: QuickNpcCreateModal,
  decorators: [withDashboardProviders],
  args: {
    open: true,
    onOpenChange: () => undefined,
    campaignId: 'campaign-test-1',
    buildContext: buildOrganizationCatalog({}),
    context: quickNpcOrganizationMemberCreateContext({
      ...organization,
      members: {
        classAffinityIds: [rogueClass.id],
        speciesAffinityIds: [],
        titles: [guildmasterTitle],
      },
    }),
    onCancel: () => undefined,
    onCreated: () => undefined,
  },
} satisfies Meta<typeof QuickNpcCreateModal>

export default meta
type Story = StoryObj<typeof meta>

export const TitleFirst: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText(QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE)).toBeVisible()
    await expect(canvas.getByText(QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION)).toBeVisible()
    await expect(canvas.getByText(QUICK_NPC_TITLE_FIELD_PROMPT)).toBeVisible()
    expect(canvas.queryByRole('radio', { name: /dwarf/i })).not.toBeInTheDocument()
    expect(canvas.queryByText(QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL)).not.toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled()
  },
}

export const GuildmasterSingleRecommendation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('radio', { name: /guildmaster/i }))
    await userEvent.click(canvas.getByRole('radio', { name: /dwarf/i }))

    await expect(canvas.getByText(QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL)).toBeVisible()
    await expect(canvas.getByText('Covert operator')).toBeVisible()
    await expect(canvas.getByText(/Recommended for Guildmaster: Level 9\./)).toBeVisible()
    await expect(canvas.getByText('Rogue')).toBeVisible()
    expect(canvas.queryByRole('radio', { name: /rogue/i })).not.toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled()
  },
}

export const MultipleClassRecommendations: Story = {
  args: {
    buildContext: buildOrganizationCatalog({
      classAffinityIds: [rogueClass.id, quickFighter.id],
    }),
    context: quickNpcOrganizationMemberCreateContext({
      ...organization,
      members: {
        classAffinityIds: [rogueClass.id, quickFighter.id],
        speciesAffinityIds: [],
        titles: [],
      },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('radio', { name: /no title/i }))
    await userEvent.click(canvas.getByRole('radio', { name: /dwarf/i }))
    await userEvent.click(canvas.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }))
    const levelInput = canvas.getByRole('spinbutton', { name: 'Level' })
    await userEvent.clear(levelInput)
    await userEvent.type(levelInput, '1')

    await expect(canvas.getByText('Recommended')).toBeVisible()
    await expect(canvas.getByText(QUICK_NPC_CLASS_ALL_GROUP_EYEBROW)).toBeVisible()
    await expect(canvas.getByRole('radio', { name: /rogue/i })).toBeVisible()
    await expect(canvas.getByRole('radio', { name: /fighter/i })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled()
  },
}

export const Authoring: Story = {
  args: {
    buildContext: buildOrganizationCatalog({ titles: [] }),
    context: quickNpcOrganizationMemberCreateContext({
      ...organization,
      members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('radio', { name: /no title/i }))
    await userEvent.click(canvas.getByRole('radio', { name: /dwarf/i }))
    await userEvent.click(canvas.getByRole('button', { name: QUICK_NPC_BUILD_CHANGE_LEVEL_LABEL }))
    const levelInput = canvas.getByRole('spinbutton', { name: 'Level' })
    await userEvent.clear(levelInput)
    await userEvent.type(levelInput, '1')
    const fighter = canvas.queryByRole('radio', { name: /fighter/i })
    if (fighter && fighter.getAttribute('aria-checked') !== 'true') {
      await userEvent.click(fighter)
    }
    await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
    await expect(canvas.getByText("Create a new NPC as a member of Thieves' Guild.")).toBeVisible()
  },
}

const standaloneBuildContext = createCampaignNpcBuilderContextFixture({
  catalog: populatedBuilderCatalog,
})

const standaloneBuildContextMinLevelOne = createCampaignNpcBuilderContextFixture({
  catalog: populatedBuilderCatalog,
  characterCreationRules: {
    ...createCampaignNpcBuilderContextFixture().characterCreationRules,
    levelZeroNpcs: {
      ...createCampaignNpcBuilderContextFixture().characterCreationRules.levelZeroNpcs,
      enabled: false,
    },
  },
})

export const StandaloneSpeciesFirst: Story = {
  args: {
    buildContext: standaloneBuildContext,
    context: quickNpcStandaloneCreateContext(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)

    await expect(canvas.getByText(QUICK_NPC_STANDALONE_SETUP_HEADLINE)).toBeVisible()
    await expect(canvas.getByText(QUICK_NPC_STANDALONE_SETUP_DESCRIPTION)).toBeVisible()
    expect(canvas.queryByText(QUICK_NPC_TITLE_FIELD_PROMPT)).not.toBeInTheDocument()
    expect(canvas.queryByText(QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION)).not.toBeInTheDocument()
    expect(canvas.queryByText(QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL)).not.toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled()
  },
}

export const StandaloneLevelZeroPath: Story = {
  args: {
    buildContext: standaloneBuildContext,
    context: quickNpcStandaloneCreateContext(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('radio', { name: /dwarf/i }))
    await expect(canvas.getByText(QUICK_NPC_BUILD_CLASS_NOT_APPLICABLE_LABEL)).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled()
  },
}

export const StandaloneClassGatePath: Story = {
  args: {
    buildContext: standaloneBuildContextMinLevelOne,
    context: quickNpcStandaloneCreateContext(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)

    await userEvent.click(canvas.getByRole('radio', { name: /dwarf/i }))
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeDisabled()
    await userEvent.click(canvas.getByRole('radio', { name: /fighter/i }))
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled()
  },
}
