import { describe, expect, it } from 'vitest'

import { spellFormDef } from './spell-form-def'
import type { SpellFormValues } from './spell-form-fields'
import {
  SPELL_PREVIEW_FACT_LABELS,
  buildSpellPreviewIdentity,
  buildSpellPreviewSections,
} from './spell-preview-projection'
import { spellCreateDefaultValues } from './spell-form-values'
import {
  CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
  CONTENT_PREVIEW_NOT_SET,
  CONTENT_PREVIEW_STATUS_NONE,
  CONTENT_PREVIEW_STATUS_OFF,
} from '../../lib/forms/preview/content-form-preview-copy'
import { resolveContentPreviewSectionPresentation } from '../../lib/forms/preview/content-preview-section-state'

const emptyCtx = {}

function createValues(overrides: Partial<SpellFormValues> = {}): SpellFormValues {
  return {
    ...spellCreateDefaultValues,
    name: '',
    ...overrides,
  } as SpellFormValues
}

describe('spell preview projection', () => {
  it('covers every spell tab id', () => {
    const tabs = spellFormDef.buildTabs!(emptyCtx)
    const sections = buildSpellPreviewSections(createValues(), emptyCtx)

    expect(Object.keys(sections).sort()).toEqual([...tabs.map((tab) => tab.id)].sort())
  })

  it('uses Unnamed Spell without header metadata facts', () => {
    const identity = buildSpellPreviewIdentity(createValues(), emptyCtx)

    expect(identity.name).toBe('Unnamed Spell')
    expect(identity.facts).toBeUndefined()
  })

  it('uses the description placeholder when description is empty', () => {
    const sections = buildSpellPreviewSections(createValues(), emptyCtx)

    expect(sections.basics?.description).toBe(CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER)
    expect(sections.resolution).toMatchObject({
      derivedKind: 'off',
      status: CONTENT_PREVIEW_STATUS_OFF,
    })
    expect(sections.tags).toMatchObject({
      derivedKind: 'none',
      status: CONTENT_PREVIEW_STATUS_NONE,
    })
  })

  it('projects level, school, and classes into the basics section', () => {
    const sections = buildSpellPreviewSections(createValues(), emptyCtx)

    expect(sections.basics?.facts).toEqual([
      { label: SPELL_PREVIEW_FACT_LABELS.level, value: CONTENT_PREVIEW_NOT_SET },
      { label: SPELL_PREVIEW_FACT_LABELS.school, value: CONTENT_PREVIEW_NOT_SET },
      { label: SPELL_PREVIEW_FACT_LABELS.classes, value: CONTENT_PREVIEW_NOT_SET },
    ])
  })

  it('shows an incomplete Basics marker before submit when the name is empty', () => {
    const sections = buildSpellPreviewSections(createValues(), emptyCtx)
    expect(resolveContentPreviewSectionPresentation(sections.basics!, false, false)).toEqual({
      marker: 'incomplete',
    })
  })

  it('projects casting metadata from create defaults', () => {
    const sections = buildSpellPreviewSections(createValues(), emptyCtx)

    expect(sections.casting?.facts).toEqual(
      expect.arrayContaining([
        { label: SPELL_PREVIEW_FACT_LABELS.castingTime, value: expect.any(String) },
        { label: SPELL_PREVIEW_FACT_LABELS.range, value: expect.any(String) },
        { label: SPELL_PREVIEW_FACT_LABELS.duration, value: expect.any(String) },
        { label: SPELL_PREVIEW_FACT_LABELS.components, value: expect.any(String) },
      ]),
    )
  })
})
