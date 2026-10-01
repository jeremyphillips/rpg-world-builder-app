import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'
import { ActionIcon, Button } from '@rpg/ui'

import { CharacterDetailPreviewModal } from '../../../components/detail/character-detail-preview-modal'
import type { QuickNpcCreateContext } from '../../lib/quick-npc/quick-npc-create-context'
import {
  QUICK_NPC_PREVIEW_NPC_HEADLINE,
  QUICK_NPC_PREVIEW_NPC_LABEL,
} from '../../lib/quick-npc/quick-npc-preview-copy'
import { projectQuickNpcDetailPreview } from '../../lib/quick-npc/quick-npc-detail-preview.lib'
import type {
  QuickNpcAuthoringTabFormValues,
  QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'

export type QuickNpcPreviewNpcButtonProps = {
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  setup: QuickNpcSetupValues
  authoringValues?: Partial<QuickNpcAuthoringTabFormValues>
  disabled?: boolean
  buttonRef?: React.RefObject<HTMLButtonElement | null>
}

export function QuickNpcPreviewNpcButton({
  buildContext,
  createContext,
  setup,
  authoringValues,
  disabled = false,
  buttonRef,
}: QuickNpcPreviewNpcButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [preview, setPreview] = React.useState<ReturnType<
    typeof projectQuickNpcDetailPreview
  > | null>(null)

  const handleOpen = () => {
    setPreview(
      projectQuickNpcDetailPreview({
        setup,
        authoringValues,
        buildContext,
        createContext,
      }),
    )
    setOpen(true)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      window.requestAnimationFrame(() => {
        buttonRef?.current?.focus()
      })
    }
  }

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={handleOpen}
      >
        <ActionIcon action="view" />
        {QUICK_NPC_PREVIEW_NPC_LABEL}
      </Button>
      {preview ? (
        <CharacterDetailPreviewModal
          open={open}
          onOpenChange={handleOpenChange}
          headline={QUICK_NPC_PREVIEW_NPC_HEADLINE}
          viewModel={preview.viewModel}
          completeness={preview.completeness}
        />
      ) : null}
    </>
  )
}
