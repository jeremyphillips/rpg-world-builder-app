import {
  buildContentPurposeSelectors,
  EQUIPMENT_REFERENCE_DISPLAY_MESSAGES,
  SPELL_REFERENCE_DISPLAY_MESSAGES,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  buildCatalogDrowGrantDisplayVocabulary,
  buildScopedHeritageEquipmentFixture,
} from '../../lib/fixtures/grant-display-fixtures'
import { pickClass, pickSpecies } from '../../lib/fixtures/pick'

import { buildSpeciesDetailViewModel } from './species-display'
import { speciesFormDef } from './species-form-def'
import type { SpeciesFormValues } from './species-form-fields'
import {
  SPECIES_PREVIEW_FACT_LABELS,
  buildSpeciesPreviewIdentity,
  buildSpeciesPreviewDetailViewModel,
  buildSpeciesPreviewSections,
} from './species-preview-projection'
import { speciesCreateDefaultValues } from './species-form-values'
import {
  CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
  CONTENT_PREVIEW_STATUS_NONE,
  CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
  CONTENT_PREVIEW_STATUS_OFF,
} from '../../lib/forms/preview/content-form-preview-copy'
import { resolveContentPreviewSectionPresentation } from '../../lib/forms/preview/content-preview-section-state'

const emptyCtx = {}

function createValues(overrides: Partial<SpeciesFormValues> = {}): SpeciesFormValues {
  return {
    ...speciesCreateDefaultValues,
    name: '',
    ...overrides,
  } as SpeciesFormValues
}

