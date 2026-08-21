import { describe, expect, it } from 'vitest'

import {
  ACTION_VALIDATE_BATCH_TARGET_LIMIT,
  assertBatchResponseCorrespondence,
  createBatchTargetOutcomeSchema,
  createBatchTargetsRequestSchema,
  isBatchTargetFailureOutcome,
  uniqueTargetIdsRefinement,
} from './action-validation-batch'
import { contentCampaignAccessAvailabilitySchema } from '../rpg/content/lib/campaign-access/campaign-access'
import { contentCampaignAccessAvailabilityBatchRequestSchema } from '../rpg/content/lib/campaign-access/campaign-access-batch'
import { vocabularyDisableAvailabilityBatchRequestSchema } from '../rpg/vocab/vocabulary-disable-availability-batch'
import { mapContentCampaignAccessAvailabilityBatchResponse } from '../rpg/content/lib/content-action-validation'
import { mapVocabularyDisableAvailabilityBatchResponse } from '../rpg/vocab/vocabulary-action-validation'

describe('action-validation-batch helpers', () => {
  it('rejects duplicate target IDs in content batch requests', () => {
    const result = contentCampaignAccessAvailabilityBatchRequestSchema.safeParse({
      targets: [{ entityId: 'a' }, { entityId: 'a' }],
    })

    expect(result.success).toBe(false)
  })

  it('rejects duplicate target IDs in vocabulary batch requests', () => {
    const result = vocabularyDisableAvailabilityBatchRequestSchema.safeParse({
      targets: [{ entryId: 'fire' }, { entryId: 'fire' }],
    })

    expect(result.success).toBe(false)
  })

  it('rejects empty and over-limit batch requests', () => {
    const schema = createBatchTargetsRequestSchema(
      contentCampaignAccessAvailabilityBatchRequestSchema.shape.targets.element,
    ).superRefine(uniqueTargetIdsRefinement('entityId'))

    expect(schema.safeParse({ targets: [] }).success).toBe(false)
    expect(
      schema.safeParse({
        targets: Array.from({ length: ACTION_VALIDATE_BATCH_TARGET_LIMIT + 1 }, (_, index) => ({
          entityId: `id-${index}`,
        })),
      }).success,
    ).toBe(false)
  })

  it('detects missing, duplicate, unexpected, and wrong-order response IDs', () => {
    expect(assertBatchResponseCorrespondence(['a', 'b'], [{ targetId: 'a' }])).toEqual({
      kind: 'malformed_batch_response',
      reason: 'Response target count does not match request.',
    })

    expect(
      assertBatchResponseCorrespondence(['a', 'b'], [{ targetId: 'a' }, { targetId: 'a' }]),
    ).toEqual({
      kind: 'malformed_batch_response',
      reason: 'Response order mismatch at index 1.',
    })

    expect(
      assertBatchResponseCorrespondence(['a', 'b'], [{ targetId: 'b' }, { targetId: 'a' }]),
    ).toEqual({
      kind: 'malformed_batch_response',
      reason: 'Response order mismatch at index 0.',
    })

    expect(
      assertBatchResponseCorrespondence(
        ['a', 'b'],
        [{ targetId: 'a' }, { targetId: 'b' }, { targetId: 'c' }],
      ),
    ).toEqual({
      kind: 'malformed_batch_response',
      reason: 'Response target count does not match request.',
    })
  })

  it('accepts stable request-order responses with exact correspondence', () => {
    expect(
      assertBatchResponseCorrespondence(
        ['a', 'b', 'c'],
        [{ targetId: 'a' }, { targetId: 'b' }, { targetId: 'c' }],
      ),
    ).toBeNull()
  })

  it('parses concrete batch target outcome schemas', () => {
    const outcomeSchema = createBatchTargetOutcomeSchema(contentCampaignAccessAvailabilitySchema)

    expect(
      outcomeSchema.parse({
        targetId: 'feat_1',
        targetName: 'Alert',
        availability: { status: 'allowed' },
      }),
    ).toMatchObject({ targetId: 'feat_1' })

    const failureOutcome = outcomeSchema.parse({
      targetId: 'feat_1',
      targetName: 'Alert',
      failure: { code: 'validate_error', message: 'Availability could not be checked.' },
    })

    expect(
      isBatchTargetFailureOutcome(failureOutcome) ? failureOutcome.failure : null,
    ).toMatchObject({
      code: 'validate_error',
    })
  })
})

describe('batch response mappers', () => {
  it('maps successful batch entries and preserves several per-target failures', () => {
    const result = mapContentCampaignAccessAvailabilityBatchResponse(['a', 'b', 'c'], {
      targets: [
        { targetId: 'a', targetName: 'Alpha', availability: { status: 'allowed' } },
        {
          targetId: 'b',
          targetName: 'Beta',
          failure: { code: 'not_found', message: 'This item could not be found.' },
        },
        {
          targetId: 'c',
          targetName: 'Gamma',
          failure: { code: 'validate_error', message: 'Availability could not be checked.' },
        },
      ],
    })

    expect(result.validation.targets.map((target) => target.status)).toEqual(['eligible'])
    expect(result.failures).toEqual([
      { targetId: 'b', failure: { code: 'not_found', message: 'This item could not be found.' } },
      {
        targetId: 'c',
        failure: { code: 'validate_error', message: 'Availability could not be checked.' },
      },
    ])
  })

  it('returns malformed batch results for correspondence violations', () => {
    const result = mapVocabularyDisableAvailabilityBatchResponse(['a', 'b'], {
      targets: [{ targetId: 'a', targetName: 'Alpha', availability: { status: 'allowed' } }],
    })

    expect(result.validation.targets).toEqual([])
    expect(result.failures).toHaveLength(2)
    expect(result.failures.every((entry) => entry.failure.code === 'malformed_response')).toBe(true)
  })

  it('maps batch availability entries equivalently to composing single-target mappers', () => {
    const entries = [
      {
        targetId: 'a',
        targetName: 'Alpha',
        availability: { status: 'allowed' as const },
      },
      {
        targetId: 'b',
        targetName: 'Beta',
        availability: {
          status: 'blocked' as const,
          blockers: [
            {
              kind: 'usage' as const,
              usage: {
                kind: 'character' as const,
                id: 'char-1',
                label: 'Aldric',
                characterType: 'pc' as const,
              },
            },
          ],
        },
      },
    ]

    const batchResult = mapContentCampaignAccessAvailabilityBatchResponse(
      entries.map((entry) => entry.targetId),
      { targets: entries },
    )

    for (const entry of entries) {
      const single = mapContentCampaignAccessAvailabilityBatchResponse([entry.targetId], {
        targets: [entry],
      })
      expect(
        batchResult.validation.targets.find((target) => target.targetId === entry.targetId),
      ).toEqual(single.validation.targets[0])
    }
  })
})
