import type { SpellAtomicEffectKind } from '@rpg/contracts'
import {
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID,
} from '@rpg/contracts'
import type { ArrayConfig } from '@rpg/ui/form'

import { buildEffectArrayAddMenu } from '../../../lib/effects/effect-add-menu.lib'

export const RESOLUTION_EFFECT_KINDS = [
  'damage',
  'healing',
  'temporary-hit-points',
] as const satisfies readonly SpellAtomicEffectKind[]

export type ResolutionEffectKind = (typeof RESOLUTION_EFFECT_KINDS)[number]

const PRIMARY_EFFECT_ID_BY_KIND: Record<ResolutionEffectKind, string> = {
  damage: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  healing: SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
  'temporary-hit-points': SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID,
}

function createEffectId(): string {
  return crypto.randomUUID()
}

export function createResolutionEffectAppendDefaults(
  kind: ResolutionEffectKind,
): Record<string, unknown> {
  const id = createEffectId()

  switch (kind) {
    case 'damage':
      return {
        id,
        kind,
        roll: { dice: { count: 1, faces: 6 } },
        damageType: 'fire',
      }
    case 'healing':
      return {
        id,
        kind,
        roll: { dice: { count: 2, faces: 8 } },
      }
    case 'temporary-hit-points':
      return {
        id,
        kind,
        roll: { dice: { count: 2, faces: 4 }, flat: 4 },
      }
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export type ResolutionEffectArrayAddMenuConfig = NonNullable<ArrayConfig['addActionMenu']>

/** Builds the searchable resolution effect template add menu (3 kinds). */
export function buildResolutionEffectArrayAddMenu(): ResolutionEffectArrayAddMenuConfig {
  const baseMenu = buildEffectArrayAddMenu(RESOLUTION_EFFECT_KINDS)

  return {
    ...baseMenu,
    items: baseMenu.items.map((item) => ({
      ...item,
      appendDefaults: () => createResolutionEffectAppendDefaults(item.id as ResolutionEffectKind),
    })),
  }
}

export { PRIMARY_EFFECT_ID_BY_KIND }
