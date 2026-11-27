/**
 * @vitest-environment jsdom
 */
import { ApiError } from '@rpg/contracts'
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useForm, type UseFormReturn } from 'react-hook-form'
import {
  collectCurrentFormValidationProducerIssues,
  collectTabbedFormResolverItems,
  createEmptyFormValidationProducerSession,
} from '@rpg/ui/form'

import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '@rpg/ui'

import { buildMonsterTabs } from '../../../monsters/lib/monster-form-fields'
import {
  buildMonsterPreparedWrite,
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../../monsters/lib/monster-form-values'
import { buildSpellTabs } from '../../../spells/lib/spell-form-fields'
import {
  buildSpellPreparedWrite,
  spellCreateDefaultValues,
  SPELL_SCALING_FORM_DEFAULTS,
  type SpellFormValues,
} from '../../../spells/lib/spell-form-values'
import { makeContentFormCtx } from '../../fixtures/content-form-ctx'
import { presentPersistValidationFailure } from '../shells/submit/content-form-submit-presentation.lib'

const ctx = makeContentFormCtx()
const monsterResolverFields = collectTabbedFormResolverItems(buildMonsterTabs(ctx))
const spellResolverFields = collectTabbedFormResolverItems(buildSpellTabs(ctx))

describe('API middleware validation_error client ingestion', () => {
  it('maps middleware skill paths through monster prepare provenance into the api slot', () => {
    const values: MonsterFormValues = {
      ...resolveMonsterCreateDefaultValues(),
      name: 'Scout',
      proficiencies: {
        ...resolveMonsterCreateDefaultValues().proficiencies,
        skills: [
          { skill: 'stealth', rank: 'proficient' },
          { skill: 'stealth', rank: 'expertise' },
          { skill: 'perception', rank: 'proficient' },
        ],
      },
    }
    const { provenance } = buildMonsterPreparedWrite(values, ctx, 'draft')
    const error = new ApiError(400, 'validation_error', 'Invalid monster', {
      issues: [
        {
          path: 'proficiencies.skills.1.skill',
          message: 'Duplicate skill row',
          code: 'custom',
        },
      ],
    })

    let session = createEmptyFormValidationProducerSession()
    const { result } = renderHook(() => useForm<MonsterFormValues>({ defaultValues: values }))

    act(() => {
      session = presentPersistValidationFailure(
        result.current as UseFormReturn<MonsterFormValues>,
        error,
        { resolverFields: monsterResolverFields, formId: 'monster-edit' },
        null,
        session,
        1,
        provenance,
      )
    })

    const apiIssues = collectCurrentFormValidationProducerIssues(session, 1)
    expect(apiIssues[0]?.path).toBe('proficiencies.skills.2.skill')
    expect(result.current.getFieldState('proficiencies.skills.2.skill').error?.message).toBe(
      'Duplicate skill row',
    )
    expect(result.current.getFieldState('proficiencies.skills.0.skill').error).toBeUndefined()
  })

  it('maps spell table wire paths through prepare provenance into the api slot', () => {
    const tableB = { ...reincarnateSpeciesTableFixture, id: 'table-b', name: 'Table B' }
    const values = {
      ...spellCreateDefaultValues,
      name: 'Arcane Tables',
      school: 'evocation',
      level: 1,
      classIds: ['wizard'],
      castingTime: {
        normal: { value: 1, unit: 'action' as const },
        canBeCastAsRitual: false,
      },
      range: { kind: 'self' as const },
      duration: { kind: 'instantaneous' as const },
      components: { verbal: true, somatic: true },
      areaOfEffect: spellCreateDefaultValues.areaOfEffect!,
      effects: [],
      description: `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="table-b"></div>`,
      tables: [reincarnateSpeciesTableFixture, tableB],
      ...SPELL_SCALING_FORM_DEFAULTS,
    } as SpellFormValues
    const { provenance } = buildSpellPreparedWrite(values, undefined, 'publish')
    const error = new ApiError(400, 'validation_error', 'Invalid spell', {
      issues: [
        {
          path: 'tables.0.name',
          message: 'Table name is required.',
          code: 'custom',
        },
      ],
    })

    let session = createEmptyFormValidationProducerSession()
    const { result } = renderHook(() => useForm<SpellFormValues>({ defaultValues: values }))

    act(() => {
      session = presentPersistValidationFailure(
        result.current as UseFormReturn<SpellFormValues>,
        error,
        { resolverFields: spellResolverFields, formId: 'spell-edit' },
        null,
        session,
        1,
        provenance,
      )
    })

    const apiIssues = collectCurrentFormValidationProducerIssues(session, 1)
    expect(apiIssues[0]?.path).toBe('tables.1.name')
    expect(result.current.getFieldState('tables.1.name').error?.message).toBe(
      'Table name is required.',
    )
  })
})
