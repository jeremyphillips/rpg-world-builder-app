import { cva } from 'class-variance-authority'

/** Full-height workspace root — fills the app-shell main column. */
export const messagesWorkspaceRootClasses = 'flex min-h-0 flex-1 flex-col gap-4'

export const messagesWorkspaceHeaderSectionClasses = 'flex shrink-0 flex-col gap-2'

export const messagesWorkspaceBodyClasses =
  'grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] md:gap-0 md:rounded-lg md:border md:border-border'

export const messagesWorkspaceLeftPaneClasses =
  'scrollbar-slim min-h-0 min-w-0 overflow-y-auto border-border md:border-r'

export const messagesWorkspaceRightPaneClasses =
  'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'

export const messagesWorkspaceRightScrollClasses =
  'scrollbar-slim min-h-0 flex-1 overflow-y-auto p-4'

export const messagesWorkspaceRightFooterClasses = 'shrink-0 border-t border-border p-4'

export const messagesWorkspaceThreadHeaderClasses = 'shrink-0 border-b border-border px-4 py-3'

export const messagesWorkspacePreviewEyebrowClasses = 'px-4 pt-3'

export const messagesWorkspaceListChromeInsetClasses = 'px-3'

export const messagesWorkspaceMessageGroupClasses = 'flex max-w-[85%] flex-col gap-1'

export const messagesWorkspaceMessageThreadClasses = 'flex flex-col gap-6'

export const messagesWorkspaceMessageBubbleClasses =
  'inline-block rounded-lg bg-muted px-3 py-2 text-left'

export const messagesWorkspaceMetadataClasses = 'text-xs text-muted-foreground'

export const messagesWorkspaceMessageGroupTimestampClasses = 'mt-1 block'

export const messagesWorkspaceDateSeparatorClasses = 'py-1 text-center'

export const conversationListRowVariants = cva(
  'flex items-start gap-3 px-3 py-3 transition-colors hover:bg-muted',
  {
    variants: {
      selected: {
        true: 'border-l-2 border-row-selected-border bg-row-selected hover:bg-row-selected',
        false: 'border-l-2 border-transparent',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
)

export const conversationListTitleUnreadClasses = 'font-body-emphasis'

export const messagesWorkspaceComposerTextareaClasses =
  'min-h-[2.5rem] max-h-40 resize-none overflow-y-auto'

export const messagesWorkspaceEmptyStateClasses =
  'flex min-h-0 flex-1 flex-col items-center justify-center p-6 text-center'

export const messagesWorkspaceScopeUtilityClasses =
  'flex flex-wrap items-center justify-between gap-2 text-muted-foreground'

export const messagesWorkspaceMobileBackClasses = 'mb-3 px-4 pt-4 md:hidden'

export const messagesWorkspaceScopeChromeMobileHiddenOnNewClasses = 'hidden md:contents'

export const messagesWorkspaceLeftPaneMobileHiddenClasses = 'hidden md:block'

export const messagesWorkspaceLeftPaneMobileVisibleClasses = 'block md:block'

export const messagesWorkspaceRightPaneMobileHiddenClasses = 'hidden md:flex'

export const messagesWorkspaceRightPaneMobileVisibleClasses = 'flex md:flex'
