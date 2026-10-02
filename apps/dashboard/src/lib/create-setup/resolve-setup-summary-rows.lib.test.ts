import { describe, expect, it } from 'vitest'

import {
  createChoiceSetSummaryDefinitions,
  resolveSetupSummaryCards,
  resolveSetupSummaryRows,
  type CreateSetupSummaryDefinition,
} from './resolve-setup-summary-rows.lib'
import type { CreateSetupSet } from './create-setup.types'

type SampleState = {
  role: string
  species: string
  build: string
}

const SAMPLE_REGISTRY = [
  {
    id: 'role',
    label: 'Role',
    targetSetId: 'role',
    resolveValue: (state: SampleState) => state.role,
  },
  {
    id: 'species',
    label: 'Species',
    targetSetId: 'species',
    summaryGroup: 'selections',
    summaryGroupEyebrow: 'Selections',
    resolveValue: (state: SampleState) => state.species,
  },
  {
    id: 'build',
    label: 'Build',
    targetSetId: 'build',
    summaryGroup: 'selections',
    summaryGroupEyebrow: 'Selections',
    resolveValue: (state: SampleState) => state.build,
  },
] as const satisfies readonly CreateSetupSummaryDefinition<SampleState>[]

describe('resolveSetupSummaryRows', () => {
  it('renders every resolved row in registry order and omits empty values', () => {
    expect(
      resolveSetupSummaryRows(
        { role: 'Scout', species: '', build: 'Level 1 Ranger' },
        SAMPLE_REGISTRY,
      ),
    ).toEqual([
      { id: 'role', label: 'Role', value: 'Scout', targetSetId: 'role' },
      { id: 'build', label: 'Build', value: 'Level 1 Ranger', targetSetId: 'build' },
    ])
  })

  it('keeps canonical order when a later value is resolved before an earlier one', () => {
    expect(
      resolveSetupSummaryRows(
        { role: '', species: 'Gnome', build: 'Level 1 Ranger' },
        SAMPLE_REGISTRY,
      ).map((row) => row.id),
    ).toEqual(['species', 'build'])
  })

  it('reflects state after a dependent value is cleared', () => {
    const reconciled = { role: 'Scout', species: 'Gnome', build: '' }

    expect(resolveSetupSummaryRows(reconciled, SAMPLE_REGISTRY).map((row) => row.id)).toEqual([
      'role',
      'species',
    ])
  })
})

describe('resolveSetupSummaryCards', () => {
  it('groups resolved rows without dropping a later member', () => {
    expect(
      resolveSetupSummaryCards(
        { role: 'Scout', species: 'Gnome', build: 'Level 1 Ranger' },
        SAMPLE_REGISTRY,
      ),
    ).toEqual([
      {
        id: 'standalone:role',
        eyebrow: 'Role',
        rows: [{ id: 'role', label: 'Role', value: 'Scout', targetSetId: 'role' }],
      },
      {
        id: 'group:selections',
        eyebrow: 'Selections',
        rows: [
          { id: 'species', label: 'Species', value: 'Gnome', targetSetId: 'species' },
          { id: 'build', label: 'Build', value: 'Level 1 Ranger', targetSetId: 'build' },
        ],
      },
    ])
  })
})

describe('createChoiceSetSummaryDefinitions', () => {
  it('uses the selected option label and the skipped label', () => {
    const sets: CreateSetupSet[] = [
      {
        id: 'buildingForm',
        kind: 'choice',
        fieldLabel: 'Building form',
        options: [{ value: 'tower', label: 'Tower' }],
        value: '',
        skipped: true,
        skippedValueLabel: 'Not specified',
        summaryGroup: 'setupIdentity',
        summaryGroupEyebrow: 'Setup',
        isComplete: true,
      },
      {
        id: 'buildingFacilityAuthoringGroup',
        kind: 'choice',
        fieldLabel: 'Facility',
        options: [{ value: 'production', label: 'Production' }],
        value: 'production',
        summaryGroup: 'setupIdentity',
        summaryGroupEyebrow: 'Setup',
        isComplete: true,
      },
    ]

    expect(
      resolveSetupSummaryRows(sets, createChoiceSetSummaryDefinitions(sets)).map(
        (row) => row.value,
      ),
    ).toEqual(['Not specified', 'Production'])
  })
})
