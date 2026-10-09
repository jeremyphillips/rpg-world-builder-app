import { useMemo, useState, type ReactNode } from 'react'

import { ContentPreviewUiContext } from './use-content-preview-ui'

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
