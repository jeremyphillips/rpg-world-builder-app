import { useCallback, useRef, useState } from 'react'

import {
  areMediaImageTypesValid,
  canAcceptDraggedMediaFiles,
  isExternalFileDrag,
  readDraggedMediaFiles,
} from '../lib/media-upload.lib'

const BODY_DROP_REJECTED_MESSAGE = "These files can't be added."

export function useMediaManagerBodyDrop({
  onAdd,
  onReject,
  maxUploadBytes,
  disabled = false,
}: {
  onAdd: (files: File[]) => void
  onReject?: (message: string) => void
  maxUploadBytes?: number
  disabled?: boolean
}) {
  const depth = useRef(0)
  const [active, setActive] = useState(false)
  const [invalid, setInvalid] = useState(false)

  const reset = useCallback(() => {
    depth.current = 0
    setActive(false)
    setInvalid(false)
  }, [])

  const onDragEnter = useCallback(
    (event: React.DragEvent) => {
      if (disabled || !isExternalFileDrag(event.dataTransfer)) return
      event.preventDefault()
      depth.current += 1
      setActive(true)
      const dragValidity = canAcceptDraggedMediaFiles(event.dataTransfer, maxUploadBytes)
      setInvalid(dragValidity === false)
    },
    [disabled, maxUploadBytes],
  )

  const onDragLeave = useCallback(
    (event: React.DragEvent) => {
      if (disabled || !isExternalFileDrag(event.dataTransfer)) return
      depth.current = Math.max(0, depth.current - 1)
      if (depth.current === 0) reset()
    },
    [disabled, reset],
  )

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (disabled || !isExternalFileDrag(event.dataTransfer)) return
      event.preventDefault()
    },
    [disabled],
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (disabled || !isExternalFileDrag(event.dataTransfer)) return
      event.preventDefault()
      const files = readDraggedMediaFiles(event.dataTransfer)
      reset()
      if (!areMediaImageTypesValid(files)) {
        onReject?.(BODY_DROP_REJECTED_MESSAGE)
        return
      }
      onAdd(files)
    },
    [disabled, onAdd, onReject, reset],
  )

  return { active, invalid, onDragEnter, onDragLeave, onDragOver, onDrop }
}

export type UseMediaManagerBodyDropResult = ReturnType<typeof useMediaManagerBodyDrop>
