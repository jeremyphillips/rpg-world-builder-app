import { cn } from '@rpg/ui'

import { pageShellInsetTopClasses } from '@/components/layout/page/page-spacing.variants'

/** Flex fill body inside the builder page shell — caps height for PreviewRail fill + docked footer. */
export const characterBuilderPageShellBodyClasses = cn(
  'flex min-h-0 flex-1 flex-col',
  pageShellInsetTopClasses,
)
