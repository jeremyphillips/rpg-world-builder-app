import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { cardRadiusClasses } from '../ui/card.variants'
import { iconGlyphRootClasses } from '../ui/icon-glyph.variants'
import { establishSurfaceCurrent } from '../ui/surface-current.lib'

/** Persistent preview-rail column width from `xl` until `2xl`. */
export const previewRailAsideWidthBelow2xl = '280px'

/** Persistent preview-rail column width at `2xl` and above. */
export const previewRailAsideWidthAt2xl = '21rem'

/** TabbedForm grid tracks when the persistent preview rail is visible below `2xl`. */
export const previewRailTabbedAsideGridColsBelow2xlClasses = 'xl:grid-cols-[minmax(0,1fr)_280px]'

/** TabbedForm grid tracks when the persistent preview rail is visible at `2xl` and above. */
export const previewRailTabbedAsideGridColsAt2xlClasses = '2xl:grid-cols-[minmax(0,56rem)_21rem]'

/** Centered TabbedForm max width below `2xl` (form cap + gap + preview rail). */
export const previewRailTabbedAsideGridMaxWidthBelow2xlClasses =
  'xl:max-w-[calc(56rem+1.5rem+280px)]'

/** Centered TabbedForm max width at `2xl` and above. */
export const previewRailTabbedAsideGridMaxWidthAt2xlClasses = '2xl:max-w-[calc(56rem+1.5rem+21rem)]'

/** Shared 12px muted copy below the preview header and in section chrome. */
export const previewRailCaptionTextClasses = 'text-xs text-muted-foreground'

export const previewRailSectionInsetVariants = cva('', {
  variants: {
    chrome: {
      card: 'px-4',
      plain: '',
    },
  },
  defaultVariants: {
    chrome: 'card',
  },
})

/** Inset below header content, above the full-width section border. */
export const previewRailHeaderSectionBottomInsetClasses = 'pb-[10px]'

/** Full-width shell below the title row; border omitted when Identity follows. */
export const previewRailHeaderSectionShellClasses = cn(
  'shrink-0 border-b border-border-subtle',
  previewRailHeaderSectionBottomInsetClasses,
  'has-[+[data-slot=preview-rail-identity]]:border-b-0 has-[+[data-slot=preview-rail-identity]]:pb-0',
)

/** Full-width shell terminating the header block (identity + optional title). */
export const previewRailIdentitySectionShellClasses = cn(
  'shrink-0 border-b border-border-subtle',
  previewRailHeaderSectionBottomInsetClasses,
)

/** Full-width shell above footer actions. */
export const previewRailFooterSectionShellClasses = 'shrink-0 border-t border-border-subtle'

export const previewRailRootVariants = cva('flex min-w-0 flex-col', {
  variants: {
    chrome: {
      card: cn(
        'w-full max-w-[280px] border border-border-subtle bg-field-container text-card-foreground 2xl:max-w-[21rem]',
        cardRadiusClasses,
        establishSurfaceCurrent('field-container'),
      ),
      plain: 'w-full',
    },
    sticky: {
      /** Fills a viewport-bounded aside column; internal ScrollRegion owns overflow. */
      true: 'h-full max-h-full min-h-0',
      false: '',
    },
  },
  defaultVariants: {
    chrome: 'card',
    sticky: false,
  },
})

export const previewRailHeaderRowClasses = 'flex items-center justify-between gap-2'

export const previewRailHeaderSectionContentClasses = 'pt-4'

export const previewRailIdentityStackClasses = 'flex flex-col gap-4'

export const previewRailIdentitySectionContentClasses = 'pt-4'

export const previewRailIdentityRowClasses = 'flex items-center gap-3'

/** Sections-only scroll body — header, identity, and footer stay put. */
export const previewRailScrollRegionShellClasses = 'min-h-0 flex-1'

export const previewRailScrollRegionContentClasses = 'pb-4 pt-4'

export const previewRailFooterClasses = 'flex flex-col gap-4 py-4'

export const previewRailIdentityContentClasses = 'min-w-0 flex-1'

export const previewRailDividerClasses = 'border-t border-border-subtle'

export const previewRailMediaFallbackVariants = cva(
  'flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
)

export const previewRailMediaIconClasses = iconGlyphRootClasses.lg

export const previewRailAvailabilityRowClasses = cn(
  'mt-1 flex min-w-0 items-center gap-1.5',
  previewRailCaptionTextClasses,
)

export const previewRailAvailabilityInactiveIconClasses = cn(
  iconGlyphRootClasses.md,
  'shrink-0 text-semantic-warning',
)

export const previewRailAvailabilityDetailSeparatorClasses = 'text-muted-foreground'

export const previewRailFactsGridClasses =
  'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-2'

export const previewRailFactsGridCompactClasses = 'gap-y-1.5'

export const previewRailFactLabelClasses = 'text-sm text-muted-foreground'

export const previewRailFactValueClasses = 'text-sm text-foreground'

export const previewRailFactCompactTextClasses = 'text-xs'

export const previewRailSectionsHeaderClasses = 'flex flex-col gap-1'

export const previewRailAccordionCardClasses =
  'overflow-hidden rounded-md border border-border-subtle'

export const previewRailAccordionItemClasses = 'border-b border-border-subtle last:border-b-0'

/** Tight inset for grouped-list accordion bodies (overrides default AccordionContent inner padding). */
export const previewRailAccordionContentClasses = '[&>div]:px-3 [&>div]:pb-3 [&>div]:pt-1'

export const previewRailSectionTriggerClasses =
  'flex flex-1 items-center justify-start gap-2 px-3 py-2.5 text-left text-sm font-body-emphasis hover:text-foreground/80 hover:no-underline'

/** Reserves chevron width on static section rows so status text aligns with expandable rows. */
export const previewRailSectionChevronSpacerClasses = 'size-4 shrink-0'

export const previewRailSectionStaticRowClasses = cn(
  previewRailSectionTriggerClasses,
  'w-full cursor-default hover:text-inherit',
)

export const previewRailSectionLabelClasses = 'min-w-0 shrink-0'

export const previewRailSectionStatusSpacerClasses = 'min-w-0 flex-1'

export const previewRailSectionBodyClasses =
  'flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-faint p-3'

export const previewRailSectionBodyDescriptionClasses = cn(
  'line-clamp-2',
  previewRailCaptionTextClasses,
)

export const previewRailStatusPanelDescriptionClasses = previewRailCaptionTextClasses

export const previewRailActionHelperTextClasses = previewRailCaptionTextClasses

export const previewRailStatusPanelContentClasses = 'min-w-0 flex-1'

export const previewRailActionStackClasses = 'flex flex-col gap-2'

export const previewRailActionButtonClasses = 'w-full'

export type PreviewRailRootVariantProps = {
  chrome?: 'card' | 'plain'
  sticky?: boolean
}
