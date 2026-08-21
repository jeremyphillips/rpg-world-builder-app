import { cn } from '@rpg/ui'

import { pageHeaderSectionGapClasses } from '@/components/layout/page/page-spacing.variants'

/** Full-height workspace root — fills the app-shell main column. */
export const messagesWorkspaceRootClasses = 'flex min-h-0 flex-1 flex-col gap-4'

export const messagesWorkspaceHeaderSectionClasses = cn(pageHeaderSectionGapClasses, 'shrink-0')

export const messagesWorkspaceBodyClasses =
  'grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] md:gap-0 md:rounded-lg md:border md:border-border'

export const messagesWorkspaceLeftPaneClasses =
  'scrollbar-slim min-h-0 min-w-0 overflow-y-auto border-border md:border-r'

export const messagesWorkspaceRightPaneClasses =
  'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'

export const messagesWorkspaceRightScrollClasses =
  'scrollbar-slim min-h-0 flex-1 overflow-y-auto p-4'

export const messagesWorkspaceRightFooterClasses = 'shrink-0 border-t border-border p-4'

export const messagesWorkspaceEmptyStateClasses =
  'flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center'

export const messagesWorkspaceSelectConversationHeadingClasses = 'font-bold text-foreground-subtle'

export const messagesWorkspaceScopeUtilityClasses =
  'flex flex-wrap items-center justify-between gap-2 text-muted-foreground'

export const messagesWorkspaceMobileBackClasses = 'mb-3 px-4 pt-4 md:hidden'

export const messagesWorkspaceScopeChromeMobileHiddenOnNewClasses = 'hidden md:contents'

export const messagesWorkspaceLeftPaneMobileHiddenClasses = 'hidden md:block'

export const messagesWorkspaceLeftPaneMobileVisibleClasses = 'block md:block'

export const messagesWorkspaceRightPaneMobileHiddenClasses = 'hidden md:flex'

export const messagesWorkspaceRightPaneMobileVisibleClasses = 'flex md:flex'
