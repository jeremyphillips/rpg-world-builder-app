import { describe, expect, it } from 'vitest'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import {
  createStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../fixtures/character-builder-fixtures'
import { makeClassStored } from '@/test/fixtures/factories/additional/class-stored'
import {
  BUILDER_PREVIEW_INCOMPLETE_TITLE,
  BUILDER_PREVIEW_READY_TITLE,
} from './builder-preview-rail-copy'
import {
  projectBuilderPreviewRail,
  resolveBuilderPreviewOpenSection,
  resolveBuilderPreviewRailFooterPanel,
} from './builder-preview-projection.lib'

describe('builder-preview-projection.lib', () => {
  const context = createStandaloneBuilderContextFixture()
  const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

  it('maps wizard steps to primary preview sections', () => {
    expect(resolveBuilderPreviewOpenSection('identity', null, [])).toBe('narrative')
    expect(resolveBuilderPreviewOpenSection('species', null, [])).toBe('combat')
    expect(resolveBuilderPreviewOpenSection('abilities', null, [])).toBe('abilities')
  })

  it('keeps manual section selection until the step changes', () => {
    expect(
      resolveBuilderPreviewOpenSection(
        'abilities',
        { forStepId: 'abilities', value: 'combat' },
        [],
      ),
    ).toBe('combat')
    expect(
      resolveBuilderPreviewOpenSection(
        'equipment',
        { forStepId: 'abilities', value: 'combat' },
        [],
      ),
    ).toBe('equipment')
  })

  it('prefers create-ready footer over incomplete default', () => {
    expect(resolveBuilderPreviewRailFooterPanel(true, [], []).title).toBe(
      BUILDER_PREVIEW_READY_TITLE,
    )
    expect(resolveBuilderPreviewRailFooterPanel(false, [], []).title).toBe(
      BUILDER_PREVIEW_INCOMPLETE_TITLE,
    )
  })

  it('shows needs attention only after visible validation issues', () => {
    const issues: CharacterBuildValidationIssue[] = [
      { code: 'name_required', message: 'Enter a character name.', stepId: 'identity' },
    ]

    expect(resolveBuilderPreviewRailFooterPanel(false, ['identity'], issues).variant).toBe(
      'warning',
    )
    expect(resolveBuilderPreviewRailFooterPanel(false, [], issues).variant).toBe('default')
  })

  it('projects identity facts and section markers from draft + preview', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets },
    )

    const projection = projectBuilderPreviewRail({
      draft,
      context,
      catalogIndex,
      preview,
      resolvedChoiceSets,
      currentStepId: 'identity',
      manualOpenSection: null,
      canCreateCharacter: false,
      validationVisibleStepIds: [],
      validationIssues: [],
    })

    expect(projection?.identity.facts).toEqual([
      { label: 'Species', value: 'Choose species' },
      { label: 'Alignment', value: 'Choose alignment' },
    ])
    expect(projection?.sections.map((section) => section.id)).toEqual([
      'narrative',
      'combat',
      'abilities',
      'proficiencies',
      'equipment',
      'spells',
    ])
    expect(projection?.openSectionId).toBe('narrative')
  })

  it('keeps spells sections expandable for inactive and active casters', () => {
    const wizardStored = makeClassStored({
      slug: 'fixture-wizard',
      name: 'Wizard',
      primaryAbilities: ['int'],
      hitDie: 6,
      proficiencies: {
        savingThrows: ['int', 'wis'],
        armor: { categories: [], items: [] },
        weapons: { categories: ['simple'], items: [] },
        skills: { categories: [], items: [] },
      },
      characterCreation: {
        proficiencies: {
          skills: { choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }] },
        },
      },
      spellcasting: {
        level: 1,
        profileId: 'fixture:wizard',
        ability: 'int',
      },
    })
    const inactiveDraft = createEmptyCharacterBuilderDraft()
    const inactiveChoiceSets = resolveAvailableChoices(inactiveDraft, context)
    const inactivePreview = buildCharacterPreview(
      inactiveDraft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets: inactiveChoiceSets },
    )
    const casterContext = createStandaloneBuilderContextFixture({
      catalog: {
        species: [],
        classes: [wizardStored],
        spells: [],
        equipment: [],
        skillProficiencies: [],
        organizations: [],
        languages: [],
      },
    })
    const casterCatalogIndex = createStandaloneBuilderCatalogIndexFixture(casterContext)
    const casterDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: wizardStored.id, level: 1 as const },
    }
    const casterChoiceSets = resolveAvailableChoices(casterDraft, casterContext)
    const casterPreview = buildCharacterPreview(
      casterDraft,
      casterCatalogIndex,
      casterContext.characterCreationRules,
      casterContext.rulesetId,
      { resolvedChoiceSets: casterChoiceSets },
    )

    const inactiveProjection = projectBuilderPreviewRail({
      draft: inactiveDraft,
      context,
      catalogIndex,
      preview: inactivePreview,
      resolvedChoiceSets: inactiveChoiceSets,
      currentStepId: 'identity',
      manualOpenSection: null,
      canCreateCharacter: false,
      validationVisibleStepIds: [],
      validationIssues: [],
    })
    const activeProjection = projectBuilderPreviewRail({
      draft: casterDraft,
      context: casterContext,
      catalogIndex: casterCatalogIndex,
      preview: casterPreview,
      resolvedChoiceSets: casterChoiceSets,
      currentStepId: 'spells',
      manualOpenSection: null,
      canCreateCharacter: false,
      validationVisibleStepIds: [],
      validationIssues: [],
    })

    expect(inactiveProjection?.sections.find((section) => section.id === 'spells')).toMatchObject({
      marker: 'off',
      status: 'Off',
      expandable: true,
    })
    expect(activeProjection?.sections.find((section) => section.id === 'spells')).toMatchObject({
      expandable: true,
    })
  })
})
