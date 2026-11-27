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

import { buildMonsterTabs } from '../../../monsters/lib/monster-form-fields'
import {
  buildMonsterPreparedWrite,
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../../monsters/lib/monster-form-values'
import { makeContentFormCtx } from '../../fixtures/content-form-ctx'
import { presentPersistValidationFailure } from '../shells/submit/content-form-submit-presentation.lib'

const ctx = makeContentFormCtx()
const resolverFields = collectTabbedFormResolverItems(buildMonsterTabs(ctx))

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
        { resolverFields, formId: 'monster-edit' },
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
})
