import { cva } from 'class-variance-authority'
import {
  cn,
  establishSurfaceCurrent,
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
  columnScrollViewport: cva('flex min-h-0 flex-col !pb-0 pt-10'),
  layout: cva('grid h-full min-h-0 min-w-0 flex-1 items-start gap-6 md:min-h-[24rem]', {
    variants: {
      columns: {
        two: 'md:grid-cols-[minmax(0,0.28fr)_minmax(0,0.72fr)]',
        three: 'md:grid-cols-[minmax(0,0.28fr)_minmax(0,0.47fr)_minmax(0,0.25fr)]',
      },
    },
    defaultVariants: { columns: 'three' },
  }),
  modalSession: cva('relative flex min-h-0 flex-1 flex-col overflow-hidden'),
  gallery: cva('flex h-full min-h-0 min-w-0 flex-col md:border-r md:border-border md:pr-6'),
  galleryHeaderRow: cva('mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2'),
  galleryEmpty: cva(
    'flex min-h-48 flex-1 flex-col items-center justify-center gap-2 px-4 text-center md:min-h-0',
  ),
  row: cva('flex shrink-0 flex-wrap items-center justify-between gap-2'),
  grid: cva('flex gap-3 pb-2 md:grid md:grid-cols-2'),
  tile: cva(
    'relative flex w-28 shrink-0 flex-col overflow-hidden rounded-md border-2 bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-full',
    { variants: { selected: { true: 'border-primary', false: 'border-transparent' } } },
  ),
  tileThumb: cva('relative aspect-square overflow-hidden'),
  tileBadges: cva('absolute inset-x-1 bottom-1 flex flex-wrap gap-1'),
  thumbnail: cva('size-full object-cover'),
  previewColumn: cva('flex h-full min-h-0 min-w-0 flex-col md:border-r md:border-border md:pr-6'),
  detailsColumn: cva('flex h-full min-h-0 min-w-0 flex-col'),
  workspace: cva('@container/media-workspace flex h-full min-h-0 min-w-0 flex-col'),
  workspaceHeader: cva('mb-4 shrink-0 space-y-1'),
  workspaceHeaderRow: cva('flex items-center justify-between gap-2'),
  workspaceContent: cva('flex min-h-0 flex-1 flex-col'),
  workspaceOnboarding: cva('mt-4 shrink-0'),
  editorCrop: cva('min-w-0 max-w-full space-y-2'),
  details: cva('min-w-0 space-y-4'),
  detailsPanel: cva(
    cn(
      'divide-y divide-border-subtle overflow-hidden rounded-lg border bg-field-container text-foreground',
      establishSurfaceCurrent('field-container'),
    ),
  ),
  detailsSection: cva('space-y-3 p-4'),
  previewCard: cva('min-w-0 space-y-2'),
  preview: cva('aspect-square w-full rounded-md bg-sunken object-contain'),
  heading: cva('text-lg font-semibold'),
  subheading: cva('text-sm font-semibold'),
  muted: cva('text-sm text-muted-foreground'),
  footerHint: cva('text-xs text-muted-foreground'),
  metadata: cva(
    'grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-xs',
  ),
  metadataLabel: cva('text-muted-foreground'),
  metadataValue: cva('m-0 min-w-0'),
  empty: cva('flex min-h-48 flex-1 items-stretch'),
  queue: cva('space-y-2 rounded-md border border-border p-3 text-sm'),
  hidden: cva('sr-only'),
  roles: cva('space-y-3'),
  error: cva('text-sm text-destructive'),
}
