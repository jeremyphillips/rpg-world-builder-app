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

  it('uses Unnamed Class and live identity facts including defaults', () => {
    const identity = buildClassPreviewIdentity(createValues(), emptyCtx)

    expect(identity.name).toBe('Unnamed Class')
    expect(identity.facts).toEqual([
      { label: CLASS_PREVIEW_FACT_LABELS.hitDie, value: 'd8' },
      { label: CLASS_PREVIEW_FACT_LABELS.primaryAbilities, value: 'Strength' },
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
  })

  it('omits empty proficiency rows and reports Ready for defaults', () => {
    const sections = buildClassPreviewSections(createValues(), emptyCtx)

    expect(sections.proficiencies?.status).toBe('Ready')
    expect(sections.proficiencies?.facts?.map((fact) => fact.label)).toEqual(['Saving throws'])
  })

  it('keeps Basics statusless before submit when the name is empty', () => {
    const sections = buildClassPreviewSections(createValues(), emptyCtx)
    expect(resolveContentPreviewSectionPresentation(sections.basics!, false, false)).toEqual({})
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
