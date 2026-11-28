import { describe, expect, it } from 'vitest'

import { mapWireIssuesToAuthoring } from '../../lib/forms/submit/map-wire-issues-to-authoring.lib'
import { apiValidationIssuesToFormIssues } from '../../lib/forms/validation/normalize-content-form-issues.lib'
import type { FormIssue } from '@rpg/ui/form'

import {
  createProvenanceAccumulator,
  finishProvenanceAccumulator,
} from '../../lib/forms/submit/accumulate-prepared-write-provenance.lib'
import { buildMonsterPreparedWrite, resolveMonsterCreateDefaultValues } from './monster-form-values'
import type { MonsterFormValues } from './monster-form-values'
import { normalizeMonsterFormValues } from './normalize-monster-form-values'

const issue = (path: string): FormIssue => ({ path, message: 'bad', severity: 'field' })

describe('buildMonsterPreparedWrite provenance', () => {
  it('records duplicate skill rows by source identity, not equal values alone', () => {
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Scout',
      proficiencies: {
        ...resolveMonsterCreateDefaultValues().proficiencies,
        skills: [
          { skill: 'stealth', rank: 'proficient' as const },
          { skill: 'stealth', rank: 'expertise' as const },
          { skill: 'perception', rank: 'proficient' as const },
        ],
      },
    }

    const { provenance } = buildMonsterPreparedWrite(values, undefined, 'draft')
    const { issues } = mapWireIssuesToAuthoring([issue('proficiencies.skills.1.skill')], provenance)
    expect(issues[0]!.path).toBe('proficiencies.skills.2.skill')
  })

  it('maps slug wire paths to the name authoring owner', () => {
    const values = resolveMonsterCreateDefaultValues()
    const { provenance } = buildMonsterPreparedWrite(
      { ...values, name: 'Fire Beetle' },
      undefined,
      'draft',
    )
    const { issues } = mapWireIssuesToAuthoring([issue('slug')], provenance)
    expect(issues[0]!.path).toBe('name')
  })

  it('correlates API middleware validation_error paths through client ingestion', () => {
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Scout',
      proficiencies: {
        ...resolveMonsterCreateDefaultValues().proficiencies,
        skills: [
          { skill: 'stealth', rank: 'proficient' as const },
          { skill: 'stealth', rank: 'expertise' as const },
          { skill: 'perception', rank: 'proficient' as const },
        ],
      },
    }
    const { provenance } = buildMonsterPreparedWrite(values, undefined, 'draft')
    const wireIssues = apiValidationIssuesToFormIssues([
      { path: 'proficiencies.skills.1.skill', message: 'Duplicate skill row' },
    ])
    const { issues } = mapWireIssuesToAuthoring(wireIssues, provenance)
    expect(issues[0]!.path).toBe('proficiencies.skills.2.skill')
  })

  it('records nested multiattack choice compaction with a fragment prefix', () => {
    const acc = createProvenanceAccumulator()
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Brute',
      actions: [
        {
          id: 'a1',
          kind: 'multiattack',
          steps: [
            {
              kind: 'use',
              mode: 'choice',
              choices: [{ actionId: '' }, { actionId: 'bite' }, { actionId: 'claw' }],
            },
          ],
        },
      ],
    }

    normalizeMonsterFormValues(values, { intent: 'draft', mode: 'create', provenance: acc })
    const provenance = finishProvenanceAccumulator(acc)
    expect(provenance.filteredRowIndexBySourceIndex?.['actions.0.steps.0.choices']).toEqual({
      1: 0,
      2: 1,
    })
    const { issues } = mapWireIssuesToAuthoring(
      [issue('actions.0.steps.0.choices.0.actionId')],
      provenance,
    )
    expect(issues[0]!.path).toBe('actions.0.steps.0.choices.1.actionId')
  })
})
