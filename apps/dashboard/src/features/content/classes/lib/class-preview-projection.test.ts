import { describe, expect, it } from 'vitest'

import { classCreateDefaultValues } from './class-form-values'
import { classFormDef, type ClassFormValues } from './class-form-def'
import {
  CLASS_PREVIEW_FACT_LABELS,
  buildClassPreviewIdentity,
  buildClassPreviewSections,
} from './class-preview-projection'
import {
  CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
  CONTENT_PREVIEW_NOT_SET,
  CONTENT_PREVIEW_STATUS_NONE,
  CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
  CONTENT_PREVIEW_STATUS_OFF,
  contentPreviewDefaultFeaturesStatus,
} from '../../lib/forms/preview/content-form-preview-copy'
import { resolveContentPreviewSectionPresentation } from '../../lib/forms/preview/content-preview-section-state'

const emptyCtx = {}

function createValues(overrides: Partial<ClassFormValues> = {}): ClassFormValues {
  return {
    ...classCreateDefaultValues,
    name: '',
    ...overrides,
  } as ClassFormValues
}

describe('class preview projection', () => {
  it('covers every class tab id', () => {
    const tabs = classFormDef.buildTabs!(emptyCtx)
    const sections = buildClassPreviewSections(createValues(), emptyCtx)

    expect(Object.keys(sections).sort()).toEqual([...tabs.map((tab) => tab.id)].sort())
  })

  it('uses Unnamed Class without header metadata facts', () => {
    const identity = buildClassPreviewIdentity(createValues(), emptyCtx)

    expect(identity.name).toBe('Unnamed Class')
    expect(identity.facts).toBeUndefined()
  })

  it('projects hit die and primary abilities into the basics section', () => {
    const sections = buildClassPreviewSections(createValues(), emptyCtx)

    expect(sections.basics?.facts).toEqual([
      { label: CLASS_PREVIEW_FACT_LABELS.hitDie, value: CONTENT_PREVIEW_NOT_SET },
      { label: CLASS_PREVIEW_FACT_LABELS.primaryAbilities, value: CONTENT_PREVIEW_NOT_SET },
    ])
  })

  it('uses the description placeholder when description is empty', () => {
    const sections = buildClassPreviewSections(createValues(), emptyCtx)

    expect(sections.basics?.description).toBe(CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER)
    expect(sections.spellcasting).toMatchObject({
      derivedKind: 'off',
      status: CONTENT_PREVIEW_STATUS_OFF,
    })
    expect(sections.features).toMatchObject({
      derivedKind: 'count',
      status: contentPreviewDefaultFeaturesStatus(5),
    })
    expect(sections.subclasses).toMatchObject({
      derivedKind: 'none',
      status: CONTENT_PREVIEW_STATUS_NONE,
    })
    expect(sections.characterCreation).toMatchObject({
      derivedKind: 'notConfigured',
      status: CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
    })
    expect(sections.characterCreation?.facts).toBeUndefined()
  })

  it('renders Not set for empty proficiency rows on fresh create', () => {
    const sections = buildClassPreviewSections(createValues(), emptyCtx)

    expect(sections.proficiencies?.facts).toEqual([
      { label: CLASS_PREVIEW_FACT_LABELS.savingThrows, value: CONTENT_PREVIEW_NOT_SET },
      { label: CLASS_PREVIEW_FACT_LABELS.armorTraining, value: CONTENT_PREVIEW_NOT_SET },
      { label: CLASS_PREVIEW_FACT_LABELS.weapons, value: CONTENT_PREVIEW_NOT_SET },
      { label: CLASS_PREVIEW_FACT_LABELS.skills, value: CONTENT_PREVIEW_NOT_SET },
    ])
  })

  it('shows an incomplete Basics marker before submit when the name is empty', () => {
    const sections = buildClassPreviewSections(createValues(), emptyCtx)
    expect(resolveContentPreviewSectionPresentation(sections.basics!, false, false)).toEqual({
      marker: 'incomplete',
    })
  })

  it('uses compact vocabulary labels for preview rail facts', () => {
    const sections = buildClassPreviewSections(
      createValues({
        hitDie: 8,
        primaryAbilities: ['str', 'dex'],
        proficiencies: {
          ...classCreateDefaultValues.proficiencies!,
          savingThrows: ['con', 'wis'],
          armor: ['light', 'shields'],
          weapons: {
            categories: ['simple', 'martial'],
            items: [],
          },
        },
        hasSpellcasting: true,
        spellcasting: {
          ...classCreateDefaultValues.spellcasting!,
          ability: 'int',
        },
      }),
      emptyCtx,
    )

    expect(sections.basics?.facts).toEqual([
      { label: CLASS_PREVIEW_FACT_LABELS.hitDie, value: 'd8' },
      { label: CLASS_PREVIEW_FACT_LABELS.primaryAbilities, value: 'STR, DEX' },
    ])
    expect(sections.proficiencies?.facts).toEqual([
      { label: CLASS_PREVIEW_FACT_LABELS.savingThrows, value: 'CON, WIS' },
      {
        label: CLASS_PREVIEW_FACT_LABELS.armorTraining,
        value: 'light, shields',
      },
      { label: CLASS_PREVIEW_FACT_LABELS.weapons, value: 'simple, martial' },
      { label: CLASS_PREVIEW_FACT_LABELS.skills, value: CONTENT_PREVIEW_NOT_SET },
    ])
    expect(sections.spellcasting?.facts).toEqual(
      expect.arrayContaining([
        { label: CLASS_PREVIEW_FACT_LABELS.spellcastingAbility, value: 'INT' },
      ]),
    )
  })

  it('reads subclass count from the tab resource, not route mode', () => {
    const sections = buildClassPreviewSections(createValues(), emptyCtx, {
      subclasses: [
        { id: 'champion', name: 'Champion' },
        { id: 'eldritch-knight', name: 'Eldritch Knight' },
      ],
    })

    expect(sections.subclasses?.status).toBe('2')
  })
})
