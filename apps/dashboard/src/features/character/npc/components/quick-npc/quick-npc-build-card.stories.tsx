import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../../.storybook/decorators'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import { resolveQuickNpcBuildCardModel } from '../../lib/quick-npc/quick-npc-build-card.lib'
import {
  quickNpcMemberSetupValues,
  quickNpcMemberSetupWithNoTitle,
  quickNpcOrganizationMemberCreateContext,
  quickNpcTestOrganization,
} from '../../lib/quick-npc/quick-npc-test-fixtures'
import { QuickNpcBuildCard } from './quick-npc-build-card'

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

const context = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    classes: [fighterClass, rogueClass],
  },
})

const createContext = quickNpcOrganizationMemberCreateContext(quickNpcTestOrganization)

const meta = {
  title: 'Dashboard/Character/QuickNpcBuildCard',
  component: QuickNpcBuildCard,
  decorators: [withDashboardProviders],
  args: {
    onClassChange: () => undefined,
    onLevelChange: () => undefined,
  },
} satisfies Meta<typeof QuickNpcBuildCard>

export default meta
type Story = StoryObj<typeof meta>

export const RecommendedBuild: Story = {
  args: {
    model: resolveQuickNpcBuildCardModel({
      createContext,
      context,
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: rogueClass.id,
        level: 9,
      }),
      titles: [guildmasterTitle],
      members: { classAffinityIds: [rogueClass.id] },
    })!,
  },
}

export const BuildMode: Story = {
  args: {
    model: resolveQuickNpcBuildCardModel({
      createContext,
      context,
      values: quickNpcMemberSetupWithNoTitle({
        speciesId: 'srd-cc-5.2.1:dwarf',
        classId: '',
        level: 0,
      }),
      titles: [],
    })!,
  },
}

export const UnresolvedClass: Story = {
  args: {
    model: resolveQuickNpcBuildCardModel({
      createContext,
      context,
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 9,
      }),
      titles: [guildmasterTitle],
      members: { classAffinityIds: [rogueClass.id, fighterClass.id] },
    })!,
  },
}
