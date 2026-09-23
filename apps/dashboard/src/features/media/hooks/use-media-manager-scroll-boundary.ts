import { useCallback, useMemo, useState } from 'react'
import type { ScrollBoundaryState } from '@rpg/ui'

type MediaManagerColumn = 'gallery' | 'workspace'

function boundaryStateChanged(
  previous: ScrollBoundaryState | undefined,
  next: ScrollBoundaryState,
): boolean {
  return (
    previous?.showTopShadow !== next.showTopShadow ||
    previous?.showBottomShadow !== next.showBottomShadow
  )
}

export function useMediaManagerScrollBoundary() {
  const [boundaryByColumn, setBoundaryByColumn] = useState<
    Partial<Record<MediaManagerColumn, ScrollBoundaryState>>
  >({})

  const updateColumnBoundary = useCallback(
    (column: MediaManagerColumn, state: ScrollBoundaryState) => {
      setBoundaryByColumn((current) => {
        if (!boundaryStateChanged(current[column], state)) {
          return current
        }

        return { ...current, [column]: state }
      })
    },
    [],
  )

  const onGalleryBoundaryChange = useCallback(
    (state: ScrollBoundaryState) => {
      updateColumnBoundary('gallery', state)
    },
    [updateColumnBoundary],
  )

  const onWorkspaceBoundaryChange = useCallback(
    (state: ScrollBoundaryState) => {
      updateColumnBoundary('workspace', state)
    },
    [updateColumnBoundary],
  )

  const headerScrolled = useMemo(
    () => Object.values(boundaryByColumn).some((state) => state?.showTopShadow),
    [boundaryByColumn],
  )

  return { headerScrolled, onGalleryBoundaryChange, onWorkspaceBoundaryChange }
}
