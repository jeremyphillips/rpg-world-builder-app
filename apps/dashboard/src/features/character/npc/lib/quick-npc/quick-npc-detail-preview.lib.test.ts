import { describe, expect, it } from 'vitest'

import {
  buildChoiceSetId,
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  CharacterBuildFinalizationError,
} from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'

import {
  assembleQuickNpcPrepareCreateArgs,
  resolveQuickNpcAuthoringPreparedDraft,
} from './quick-npc-authoring-submit.lib'
import { formatQuickNpcCreationError, resolveQuickNpcPreparedDraft } from './quick-npc-create'
import {
  projectQuickNpcDetailPreview,
  projectQuickNpcDetailPreviewFromPrepared,
} from './quick-npc-detail-preview.lib'
import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabValues,
} from './quick-npc-form-fields'
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

const buildContext = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    classes: [quickFighter],
  },
})

const tabValues: QuickNpcAuthoringTabValues = {
  ...quickNpcAuthoringTabDefaultValues,
  gender: 'male',
  name: 'Guard Captain',
  alignment: 'ln',
  generateNarrativeOnCreate: false,
}

describe('projectQuickNpcDetailPreview', () => {
  it('includes organization membership on the prepared draft', () => {
    const organization = {
      id: 'organization-1',
      name: 'Lantern Guild',
      organizationDomain: 'occupational' as const,
      members: {
        titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
      },
    }
    const setup = quickNpcMemberSetupValues({
      speciesId: populatedBuilderCatalog.species[0]!.id,
      membershipTitle: 'omt_member',
      classId: quickFighter.id,
      level: 1,
    })
    const createContext = quickNpcOrganizationMemberCreateContext(organization)
    const args = { setup, tabValues, buildContext, createContext }

    const prepared = resolveQuickNpcAuthoringPreparedDraft(args)
    const previewPrepared = resolveQuickNpcPreparedDraft(assembleQuickNpcPrepareCreateArgs(args))

    expect(prepared.ok).toBe(true)
    expect(previewPrepared.ok).toBe(true)
    expect(
      previewPrepared.draft.relationshipEdges.some(
        (edge) =>
          edge.kind === 'organizationMembership' &&
          edge.organizationId === organization.id &&
          edge.characterId === CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
      ),
    ).toBe(true)
    expect(previewPrepared.draft.relationshipEdges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'organizationMembership',
          organizationId: organization.id,
          details: { lifecycle: 'current', membershipTitleId: 'omt_member' },
        }),
      ]),
    )
  })

  it('surfaces the same starting-choice issue copy as create', () => {
    const classSkillsId = buildChoiceSetId('class', quickFighter.id, 'class-skills')
    const setup = quickNpcStandaloneSetupValues({
      npcTemplateId: 'guard',
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: quickFighter.id,
      level: 1,
    })
    const createContext = quickNpcStandaloneCreateContext()
    const partialTabValues = {
      ...tabValues,
      startingChoiceOverrides: {
        [classSkillsId]: [],
      },
    }
    const args = {
      setup,
      tabValues: partialTabValues,
      buildContext,
      createContext,
    }

    const prepared = resolveQuickNpcAuthoringPreparedDraft(args)
    const preview = projectQuickNpcDetailPreview({
      setup,
      authoringValues: partialTabValues,
      buildContext,
      createContext,
    })

    expect(prepared.ok).toBe(false)
    expect(preview.validationNotice).toBe(
      formatQuickNpcCreationError(new CharacterBuildFinalizationError(prepared.issues)),
    )
    expect(preview.completeness.showPreviewNotice).toBe(true)
  })

  it('matches create prepared draft for the same inputs when valid', () => {
    const setup = quickNpcStandaloneSetupValues({
      npcTemplateId: 'guard',
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: quickFighter.id,
      level: 1,
    })
    const createContext = quickNpcStandaloneCreateContext()
    const args = { setup, tabValues, buildContext, createContext }

    const fromCreate = resolveQuickNpcAuthoringPreparedDraft(args)
    const fromPreview = resolveQuickNpcPreparedDraft(assembleQuickNpcPrepareCreateArgs(args))

    expect(fromCreate).toEqual(fromPreview)
  })
})

describe('projectQuickNpcDetailPreviewFromPrepared', () => {
  it('matches the setup entry point for the same inputs', () => {
    const setup = quickNpcStandaloneSetupValues({
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: quickFighter.id,
      level: 1,
    })
    const createContext = quickNpcStandaloneCreateContext()
    const fromSetup = projectQuickNpcDetailPreview({
      setup,
      authoringValues: tabValues,
      buildContext,
      createContext,
    })
    const fromPrepared = projectQuickNpcDetailPreviewFromPrepared({
      prepared: resolveQuickNpcAuthoringPreparedDraft({
        setup,
        tabValues,
        buildContext,
        createContext,
      }),
      buildContext,
    })
    expect(fromPrepared).toEqual(fromSetup)
  })
})
