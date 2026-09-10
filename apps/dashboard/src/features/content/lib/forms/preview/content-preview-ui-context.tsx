import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type ContentPreviewUiContextValue = {
  sheetOpen: boolean
  setSheetOpen: (open: boolean) => void
  playerOpen: boolean
  setPlayerOpen: (open: boolean) => void
}

const ContentPreviewUiContext = createContext<ContentPreviewUiContextValue | null>(null)

export function ContentPreviewUiProvider({ children }: { children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const value = useMemo(
    () => ({ sheetOpen, setSheetOpen, playerOpen, setPlayerOpen }),
    [sheetOpen, playerOpen],
  )

  return (
    <ContentPreviewUiContext.Provider value={value}>{children}</ContentPreviewUiContext.Provider>
  )
}

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
