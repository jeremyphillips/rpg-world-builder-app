import { describe, expect, it } from 'vitest'

import { speciesFormDef } from './species-form-def'
import type { SpeciesFormValues } from './species-form-fields'
import {
  SPECIES_PREVIEW_FACT_LABELS,
  buildSpeciesPreviewIdentity,
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
          { id: 't1', kind: 'custom', overrideDisplay: false, name: 'Darkvision', grants: [] },
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

  it('shows heritage when configured', () => {
    const sections = buildSpeciesPreviewSections(
      createValues({
        heritage: {
          id: 'h1',
          name: 'High Elf',
          description: '',
          choose: 1,
          options: [
            { id: 'o1', kind: 'custom', overrideDisplay: false, name: 'Cantrip', grants: [] },
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
