import type { IconName } from './icon/icon-glyphs'

export const ACTION_ICON_VERBS = [
  'back',
  'add',
  'edit',
  'remove',
  'delete',
  'reset',
  'view',
  'close',
  'clear',
  'drag',
  'invite',
  'addMedia',
  'compose',
  'overflow',
  'overflowVertical',
  'overflowMenu',
  'waypoints',
] as const

export type ActionIconVerb = (typeof ACTION_ICON_VERBS)[number]

/** Closed action-verb → canonical glyph name. */
export const ACTION_ICONS = {
  back: 'arrow-left',
  add: 'plus',
  edit: 'pencil',
  remove: 'trash',
  delete: 'trash',
  reset: 'rotate-ccw',
  view: 'eye',
  close: 'x',
  clear: 'x',
  drag: 'grip-vertical',
  invite: 'user-plus',
  addMedia: 'image-plus',
  compose: 'square-pen',
  overflow: 'ellipsis',
  overflowVertical: 'ellipsis-vertical',
  overflowMenu: 'ellipsis',
  waypoints: 'waypoints',
} as const satisfies Record<ActionIconVerb, IconName>
