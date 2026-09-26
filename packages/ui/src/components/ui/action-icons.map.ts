import {
  Eye,
  GripVertical,
  ImagePlus,
  Pencil,
  Plus,
  RotateCcw,
  SquarePen,
  Trash2,
  UserPlus,
  X,
  type LucideIcon,
} from 'lucide-react'

import type { AppIcon } from './app-icon.types'

export const ACTION_ICON_VERBS = [
  'add',
  'edit',
  'remove',
  'reset',
  'view',
  'close',
  'clear',
  'drag',
  'invite',
  'addMedia',
  'compose',
] as const

export type ActionIconVerb = (typeof ACTION_ICON_VERBS)[number]

/** Closed action-verb → glyph map (Lucide today; mixed custom later). */
export const ACTION_ICONS = {
  add: Plus,
  edit: Pencil,
  remove: Trash2,
  reset: RotateCcw,
  view: Eye,
  close: X,
  clear: X,
  drag: GripVertical,
  invite: UserPlus,
  addMedia: ImagePlus,
  compose: SquarePen,
} as const satisfies Record<ActionIconVerb, LucideIcon & AppIcon>
