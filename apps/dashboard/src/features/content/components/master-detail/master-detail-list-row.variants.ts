import { cardSurfaceVariants, cn, interactiveFocusVariants } from '@rpg/ui'

export function masterDetailListRowClasses(options: { isSelected: boolean }): string {
  return cn(
    'flex w-full items-center gap-2 border-0 text-left text-foreground',
    '[padding-block:var(--ui-card-inset-block)] [padding-inline:var(--ui-card-inset-inline)]',
    cardSurfaceVariants({
      tone: 'quiet',
      elevation: 'flat',
      density: 'compact',
      interactive: true,
      selected: options.isSelected,
    }),
    interactiveFocusVariants({ context: 'standalone' }),
  )
}
