import { cn } from '../../lib/utils'

export const FIELD_CONTROL_SURFACES = ['default', 'onMuted'] as const

export type FieldControlSurface = (typeof FIELD_CONTROL_SURFACES)[number]

const FIELD_CONTROL_SURFACE_FILL_VARS: Record<FieldControlSurface, string> = {
  default: '[--field-control-bg:var(--field-control-bg-default)]',
  onMuted: '[--field-control-bg:var(--field-control-bg-on-muted)]',
}

/** Local composition wrapper — sets inherited `--field-control-bg` for descendant field controls. */
export function resolveFieldControlSurfaceClasses(surface: FieldControlSurface): string {
  return FIELD_CONTROL_SURFACE_FILL_VARS[surface]
}

/**
 * Passthrough wrapper for flex parents — does not generate a box (`display: contents`).
 * Custom properties must be set on a box-generating ancestor (e.g. filter panel shells);
 * use this helper only when siblings must stay direct flex children.
 */
export function resolveFieldControlSurfacePassthroughClasses(surface: FieldControlSurface): string {
  return cn(FIELD_CONTROL_SURFACE_FILL_VARS[surface], 'contents')
}