describe('species preview projection', () => {
  it('covers every species tab id', () => {
    const tabs = speciesFormDef.buildTabs!(emptyCtx)
    const sections = buildSpeciesPreviewSections(createValues(), emptyCtx)

    expect(Object.keys(sections).sort()).toEqual([...tabs.map((tab) => tab.id)].sort())
  })

  it('uses Unnamed Species without header metadata facts', () => {
    const identity = buildSpeciesPreviewIdentity(createValues(), emptyCtx)

    expect(identity.name).toBe('Unnamed Species')
    expect(identity.facts).toBeUndefined()
  })

  it('derives system artwork when the form has no persisted media', () => {
    const identity = buildSpeciesPreviewIdentity(createValues(), {
      entityCatalogLayer: 'system',
      entitySlug: 'elf',
      rulesetId: 'srd-cc-5.2.1',
    })

    expect(identity.displayImage).toMatchObject({
      src: '/assets/system/srd-cc-5.2.1/species/primary/elf.jpeg',
      sourceKind: 'system',
    })
  })

  it('uses the description placeholder when description is empty', () => {
    const sections = buildSpeciesPreviewSections(createValues(), emptyCtx)

    expect(sections.basics?.description).toBe(CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER)
    expect(sections.traits).toMatchObject({
      derivedKind: 'none',
      status: CONTENT_PREVIEW_STATUS_NONE,
    })
    expect(sections.heritage).toMatchObject({
      derivedKind: 'off',
      status: CONTENT_PREVIEW_STATUS_OFF,
    })
    expect(sections.rules).toMatchObject({
      derivedKind: 'notConfigured',
      status: CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
    })
    expect(sections.rules?.facts).toBeUndefined()
  })

  it('projects stat rows into the basics section', () => {
    const sections = buildSpeciesPreviewSections(createValues(), emptyCtx)

    expect(sections.basics?.facts).toEqual(
      expect.arrayContaining([
        { label: SPECIES_PREVIEW_FACT_LABELS.creatureType, value: expect.any(String) },
        { label: SPECIES_PREVIEW_FACT_LABELS.size, value: expect.any(String) },
        { label: SPECIES_PREVIEW_FACT_LABELS.movement, value: expect.any(String) },
        { label: SPECIES_PREVIEW_FACT_LABELS.senses, value: expect.any(String) },
      ]),
    )
  })

  it('shows an incomplete Basics marker before submit when the name is empty', () => {
    const sections = buildSpeciesPreviewSections(createValues(), emptyCtx)
    expect(resolveContentPreviewSectionPresentation(sections.basics!, false, false)).toEqual({
      marker: 'incomplete',
    })
  })

  it('counts traits and lists names', () => {
    const sections = buildSpeciesPreviewSections(
      createValues({
        traits: [
          {
            id: 't1',
            kind: 'custom',
            overrideDisplay: false,
            name: 'Darkvision',
            grants: [],
            available: true,
          },
        ],
      }),
      emptyCtx,
    )

    expect(sections.traits).toMatchObject({
      derivedKind: 'count',
      status: '1',
    })
    expect(sections.traits?.facts?.[0]?.value).toBe('Darkvision')
  })

  it('resolves class policy slugs from the visible catalog, including saved drafts', () => {
    const wizard = { ...pickClass('wizard'), name: 'Campaign Wizard', status: 'draft' as const }
    const sections = buildSpeciesPreviewSections(
      createValues({
        characterCreation: {
          multiclassing: {
            policy: 'restricted',
            classPolicy: { mode: 'only', classIds: [wizard.slug, 'missing-class'] },
          },
        },
      }),
      { options: { classes: buildContentPurposeSelectors([wizard]) } },
    )

    expect(sections.rules?.facts).toContainEqual({
      label: SPECIES_PREVIEW_FACT_LABELS.classPolicyClasses,
      value: 'Campaign Wizard, Class reference unavailable',
    })
  })

  it('uses the authoring spell catalog lifecycle in the Drow detail preview', () => {
    const values = createValues(speciesFormDef.toFormValues(pickSpecies('elf')))
    const { spellsById } = buildCatalogDrowGrantDisplayVocabulary().spellCatalog

    function drowSummary(spellCatalogStatus: 'ready' | 'pending') {
      return buildSpeciesPreviewDetailViewModel(values, {
        spellCatalogStatus,
        spellCatalogById: spellsById,
      })
        .sections.find((section) => section.id === 'heritage')
        ?.items.find((item) => item.id === 'drow')?.summaryInline
    }

    expect(drowSummary('ready')).toContain('Dancing Lights')
    expect(drowSummary('pending')).toContain(SPELL_REFERENCE_DISPLAY_MESSAGES.catalogLoading)
    expect(drowSummary('pending')).not.toContain('Dancing Lights')
  })

  it('keeps saved equipment labels identical in published detail and player preview', () => {
    const { species, equipmentCatalog, expectedSummary } = buildScopedHeritageEquipmentFixture()
    const published = buildSpeciesDetailViewModel(species, {
      ...buildCatalogDrowGrantDisplayVocabulary(),
      equipmentReferences: { catalog: equipmentCatalog, scope: equipmentCatalog.scope },
      resolveCreatureTypeLabel: (id) => id,
      resolveLanguageLabel: () => undefined,
    })
    const preview = buildSpeciesPreviewDetailViewModel(
      createValues(speciesFormDef.toFormValues(species)),
      {
        ...equipmentCatalog.scope,
        equipmentCatalogStatus: 'ready',
        equipmentCatalogById: equipmentCatalog.equipmentById,
      },
    )

    for (const display of [published, preview]) {
      expect(
        display.sections.find((section) => section.id === 'heritage')?.items[0]?.summaryLines,
      ).toEqual([expectedSummary])
    }
  })

  it.each([
    ['pending', EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.catalogLoading],
    ['error', EQUIPMENT_REFERENCE_DISPLAY_MESSAGES.catalogError],
  ] as const)(
    'keeps cached equipment names out of a %s player preview',
    (equipmentCatalogStatus, label) => {
      const { species, equipmentCatalog } = buildScopedHeritageEquipmentFixture()
      const preview = buildSpeciesPreviewDetailViewModel(
        createValues(speciesFormDef.toFormValues(species)),
        {
          ...equipmentCatalog.scope,
          equipmentCatalogStatus,
          equipmentCatalogById: equipmentCatalog.equipmentById,
        },
      )

      expect(
        preview.sections.find((section) => section.id === 'heritage')?.items[0]?.summaryLines,
      ).toEqual([`L1: ${label} · ${label}`])
    },
  )

  it('shows heritage when configured', () => {
    const sections = buildSpeciesPreviewSections(
      createValues({
        heritage: {
          id: 'h1',
          name: 'High Elf',
          description: '',
          choose: 1,
          options: [
            {
              id: 'o1',
              kind: 'custom',
              overrideDisplay: false,
              name: 'Cantrip',
              grants: [],
              campaignAccess: {
                available: true,
                visibilityMode: 'all_players',
                participantIds: [],
              },
            },
          ],
        },
      }),
      emptyCtx,
    )

    expect(sections.heritage).toMatchObject({
      derivedKind: 'ready',
      status: 'High Elf',
    })
    expect(sections.heritage?.facts?.[0]?.value).toBe('1 option')
  })
})
