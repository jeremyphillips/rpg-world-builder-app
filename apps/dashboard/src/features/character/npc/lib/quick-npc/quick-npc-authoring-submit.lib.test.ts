import { describe, expect, it } from 'vitest'

import type { CharacterBuildContext } from '@rpg/contracts'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../../lib/organization-membership/organization-membership-title.lib'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import { buildQuickNpcAuthoringCreateInput } from './quick-npc-authoring-submit.lib'
import { quickNpcAuthoringTabDefaultValues } from './quick-npc-form-fields'
import {
  quickNpcMemberSetupValues,
  quickNpcOrganizationMemberCreateContext,
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from './quick-npc-test-fixtures'

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

const lanternGuild = {
  id: 'organization-1',
  slug: 'lantern-guild',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: 'campaign-test-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Lantern Guild',
  organizationDomain: 'occupational' as const,
  functions: [],
  practices: [],
  members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
  connections: { locations: [] },
}

function quickNpcTestContext(): CharacterBuildContext {
  return createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [quickFighter],
      organizations: [lanternGuild],
    },
  })
}

describe('buildQuickNpcAuthoringCreateInput', () => {
  const buildContext = quickNpcTestContext()
  const tabValues = {
    ...quickNpcAuthoringTabDefaultValues,
    name: 'Guard Captain',
    alignment: 'ln' as const,
  }

  it('stamps organization membership for organization-member context', () => {
    const organization = {
      id: 'organization-1',
      name: 'Lantern Guild',
      organizationDomain: 'occupational' as const,
      members: {
        titles: [
          {
            id: 'omt_guildmaster',
            label: 'Guildmaster',
            priority: 50 as const,
            npcRecommendation: { templateId: 'covert_operator' as const, level: 5 },
          },
        ],
      },
    }

    const input = buildQuickNpcAuthoringCreateInput({
      createContext: quickNpcOrganizationMemberCreateContext(organization),
      setup: quickNpcMemberSetupValues({
        speciesId: populatedBuilderCatalog.species[0]!.id,
        membershipTitle: 'Guildmaster',
        classId: quickFighter.id,
        level: 1,
      }),
      tabValues,
      buildContext,
    })

    expect(input.connections.organizations).toEqual([
      { organizationId: organization.id, title: 'Guildmaster', priority: 50 },
    ])
  })

  it('omits organization membership for standalone context', () => {
    const input = buildQuickNpcAuthoringCreateInput({
      createContext: quickNpcStandaloneCreateContext(),
      setup: quickNpcStandaloneSetupValues({
        speciesId: populatedBuilderCatalog.species[0]!.id,
        classId: quickFighter.id,
        level: 1,
      }),
      tabValues,
      buildContext,
    })

    expect(input.connections.organizations).toEqual([])
  })

  it('omits title and priority for untitled member setup', () => {
    const organization = {
      id: 'organization-1',
      name: 'Lantern Guild',
      organizationDomain: 'occupational' as const,
      members: { titles: [] },
    }

    const input = buildQuickNpcAuthoringCreateInput({
      createContext: quickNpcOrganizationMemberCreateContext(organization),
      setup: quickNpcMemberSetupValues({
        speciesId: populatedBuilderCatalog.species[0]!.id,
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        classId: quickFighter.id,
        level: 1,
      }),
      tabValues,
      buildContext,
    })

    expect(input.connections.organizations).toEqual([{ organizationId: organization.id }])
  })
})
