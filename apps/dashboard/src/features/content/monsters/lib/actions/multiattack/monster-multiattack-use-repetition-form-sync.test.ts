import { describe, expect, it } from 'vitest'

import type { MonsterActionDraftRow } from '../monster-action-presets'
import { primeMultiattackReplacementActionsSnapshot } from './monster-multiattack-replacement-form-sync'
import { buildMultiattackUseRepetitionValueSyncs } from './monster-multiattack-use-repetition-form-sync'

const bite = { id: 'bite', kind: 'natural-weapon', name: 'Bite' } as MonsterActionDraftRow
const spellcasting = {
  id: 'spellcasting',
  kind: 'spell',
  name: 'Spellcasting',
  spells: [{ spellId: 'srd:counterspell' }],
} as MonsterActionDraftRow

const multiattack = (
  steps: Record<string, unknown>[],
  extra?: Record<string, unknown>,
): MonsterActionDraftRow =>
  ({
    id: 'multiattack',
    kind: 'multiattack',
    name: 'Multiattack',
    steps,
    ...extra,
  }) as MonsterActionDraftRow

describe('buildMultiattackUseRepetitionValueSyncs', () => {
  const sync = buildMultiattackUseRepetitionValueSyncs()[0]!

  it('clears repetition when a use step changes to spellcasting', () => {
    const before = [
      multiattack([
        { count: 1, actionIds: ['bite'] },
        { kind: 'use', mode: 'single', actionId: 'bite', count: 2 },
      ]),
      bite,
    ] as MonsterActionDraftRow[]
    const after = [
      multiattack([
        { count: 1, actionIds: ['bite'] },
        { kind: 'use', mode: 'single', actionId: 'spellcasting', count: 2 },
      ]),
      bite,
      spellcasting,
    ] as MonsterActionDraftRow[]
    primeMultiattackReplacementActionsSnapshot(before)

    const patch = sync.apply({ actions: after }, ['actions'])
    expect(
      (patch as { actions?: MonsterActionDraftRow[] } | undefined)?.actions?.[0],
    ).toMatchObject({
      steps: [
        { count: 1, actionIds: ['bite'] },
        { kind: 'use', mode: 'single', actionId: 'spellcasting' },
      ],
    })
  })

  it('does not clear invalid stored spell repetition without an action change', () => {
    const rows = [
      multiattack([
        { count: 1, actionIds: ['bite'] },
        { kind: 'use', mode: 'single', actionId: 'spellcasting', count: 2 },
      ]),
      bite,
      spellcasting,
    ]
    primeMultiattackReplacementActionsSnapshot(structuredClone(rows))

    const patch = sync.apply({ actions: structuredClone(rows) }, ['actions'])
    expect(patch).toBeUndefined()
  })

  it('reconciles alternative sequence use steps identically', () => {
    const before = [
      multiattack([{ count: 1, actionIds: ['bite'] }], {
        alternative: {
          steps: [{ kind: 'use', mode: 'single', actionId: 'bite', count: 2 }],
        },
      }),
      bite,
    ]
    const after = structuredClone(before) as MonsterActionDraftRow[]
    after[0] = multiattack([{ count: 1, actionIds: ['bite'] }], {
      alternative: {
        steps: [{ kind: 'use', mode: 'single', actionId: 'spellcasting', count: 2 }],
      },
    }) as MonsterActionDraftRow
    after.push(spellcasting)
    primeMultiattackReplacementActionsSnapshot(before as MonsterActionDraftRow[])

    const patch = sync.apply({ actions: after }, ['actions'])
    expect(
      (patch as { actions?: MonsterActionDraftRow[] } | undefined)?.actions?.[0],
    ).toMatchObject({
      alternative: {
        steps: [{ kind: 'use', mode: 'single', actionId: 'spellcasting' }],
      },
    })
  })
})
