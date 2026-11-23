import type { MonsterActionKind } from '@rpg/contracts'

export type MonsterActionDetailComposerRoute =
  | 'shared'
  | 'portable'
  | 'reaction-overlay'
  | 'legendary-or-shared'

const MONSTER_ACTION_KIND_DETAIL_COMPOSER_ROUTES = {
  weapon: 'shared',
  'natural-weapon': 'shared',
  attack: 'shared',
  save: 'shared',
  multiattack: 'shared',
  'action-reference': 'reaction-overlay',
  parry: 'reaction-overlay',
  leap: 'portable',
  teleport: 'portable',
  'take-actions': 'portable',
  'shape-shift': 'shared',
  special: 'shared',
  spell: 'legendary-or-shared',
} as const satisfies Record<MonsterActionKind, MonsterActionDetailComposerRoute>

export function monsterActionDetailComposerRoute(
  kind: MonsterActionKind,
): MonsterActionDetailComposerRoute {
  return MONSTER_ACTION_KIND_DETAIL_COMPOSER_ROUTES[kind]
}
