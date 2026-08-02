/** Semantic plane ids shells may rebind as inherited `--surface-current`. */
export const SURFACE_CURRENT_PLANES = [
  'background',
  'card',
  'popover',
  'sunken',
  'surface-faint',
  'surface-subtle',
  'surface-muted',
  'surface-strong',
  'sidebar',
] as const

export type SurfaceCurrentPlane = (typeof SURFACE_CURRENT_PLANES)[number]

const SURFACE_CURRENT_VAR: Record<SurfaceCurrentPlane, `--${string}`> = {
  background: '--background',
  card: '--card',
  popover: '--popover',
  sunken: '--sunken',
  'surface-faint': '--surface-faint',
  'surface-subtle': '--surface-subtle',
  'surface-muted': '--surface-muted',
  'surface-strong': '--surface-strong',
  sidebar: '--sidebar',
}

/**
 * Composition-only: bind inherited `--surface-current` to a plane var.
 * Call sites decide when to establish; the helper has no policy branching.
 */
export function establishSurfaceCurrent(plane: SurfaceCurrentPlane): string {
  return `[--surface-current:var(${SURFACE_CURRENT_VAR[plane]})]`
}

/** Rebinds `--surface-current` on portaled popover content roots. */
export const portalPopoverSurfaceClasses = establishSurfaceCurrent('popover')
