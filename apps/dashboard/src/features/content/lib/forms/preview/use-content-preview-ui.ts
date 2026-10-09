import { createContext, useContext } from 'react'

type ContentPreviewUiContextValue = {
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  playerOpen: boolean
  setPlayerOpen: (open: boolean) => void
}

export const ContentPreviewUiContext = createContext<ContentPreviewUiContextValue | null>(null)

export function useContentPreviewUi(): ContentPreviewUiContextValue {
  const value = useContext(ContentPreviewUiContext)
  if (!value) {
    throw new Error('useContentPreviewUi must be used within ContentPreviewUiProvider')
  }
  return value
}

export function useOptionalContentPreviewUi(): ContentPreviewUiContextValue | null {
  return useContext(ContentPreviewUiContext)
}
