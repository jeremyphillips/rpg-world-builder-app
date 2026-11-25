import type { Monster } from '@rpg/contracts'
import { buildSeedRowIdsByPath, overlayPolicyForParticipant } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { classFormDef } from '../../../classes/lib/class-form-def'
import { monsterFormDef } from '../../../monsters/lib/monster-form-def'
import { speciesFormDef } from '../../../species/lib/species-form-def'
import { buildSystemOverlayIntentFromForms } from './build-system-overlay-intent'
import { overlayParticipantForContentType } from './content-overlay-participant.lib'

const catalogSeed = {
  name: 'Owlbear',
  tags: ['beast'],
  traits: [{ id: 'keen-sight', name: 'Keen Sight', grants: [{ id: 'grt_a' }] }],
} as const

describe('buildSystemOverlayIntentFromForms', () => {
  it('builds a name-only intent when traits remain loaded but unchanged', () => {
    const baseline = { ...catalogSeed, traits: [...catalogSeed.traits] } as Record<string, unknown>
    const draft = { ...baseline, name: 'Custom Owlbear' }
    const intent = buildSystemOverlayIntentFromForms({
      participantId: overlayParticipantForContentType('monsters')!,
      catalogSeed: catalogSeed as unknown as Record<string, unknown>,
      baseline,
      draft,
      validationIntent: 'publish',
    })
    expect(intent).toEqual({ set: { name: 'Custom Owlbear' } })
  })

  it('matches policy-derived lock paths with legacy form extractor maps', () => {
    const monsterEntity = {
      traits: [{ id: 't1' }],
      actions: [{ id: 'a1' }],
      bonusActions: [],
      reactions: [],
      legendaryActions: {
        uses: { normal: 3 },
        actions: [{ id: 'deathly-teleport' }],
      },
    } as unknown as Monster

    const monsterCatalogSeed = {
      ...monsterEntity,
      traits: [{ id: 't1', name: 'Trait' }],
      actions: [{ id: 'a1', name: 'Action', kind: 'action-reference' }],
      legendaryActions: {
        uses: { normal: 3 },
        actions: [{ id: 'deathly-teleport', name: 'Deathly Teleport', kind: 'action-reference' }],
      },
    }

    expect(
      buildSeedRowIdsByPath(
        monsterCatalogSeed as unknown as Record<string, unknown>,
        overlayPolicyForParticipant('monsters'),
      ),
    ).toEqual(monsterFormDef.extractEmbeddedSeedRowIds?.(monsterEntity))

    const classEntity = {
      features: [{ id: 'rage' }],
      characterCreation: { startingEquipment: { options: [{ id: 'fighter-pack' }] } },
    }
    expect(buildSeedRowIdsByPath(classEntity, overlayPolicyForParticipant('classes'))).toEqual(
      classFormDef.extractEmbeddedSeedRowIds?.(classEntity as never),
    )

    const speciesEntity = {
      traits: [{ id: 'darkvision' }],
      heritage: { options: [{ id: 'high-elf' }] },
    }
    expect(buildSeedRowIdsByPath(speciesEntity, overlayPolicyForParticipant('species'))).toEqual(
      speciesFormDef.extractEmbeddedSeedRowIds?.(speciesEntity as never),
    )
  })
})
