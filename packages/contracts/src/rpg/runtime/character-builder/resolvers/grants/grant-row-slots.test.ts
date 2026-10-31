import { describe, expect, it } from 'vitest'

import { indexCharacterBuildCatalog } from '../../context'
import { builderTestCatalog, builderTestContext } from '../../test-fixtures'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { pruneInvalidBuilderSelections } from '../../draft/prune-invalid-builder-selections'
import { unlockedGrantChoiceSets } from './unlocked-grant-choice-sets'

const catalogIndex = indexCharacterBuildCatalog(builderTestCatalog)

function trainingFeature(grantIds: readonly string[]) {
  return {
    kind: 'custom',
    id: 'training',
    name: 'Training',
    grantGroups: [
      {
        grants: grantIds.map((id) => ({
          id,
          kind: 'skillProficiency' as const,
          grant: {
            kind: 'choice' as const,
            choose: 1,
            pool: { source: 'any' as const },
          },
        })),
      },
    ],
  }
}

function choiceSetIds(grantIds: readonly string[]) {
  return unlockedGrantChoiceSets(
    trainingFeature(grantIds),
    catalogIndex,
    {
      sourceType: 'class',
      sourceId: 'srd-cc-5.2.1:fighter',
      slot: 'feature:training',
    },
    {
      grantSlot: (grant) => `feature:training:grant:${grant.id}`,
    },
  ).map((choiceSet) => choiceSet.id)
}

describe('grant choice-set slots', () => {
  it('gives two same-kind grants distinct slots that survive reordering', () => {
    const forward = choiceSetIds(['skills-a', 'skills-b'])
    const reversed = choiceSetIds(['skills-b', 'skills-a'])

    expect(forward).toEqual([
      'class:srd-cc-5.2.1:fighter:feature:training:grant:skills-a',
      'class:srd-cc-5.2.1:fighter:feature:training:grant:skills-b',
    ])
    expect(reversed).toEqual([
      'class:srd-cc-5.2.1:fighter:feature:training:grant:skills-b',
      'class:srd-cc-5.2.1:fighter:feature:training:grant:skills-a',
    ])
    expect(new Set(forward)).toEqual(new Set(reversed))
  })

  it('drops the slot for a deleted grant', () => {
    expect(choiceSetIds(['skills-a', 'skills-b'])).toHaveLength(2)
    expect(choiceSetIds(['skills-b'])).toEqual([
      'class:srd-cc-5.2.1:fighter:feature:training:grant:skills-b',
    ])
  })

  it('prunes a stale selection whose grant choice set no longer exists', () => {
    const staleId = 'class:srd-cc-5.2.1:fighter:feature:training:grant:skills-a'
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
      choiceSelections: { [staleId]: ['athletics'] },
    }

    const result = pruneInvalidBuilderSelections(draft, builderTestContext)

    expect(result.nextDraft.choiceSelections[staleId]).toBeUndefined()
    expect(result.removedSelections).toEqual([
      {
        choiceSetId: staleId,
        removedOptionIds: ['athletics'],
        reason: 'choice_set_unavailable',
      },
    ])
  })
})
