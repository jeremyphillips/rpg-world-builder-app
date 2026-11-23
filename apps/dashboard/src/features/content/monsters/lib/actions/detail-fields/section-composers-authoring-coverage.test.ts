import {
  MONSTER_ACTION_KINDS,
  monsterSectionAllowsKind,
  type MonsterActionKind,
} from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import { monsterActionDetailComposerRoute } from './monster-action-kind-detail-composers'
import { resolveMonsterActionSectionFields } from './section-composers'

/** `${section}:${kind}` keys exempt from non-empty detail-field coverage (document reason). */
type MonsterActionAuthoringWaiverKey = `${MonsterActionSection}:${MonsterActionKind}`

const MONSTER_ACTION_AUTHORING_WAIVERS = {
  // Legendary `save` rows use editor chrome outside legendary category fields; shared route is minimal.
  'legendaryActions:save': 'legendary save uses shared mechanics without category overlay',
} as const satisfies Partial<Record<MonsterActionAuthoringWaiverKey, string>>

const SECTIONS = [
  'actions',
  'bonusActions',
  'reactions',
  'legendaryActions',
] as const satisfies readonly MonsterActionSection[]

const ctx = {
  spellCatalogStatus: 'ready',
  spellCatalogById: new Map([['srd:fear', { id: 'srd:fear', name: 'Fear' }]]),
} as unknown as ContentFormCtx

const baseInput = {
  ctx,
  namePrefix: 'actions.0',
  equipmentOptions: [],
  equipment: [],
  sharedCastingOptions: [],
  attackOptions: [],
  actionRows: [],
  bonusActionRows: [],
  advisories: [],
} as const

function minimalDraftForSectionKind(
  section: MonsterActionSection,
  kind: MonsterActionKind,
): MonsterActionDraftRow {
  const id = `coverage-${section}-${kind}`
  switch (kind) {
    case 'weapon':
      return { id, kind, equipmentEntryId: 'sword' }
    case 'natural-weapon':
      return { id, kind, mode: 'melee', damage: { dice: { count: 1, faces: 6 } } }
    case 'attack':
      return { id, kind, modes: ['melee'], damage: { dice: { count: 1, faces: 6 } } }
    case 'save':
      return { id, kind, preset: 'breath-weapon' }
    case 'spell':
      if (section === 'legendaryActions') {
        return {
          id,
          kind,
          spellInvocation: 'use-entry',
          spells: [{ spellId: 'srd:fear' }],
        }
      }
      return { id, kind, spells: [{ spellId: 'srd:fear' }] }
    case 'multiattack':
      return { id, kind, preset: 'multiattack', sequences: [] }
    case 'shape-shift':
      return { id, kind, equipment: 'keep-equipment' }
    case 'action-reference':
      return { id, kind, actionIds: ['source-action'] }
    case 'parry':
      return { id, kind, acBonus: 2 }
    case 'leap':
    case 'teleport':
    case 'take-actions':
      return { id, kind }
    case 'special':
      return { id, kind, description: '<p>Test</p>' }
    default: {
      const exhaustive: never = kind
      return exhaustive
    }
  }
}

describe('monster action authoring route coverage', () => {
  it('maps every MONSTER_ACTION_KIND to a detail composer route', () => {
    for (const kind of MONSTER_ACTION_KINDS) {
      expect(monsterActionDetailComposerRoute(kind)).toBeTruthy()
    }
  })

  it('returns detail fields for every section-eligible kind unless waived', () => {
    const gaps: string[] = []

    for (const section of SECTIONS) {
      for (const kind of MONSTER_ACTION_KINDS) {
        if (!monsterSectionAllowsKind(section, kind)) continue

        const waiverKey = `${section}:${kind}` as const
        if (waiverKey in MONSTER_ACTION_AUTHORING_WAIVERS) continue

        const action = minimalDraftForSectionKind(section, kind)
        const fields = resolveMonsterActionSectionFields({
          ...baseInput,
          section,
          action,
        })

        if (fields.length === 0) {
          gaps.push(waiverKey)
        }
      }
    }

    expect(
      gaps,
      `add MONSTER_ACTION_AUTHORING_WAIVERS or composer branches for: ${gaps.join(', ')}`,
    ).toEqual([])
  })
})
