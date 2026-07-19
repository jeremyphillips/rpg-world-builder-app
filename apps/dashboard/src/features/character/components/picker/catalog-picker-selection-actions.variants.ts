import { cn } from '@rpg/ui'

/** Quiet outline — card/shell surface shows through. */
export const catalogPickerSelectionAddButtonClasses = cn(
  'inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-border-subtle',
  'bg-transparent px-3 text-xs font-body-emphasis text-foreground shadow-none',
  'hover:bg-row-hover active:bg-surface-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-50',
)

export const catalogPickerSelectionRemoveButtonClasses = catalogPickerSelectionAddButtonClasses
