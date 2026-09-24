import { cva } from 'class-variance-authority'
import {
  cn,
  scrollBoundaryTopShadowHeightClasses,
  scrollBoundaryTopShadowTintClasses,
} from '@rpg/ui'

export const mediaManagerStyles = {
  bodyDropHost: cva('relative flex min-h-0 flex-1 flex-col'),
  header: cva('relative z-10 overflow-visible bg-background'),
  headerScrollShadow: cva(
    cn(
      'pointer-events-none absolute inset-x-0 top-full z-10',
      scrollBoundaryTopShadowHeightClasses,
      'bg-gradient-to-b',
      scrollBoundaryTopShadowTintClasses,
      'to-transparent opacity-0 transition-opacity duration-150 data-[visible=true]:opacity-100',
    ),
  ),
  /** Pull columns under the header; double top inset for overlap + breathing room. */
  columnScroll: cva('-mt-5 min-h-0 flex-1'),
  columnScrollViewport: cva('flex min-h-full flex-col !pb-0 pt-10'),
  layout: cva(
    'grid h-full min-h-0 min-w-0 flex-1 gap-6 md:min-h-[24rem] md:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]',
  ),
  gallery: cva('flex h-full min-h-0 min-w-0 flex-col md:border-r md:border-border md:pr-6'),
  galleryEmpty: cva(
    'flex min-h-48 flex-1 flex-col items-center justify-center gap-2 px-4 text-center md:min-h-0',
  ),
  row: cva('flex shrink-0 flex-wrap items-center justify-between gap-2'),
  grid: cva('flex gap-3 pb-2 md:grid md:grid-cols-2'),
  tile: cva(
    'relative aspect-square w-28 shrink-0 overflow-hidden rounded-md border-2 bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-full',
    { variants: { selected: { true: 'border-primary', false: 'border-transparent' } } },
  ),
  thumbnail: cva('size-full object-cover'),
  badges: cva('absolute inset-x-1 bottom-1 flex flex-wrap gap-1'),
  badge: cva('rounded bg-background px-2 py-1 text-xs text-foreground'),
  workspace: cva('flex h-full min-h-0 min-w-0 flex-col'),
  workspaceHeader: cva('mb-4 shrink-0 space-y-1'),
  workspaceHeaderPortrait: cva('mb-4 shrink-0'),
  workspacePortraitHeading: cva('mb-0.5 text-lg font-semibold'),
  workspaceContent: cva('min-h-0 flex-1'),
  workspaceOnboarding: cva('mt-4 shrink-0'),
  editor: cva('grid min-h-0 min-w-0 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'),
  details: cva('min-w-0 space-y-5'),
  previewCard: cva('min-w-0 space-y-2'),
  preview: cva('aspect-square w-full rounded-md bg-sunken object-contain'),
  previewCaption: cva('min-w-0 text-sm font-medium text-foreground'),
  heading: cva('text-lg font-semibold'),
  subheading: cva('text-sm font-semibold'),
  muted: cva('text-sm text-muted-foreground'),
  metadata: cva(
    'grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 border-t border-border pt-4 text-sm',
  ),
  metadataLabel: cva('text-muted-foreground'),
  metadataValue: cva('m-0 min-w-0'),
  empty: cva('flex h-full min-h-48 items-stretch'),
  queue: cva('space-y-2 rounded-md border border-border p-3 text-sm'),
  hidden: cva('sr-only'),
  roles: cva('space-y-3'),
  error: cva('text-sm text-destructive'),
  status: cva('shrink-0 space-y-1 pt-4'),
}
