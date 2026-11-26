import { describe, expect, it } from 'vitest'

import { overlayPolicyForParticipant } from './participant-policies'
import { buildPersistedIdentityRowIdsByPath } from './persisted-identity-row-ids-by-path'

describe('buildPersistedIdentityRowIdsByPath', () => {
  it('collects every identity collection on a resolved monster', () => {
    const entity = {
      traits: [{ id: 't1' }],
      actions: [{ id: 'a1' }],
      bonusActions: [],
      reactions: [],
      legendaryActions: {
        uses: { normal: 3 },
        actions: [{ id: 'deathly-teleport' }],
      },
    } as Record<string, unknown>

    const paths = buildPersistedIdentityRowIdsByPath(
      entity,
      overlayPolicyForParticipant('monsters'),
    )

    expect(paths).toMatchObject({
      traits: ['t1'],
      actions: ['a1'],
      'legendaryActions.actions': ['deathly-teleport'],
    })
  })

  it('collects class features and equipment option ids', () => {
    const entity = {
      features: [{ id: 'rage' }],
      characterCreation: { startingEquipment: { options: [{ id: 'fighter-pack' }] } },
    }

    const paths = buildPersistedIdentityRowIdsByPath(entity, overlayPolicyForParticipant('classes'))

    expect(paths).toEqual({
      features: ['rage'],
      'characterCreation.startingEquipment.options': ['fighter-pack'],
    })
  })
})
