import { cn } from '@rpg/ui'

export const EQUIPMENT_PICKER_ITEM_HEADER_NAME_CLASSES = 'text-sm font-medium text-foreground'

export const EQUIPMENT_PICKER_ITEM_HEADER_METADATA_CLASSES = 'text-xs text-muted-foreground'

export const equipmentPickerItemHeaderRowClasses = 'flex min-w-0 w-full items-start gap-3'

export const EQUIPMENT_PICKER_ITEM_HEADER_INFO_CLASSES = 'flex min-w-0 flex-1 flex-col gap-0.5'

export const EQUIPMENT_PICKER_ITEM_HEADER_FOOTER_META_CLASSES =
  'flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs'

export const EQUIPMENT_PICKER_ITEM_HEADER_KIND_CLASSES = 'text-muted-foreground'

/** Recommendation / source copy — slightly stronger than kind, not link blue. */
export const EQUIPMENT_PICKER_ITEM_HEADER_CALLOUT_INFO_CLASSES = 'text-foreground/75'

/** Proficiency and budget warnings — distinct but still subdued. */
export const EQUIPMENT_PICKER_ITEM_HEADER_CALLOUT_WARNING_CLASSES = 'text-foreground/80'

export const EQUIPMENT_PICKER_ITEM_HEADER_DIVIDER_CLASSES = 'text-muted-foreground'

export const EQUIPMENT_PICKER_ITEM_HEADER_COMMERCE_CLASSES =
  'flex shrink-0 items-center gap-2 self-center'

export const EQUIPMENT_PICKER_COMMERCE_PRICE_CLASSES =
  'shrink-0 text-xs tabular-nums text-muted-foreground'

export const EQUIPMENT_PICKER_COMMERCE_OWNED_CLASSES =
  'shrink-0 text-xs tabular-nums text-muted-foreground'

export const EQUIPMENT_PICKER_COMMERCE_ADDED_CLASSES = 'shrink-0 text-xs text-muted-foreground'

/** Quiet outline — card/shell surface shows through. */
export const equipmentPickerCommerceAddButtonClasses = cn(
  'inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-border/50',
  'bg-transparent px-3 text-xs font-body-emphasis text-foreground shadow-none',
  'hover:bg-muted/20 active:bg-muted/30',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-50',
)

/** Text action — 32px hit target without button chrome weight. */
export const equipmentPickerCommerceAddAnotherButtonClasses = cn(
  'inline-flex h-8 cursor-pointer items-center justify-center rounded-md px-2 text-xs font-body-emphasis',
  'bg-transparent text-foreground/80 hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-50',
)

export const equipmentPickerItemHeaderDisabledClasses = 'opacity-60'
