'use client'

import type { ReactNode } from 'react'

import { Modal } from './modal.client'

export const DETAIL_PREVIEW_MODAL_CLOSE_LABEL = 'Close preview' as const

export type DetailPreviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: string
  children: ReactNode
}

/** Shared chrome for read-only detail previews (class, species, spell, character sheet). */
export function DetailPreviewModal({
  open,
  onOpenChange,
  headline,
  children,
}: DetailPreviewModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        size="xl"
        layout="stable"
        stableSize="tall"
        closeLabel={DETAIL_PREVIEW_MODAL_CLOSE_LABEL}
      >
        <Modal.Header headline={headline} />
        <Modal.Body>{children}</Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
