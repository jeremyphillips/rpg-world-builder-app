import {
  Ellipsis,
  Eye,
  GripVertical,
  ImagePlus,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  RotateCcw,
  SquarePen,
  Trash2,
  UserPlus,
  Waypoints,
  X,
  type LucideIcon,
} from 'lucide-react'

import type { AppIcon } from './app-icon.types'

export const ACTION_ICON_VERBS = [
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

/** Closed action-verb → glyph map (Lucide today; mixed custom later). */
export const ACTION_ICONS = {
  add: Plus,
  edit: Pencil,
  remove: Trash2,
  delete: Trash2,
  reset: RotateCcw,
  view: Eye,
  close: X,
  clear: X,
  drag: GripVertical,
  invite: UserPlus,
  addMedia: ImagePlus,
  compose: SquarePen,
  overflow: MoreHorizontal,
  overflowVertical: MoreVertical,
  overflowMenu: Ellipsis,
  waypoints: Waypoints,
} as const satisfies Record<ActionIconVerb, LucideIcon & AppIcon>
