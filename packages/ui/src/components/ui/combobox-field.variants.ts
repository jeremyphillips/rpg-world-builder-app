import { cva } from 'class-variance-authority'

/** Popover panel wrapping the search field and scrollable option list. */
export const comboboxContentVariants = cva(
  'z-50 w-[var(--radix-popover-trigger-width)] rounded-md border border-border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
)

/** Search row pinned to the top of the combobox panel. */
export const comboboxSearchRowVariants = cva(
  'flex items-center gap-2 border-b border-border px-3 py-2',
)

/** Scrollable listbox region. */
export const comboboxListVariants = cva('max-h-60 overflow-y-auto p-1')

/** Individual selectable option row. */
export const comboboxOptionVariants = cva(
  'relative flex w-full cursor-default select-none items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none focus-visible:bg-accent focus-visible:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
)

/** Empty-state message when the filter matches nothing. */
export const comboboxEmptyVariants = cva('px-2 py-4 text-center text-sm text-muted-foreground')

/** Chip row shown below the trigger in multi-select mode. */
export const comboboxChipRowVariants = cva('flex flex-wrap gap-1.5 pt-2')
